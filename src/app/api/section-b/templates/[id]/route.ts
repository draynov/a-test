import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  SECTION_B_ALLOWED_CARD_TYPES,
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
      customQuestions: {
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  if (!template) {
    return NextResponse.json({ error: "Шаблонът не е намерен." }, { status: 404 });
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
      customQuestions: true,
    },
  });

  if (!existingTemplate) {
    return NextResponse.json({ error: "Шаблонът не е намерен." }, { status: 404 });
  }

  const rawBody = await request.text();
  const body = rawBody ? (JSON.parse(rawBody) as Partial<SectionBTemplateInput>) : {};
  const cardType = body.cardType ?? existingTemplate.cardType;

  if (!isAllowedCardType(cardType)) {
    return NextResponse.json({ error: "Невалиден тип карта." }, { status: 400 });
  }

  const nameError = getTemplateNameValidationError(body.name);

  if (nameError) {
    return NextResponse.json({ error: nameError }, { status: 400 });
  }

  const customQuestions = normalizeCustomQuestions(body.customQuestions ?? []);
  const customQuestionsError = getCustomQuestionsValidationError(customQuestions);

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
        customQuestions: {
          create: customQuestions
            .filter((question) => question.prompt.length > 0)
            .map((question, index) => ({
            sectionRoman: question.sectionRoman ?? "IV",
            questionCode: `IV.${index + 1}`,
            prompt: question.prompt,
            scoreMethodology1: question.scoreMethodology1,
            scoreMethodology1_5: question.scoreMethodology1_5,
            scoreMethodology2: question.scoreMethodology2,
            displayOrder: index + 1,
            })),
        },
      },
      include: {
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

  await prisma.sectionBTemplate.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}