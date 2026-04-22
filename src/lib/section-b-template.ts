import type { AttestationCardType, SectionRoman } from "@prisma/client";

export const SECTION_B_ALLOWED_CARD_TYPES = [
  "TEACHER",
  "EDUCATOR",
  "DIRECTOR",
  "DEPUTY_DIRECTOR",
  "PSYCHOLOGIST_COUNSELOR",
  "REHABILITATOR_TRAINER",
] as const satisfies readonly AttestationCardType[];

export type SectionBTemplateCardType = (typeof SECTION_B_ALLOWED_CARD_TYPES)[number];

export const SECTION_B_CARD_TYPE_LABELS: Record<SectionBTemplateCardType, string> = {
  TEACHER: "Учител",
  EDUCATOR: "Възпитател",
  DIRECTOR: "Директор",
  DEPUTY_DIRECTOR: "Заместник-директор",
  PSYCHOLOGIST_COUNSELOR: "Психолог / П. съветник",
  REHABILITATOR_TRAINER: "Рехабилитатор, треньор...",
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

export type SectionBAdditionalCriteriaConfig = {
  title: string;
  sectionRoman: Extract<SectionRoman, "IV" | "V">;
};

const SECTION_B_ADDITIONAL_CRITERIA_CONFIG: Record<SectionBTemplateCardType, SectionBAdditionalCriteriaConfig> = {
  TEACHER: {
    title: "Критерии, определени от директора на институцията",
    sectionRoman: "IV",
  },
  EDUCATOR: {
    title: "Критерии, определени от директора на институцията",
    sectionRoman: "IV",
  },
  DIRECTOR: {
    title: "Критерии, определени от директора на работодателя",
    sectionRoman: "V",
  },
  DEPUTY_DIRECTOR: {
    title: "Критерии, определени от директора на институцията",
    sectionRoman: "IV",
  },
  PSYCHOLOGIST_COUNSELOR: {
    title: "Критерии, определени от директора на институцията",
    sectionRoman: "IV",
  },
  REHABILITATOR_TRAINER: {
    title: "Критерии, определени от директора на институцията",
    sectionRoman: "IV",
  },
};

export function getSectionBAdditionalCriteriaConfig(cardType: SectionBTemplateCardType) {
  return SECTION_B_ADDITIONAL_CRITERIA_CONFIG[cardType];
}

export type SectionBCustomQuestionInput = {
  prompt: string;
  sectionRoman?: SectionRoman;
  scoreMethodology1?: string;
  scoreMethodology1_5?: string;
  scoreMethodology2?: string;
};

export type SectionBTemplateInput = {
  name: string;
  cardType: SectionBTemplateCardType;
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

export function getCustomQuestionsValidationError(questions: SectionBCustomQuestionInput[]) {
  if (questions.length > 5) {
    return "Позволени са най-много 5 custom въпроса.";
  }

  for (let index = 0; index < questions.length; index += 1) {
    const question = questions[index];

    const prompt = normalizeTemplateText(question?.prompt);
    const scoreMethodology1 = normalizeTemplateText(question?.scoreMethodology1);
    const scoreMethodology1_5 = normalizeTemplateText(question?.scoreMethodology1_5);
    const scoreMethodology2 = normalizeTemplateText(question?.scoreMethodology2);

    if (!prompt && (scoreMethodology1 || scoreMethodology1_5 || scoreMethodology2)) {
      return `Custom въпрос ${index + 1} има методика, но няма текст.`;
    }
  }

  return null;
}

export function normalizeCustomQuestions(questions: SectionBCustomQuestionInput[]) {
  return questions
    .map((question) => ({
      prompt: normalizeTemplateText(question.prompt),
      sectionRoman: question.sectionRoman ?? "IV",
      scoreMethodology1: normalizeTemplateText(question.scoreMethodology1),
      scoreMethodology1_5: normalizeTemplateText(question.scoreMethodology1_5),
      scoreMethodology2: normalizeTemplateText(question.scoreMethodology2),
    }))
    .slice(0, 5);
}
