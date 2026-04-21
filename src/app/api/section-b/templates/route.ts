import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  SECTION_B_ALLOWED_CARD_TYPES,
  getCustomQuestionsValidationError,
  getScoreMethodologyValidationError,
  getTemplateNameValidationError,
  normalizeCustomQuestions,
  normalizeTemplateName,
  normalizeTemplateText,
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

  if (!isAllowedCardType(cardType)) {
    return NextResponse.json({ error: "Невалиден тип карта." }, { status: 400 });
  }

  const [templates, systemQuestions] = await Promise.all([
    prisma.sectionBTemplate.findMany({
      where: { cardType },
      include: {
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

  if (!isAllowedCardType(cardType)) {
    return NextResponse.json({ error: "Невалиден тип карта." }, { status: 400 });
  }

  const nameError = getTemplateNameValidationError(body.name);

  if (nameError) {
    return NextResponse.json({ error: nameError }, { status: 400 });
  }

  const methodology1Error = getScoreMethodologyValidationError(body.scoreMethodology1, "Методика за 1");

  if (methodology1Error) {
    return NextResponse.json({ error: methodology1Error }, { status: 400 });
  }

  const methodology15Error = getScoreMethodologyValidationError(body.scoreMethodology1_5, "Методика за 1.5");

  if (methodology15Error) {
    return NextResponse.json({ error: methodology15Error }, { status: 400 });
  }

  const methodology2Error = getScoreMethodologyValidationError(body.scoreMethodology2, "Методика за 2");

  if (methodology2Error) {
    return NextResponse.json({ error: methodology2Error }, { status: 400 });
  }

  const customQuestions = normalizeCustomQuestions(body.customQuestions ?? []);
  const customQuestionsError = getCustomQuestionsValidationError(customQuestions);

  if (customQuestionsError) {
    return NextResponse.json({ error: customQuestionsError }, { status: 400 });
  }

  const existingTemplate = await prisma.sectionBTemplate.findFirst({
    where: {
      name: normalizeTemplateName(body.name),
      cardType,
    },
  });

  if (existingTemplate) {
    return NextResponse.json({ error: "Шаблон с такова име вече съществува." }, { status: 409 });
  }

  const createdTemplate = await prisma.sectionBTemplate.create({
    data: {
      name: normalizeTemplateName(body.name),
      cardType,
      scoreMethodology1: normalizeTemplateText(body.scoreMethodology1),
      scoreMethodology1_5: normalizeTemplateText(body.scoreMethodology1_5),
      scoreMethodology2: normalizeTemplateText(body.scoreMethodology2),
      customQuestions: {
        create: customQuestions.map((question, index) => ({
          sectionRoman: question.sectionRoman ?? "IV",
          questionCode: `IV.${index + 1}`,
          prompt: question.prompt,
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

  return NextResponse.json({ template: createdTemplate }, { status: 201 });
}