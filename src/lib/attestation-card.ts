export const educationOptions = [
  "Средно образование",
  "Професионален бакалавър",
  "Бакалавър",
  "Магистър",
  "Доктор",
  "Доктор на науките",
] as const;

export type EducationLevel = (typeof educationOptions)[number];

export const educationLevelToDbValue = {
  "Средно образование": "SCHOOL",
  "Професионален бакалавър": "PROFESSIONAL_BACHELOR",
  "Бакалавър": "BACHELOR",
  "Магистър": "MASTER",
  "Доктор": "DOCTOR",
  "Доктор на науките": "DOCTOR_OF_SCIENCES",
} as const;

export const educationLevelFromDbValue = {
  SCHOOL: "Средно образование",
  PROFESSIONAL_BACHELOR: "Професионален бакалавър",
  BACHELOR: "Бакалавър",
  MASTER: "Магистър",
  DOCTOR: "Доктор",
  DOCTOR_OF_SCIENCES: "Доктор на науките",
} as const;

export type EducationLevelDb = keyof typeof educationLevelFromDbValue;

export const BASE_SPECIALTY_MAX_LENGTH = 255;

export type AttestationCardFormData = {
  firstInitial: EducationLevel | "";
  otherAfterInitial: EducationLevel | "";
  baseSpecialty: string;
  hasTeacherQualification: boolean;
  hasAdditionalQualification: boolean;
};

export type AttestationCardRecord = {
  id: string;
  firstInitial: EducationLevel;
  otherAfterInitial: EducationLevel | null;
  baseSpecialty: string | null;
  hasTeacherQualification: boolean;
  hasAdditionalQualification: boolean;
  createdAt: string;
  updatedAt: string;
};

export function createEmptyAttestationCardForm(): AttestationCardFormData {
  return {
    firstInitial: "",
    otherAfterInitial: "",
    baseSpecialty: "",
    hasTeacherQualification: false,
    hasAdditionalQualification: false,
  };
}

export function normalizeBaseSpecialty(value: string | null | undefined): string {
  return (value ?? "").trim();
}

export function getBaseSpecialtyValidationError(value: string | null | undefined): string | null {
  const normalized = normalizeBaseSpecialty(value);

  if (!normalized) {
    return "Поле 2.1 е задължително.";
  }

  if (normalized.length > BASE_SPECIALTY_MAX_LENGTH) {
    return "Поле 2.1 трябва да е до 255 символа.";
  }

  return null;
}

export function educationLabelToDbValue(label: EducationLevel): EducationLevelDb {
  return educationLevelToDbValue[label];
}

export function educationDbValueToLabel(value: EducationLevelDb): EducationLevel {
  return educationLevelFromDbValue[value];
}

