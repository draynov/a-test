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

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const cardType = url.searchParams.get("cardType") ?? "TEACHER";
  const requestedInstitutionId = url.searchParams.get("institutionId") ?? undefined;

  if (!isAllowedCardType(cardType)) {
    return NextResponse.json({ error: "Невалиден тип карта." }, { status: 400 });
  }

  let institutionId = requestedInstitutionId;

  if (session.user.role === "TECHNICAL_SECRETARY") {
    const ownInstitution = await prisma.institution.findFirst({
      where: { createdBy: session.user.id },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });

    if (!ownInstitution) {
      return NextResponse.json({ templates: [], systemQuestions: [] });
    }

    institutionId = ownInstitution.id;
  }

  const [templates, systemQuestions] = await Promise.all([
    prisma.sectionBTemplate.findMany({
      where: {
        cardType,
        ...(institutionId ? { institutionId } : {}),
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
      orderBy: { updatedAt: "desc" },
    }),
    prisma.sectionBSystemQuestion.findMany({
      where: { cardType },
      orderBy: { displayOrder: "asc" },
    }),
  ]);

  return NextResponse.json({
    templates,
    systemQuestions,
  });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "TECHNICAL_SECRETARY" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Нямаш права да управляваш шаблони." }, { status: 403 });
  }

  const rawBody = await request.text();
  const body = rawBody ? (JSON.parse(rawBody) as Partial<SectionBTemplateInput>) : {};
  const cardType = body.cardType ?? "TEACHER";
  const institutionId = body.institutionId?.trim();

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

  const existingTemplate = await prisma.sectionBTemplate.findFirst({
    where: {
      name: normalizeTemplateName(body.name),
      cardType,
      institutionId,
    },
  });

  if (existingTemplate) {
    return NextResponse.json({ error: "Шаблон с такова име вече съществува." }, { status: 409 });
  }

  const createdTemplate = await prisma.sectionBTemplate.create({
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

  return NextResponse.json({ template: createdTemplate }, { status: 201 });
}