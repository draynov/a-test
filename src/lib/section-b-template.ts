import type { AttestationCardType, SectionRoman } from "@prisma/client";

export const SECTION_B_ALLOWED_CARD_TYPES = [
  "TEACHER",
  "EDUCATOR",
  "DIRECTOR",
  "DEPUTY_DIRECTOR",
  "PSYCHOLOGIST_COUNSELOR",
] as const satisfies readonly AttestationCardType[];

export type SectionBTemplateCardType = (typeof SECTION_B_ALLOWED_CARD_TYPES)[number];

export const SECTION_B_CARD_TYPE_LABELS: Record<SectionBTemplateCardType, string> = {
  TEACHER: "Учител",
  EDUCATOR: "Възпитател",
  DIRECTOR: "Директор",
  DEPUTY_DIRECTOR: "Заместник-директор",
  PSYCHOLOGIST_COUNSELOR: "Психолог и педагогически съветник",
};

export type SectionBCardTypeOption = {
  value: SectionBTemplateCardType;
  label: string;
};

export const SECTION_B_CARD_TYPE_OPTIONS: readonly SectionBCardTypeOption[] = SECTION_B_ALLOWED_CARD_TYPES.map((value) => ({
  value,
  label: SECTION_B_CARD_TYPE_LABELS[value],
}));

export function getSectionBCardTypeLabel(cardType: SectionBTemplateCardType) {
  return SECTION_B_CARD_TYPE_LABELS[cardType];
}

export type SectionBCustomQuestionInput = {
  prompt: string;
  sectionRoman?: SectionRoman;
};

export type SectionBTemplateInput = {
  name: string;
  cardType: SectionBTemplateCardType;
  scoreMethodology1: string;
  scoreMethodology1_5: string;
  scoreMethodology2: string;
  customQuestions: SectionBCustomQuestionInput[];
};

export function normalizeTemplateName(value: string | undefined) {
  return value?.trim() ?? "";
}

export function normalizeTemplateText(value: string | undefined) {
  return value?.trim() ?? "";
}

export function getTemplateNameValidationError(value: string | undefined) {
  if (!normalizeTemplateName(value)) {
    return "Името на шаблона е задължително.";
  }

  return null;
}

export function getScoreMethodologyValidationError(value: string | undefined, label: string) {
  if (!normalizeTemplateText(value)) {
    return `${label} е задължителна.`;
  }

  return null;
}

export function getCustomQuestionsValidationError(questions: SectionBCustomQuestionInput[]) {
  if (questions.length > 5) {
    return "Позволени са най-много 5 custom въпроса.";
  }

  for (let index = 0; index < questions.length; index += 1) {
    const question = questions[index];

    if (!normalizeTemplateText(question?.prompt)) {
      return `Custom въпрос ${index + 1} е задължителен.`;
    }
  }

  return null;
}

export function normalizeCustomQuestions(questions: SectionBCustomQuestionInput[]) {
  return questions
    .map((question) => ({
      prompt: normalizeTemplateText(question.prompt),
      sectionRoman: question.sectionRoman ?? "IV",
    }))
    .filter((question) => question.prompt.length > 0);
}
