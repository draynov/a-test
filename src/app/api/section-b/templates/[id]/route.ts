import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  SECTION_B_ALLOWED_CARD_TYPES,
  getSectionBAdditionalCriteriaConfig,
  getCustomQuestionsValidationError,
  getTemplateNameValidationError,
  normalizeCustomQuestions,
  normalizeTemplateName,
  type SectionBTemplateInput,
} from "@/lib/section-b-template";

function isAllowedCardType(cardType: string | undefined): cardType is SectionBTemplateInput["cardType"] {
  return Boolean(cardType && SECTION_B_ALLOWED_CARD_TYPES.includes(cardType as SectionBTemplateInput["cardType"]));
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const template = await prisma.sectionBTemplate.findUnique({
    where: { id },
    include: {
      institution: {
        select: {
          id: true,
          name: true,
          createdBy: true,
        },
      },
      customQuestions: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  if (!template) {
    return NextResponse.json({ error: "Шаблонът не е намерен." }, { status: 404 });
  }

  if (session.user.role === "TECHNICAL_SECRETARY" && template.institution?.createdBy !== session.user.id) {
    return NextResponse.json({ error: "Нямаш достъп до този шаблон." }, { status: 403 });
  }

  return NextResponse.json({ template });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "TECHNICAL_SECRETARY" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Нямаш права да управляваш шаблони." }, { status: 403 });
  }

  const { id } = await params;
  const existingTemplate = await prisma.sectionBTemplate.findUnique({
    where: { id },
    include: {
      institution: {
        select: {
          id: true,
          createdBy: true,
        },
      },
      customQuestions: true,
    },
  });

  if (!existingTemplate) {
    return NextResponse.json({ error: "Шаблонът не е намерен." }, { status: 404 });
  }

  if (session.user.role === "TECHNICAL_SECRETARY" && existingTemplate.institution?.createdBy !== session.user.id) {
    return NextResponse.json({ error: "Нямаш достъп до този шаблон." }, { status: 403 });
  }

  const rawBody = await request.text();
  const body = rawBody ? (JSON.parse(rawBody) as Partial<SectionBTemplateInput>) : {};
  const cardType = body.cardType ?? existingTemplate.cardType;
  const institutionId = body.institutionId?.trim() ?? existingTemplate.institutionId ?? "";

  if (!isAllowedCardType(cardType)) {
    return NextResponse.json({ error: "Невалиден тип карта." }, { status: 400 });
  }

  if (!institutionId) {
    return NextResponse.json({ error: "Институцията е задължителна." }, { status: 400 });
  }

  const institution = await prisma.institution.findUnique({
    where: { id: institutionId },
    select: { id: true, createdBy: true },
  });

  if (!institution) {
    return NextResponse.json({ error: "Избраната институция не е намерена." }, { status: 404 });
  }

  if (session.user.role === "TECHNICAL_SECRETARY" && institution.createdBy !== session.user.id) {
    return NextResponse.json({ error: "Нямаш права за тази институция." }, { status: 403 });
  }

  const nameError = getTemplateNameValidationError(body.name);

  if (nameError) {
    return NextResponse.json({ error: nameError }, { status: 400 });
  }

  const customQuestions = normalizeCustomQuestions(body.customQuestions ?? []);
  const customQuestionsError = getCustomQuestionsValidationError(customQuestions);
  const additionalCriteriaConfig = getSectionBAdditionalCriteriaConfig(cardType);

  if (customQuestionsError) {
    return NextResponse.json({ error: customQuestionsError }, { status: 400 });
  }

  const updatedTemplate = await prisma.$transaction(async (transaction) => {
    await transaction.sectionBCustomQuestion.deleteMany({
      where: { templateId: id },
    });

    return transaction.sectionBTemplate.update({
      where: { id },
      data: {
        name: normalizeTemplateName(body.name),
        cardType,
        institutionId,
        customQuestions: {
          create: customQuestions
            .filter((question) => question.prompt.length > 0)
            .map((question, index) => ({
              sectionRoman: question.sectionRoman ?? additionalCriteriaConfig.sectionRoman,
              questionCode: `${additionalCriteriaConfig.sectionRoman}.${index + 1}`,
              prompt: question.prompt,
              scoreMethodology1: question.scoreMethodology1,
              scoreMethodology1_5: question.scoreMethodology1_5,
              scoreMethodology2: question.scoreMethodology2,
              displayOrder: index + 1,
            })),
        },
      },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
          },
        },
        customQuestions: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });
  });

  return NextResponse.json({ template: updatedTemplate });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "TECHNICAL_SECRETARY" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Нямаш права да управляваш шаблони." }, { status: 403 });
  }

  const { id } = await params;

  const template = await prisma.sectionBTemplate.findUnique({
    where: { id },
    include: {
      institution: {
        select: {
          createdBy: true,
        },
      },
    },
  });

  if (!template) {
    return NextResponse.json({ error: "Шаблонът не е намерен." }, { status: 404 });
  }

  if (session.user.role === "TECHNICAL_SECRETARY" && template.institution?.createdBy !== session.user.id) {
    return NextResponse.json({ error: "Нямаш достъп до този шаблон." }, { status: 403 });
  }

  await prisma.sectionBTemplate.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}