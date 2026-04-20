export const educationOptions = [
  "Средно образование",
  "Професионален бакалавър",
  "Бакалавър",
  "Магистър",
  "Доктор",
  "Доктор на науките",
] as const;

export const professionalQualificationOptions = ["V ПКС", "IV ПКС", "III ПКС", "II ПКС", "I ПКС"] as const;

export type EducationLevel = (typeof educationOptions)[number];
export type ProfessionalQualification = (typeof professionalQualificationOptions)[number];

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

export const professionalQualificationToDbValue = {
  "V ПКС": "V_PKS",
  "IV ПКС": "IV_PKS",
  "III ПКС": "III_PKS",
  "II ПКС": "II_PKS",
  "I ПКС": "I_PKS",
} as const;

export const professionalQualificationFromDbValue = {
  V_PKS: "V ПКС",
  IV_PKS: "IV ПКС",
  III_PKS: "III ПКС",
  II_PKS: "II ПКС",
  I_PKS: "I ПКС",
} as const;

export type EducationLevelDb = keyof typeof educationLevelFromDbValue;
export type ProfessionalQualificationDb = keyof typeof professionalQualificationFromDbValue;

export const BASE_SPECIALTY_MAX_LENGTH = 255;
export const EXPERIENCE_YEARS_MIN = 0;
export const EXPERIENCE_YEARS_MAX = 99;
export const QUALIFICATION_HOURS_MIN = 0;
export const QUALIFICATION_HOURS_MAX = 999;

export type AttestationCardFormData = {
  firstInitial: EducationLevel | "";
  otherAfterInitial: EducationLevel | "";
  baseSpecialty: string;
  hasTeacherQualification: boolean;
  hasAdditionalQualification: boolean;
  latestProfessionalQualification: ProfessionalQualification | "";
  laborExperienceYears: number;
  teachingExperienceYears: number;
  internalQualificationHours: number;
  mandatoryQualificationHours: number;
  mandatoryQualificationCredits: number;
  recommendationsImplemented: boolean;
};

export type AttestationCardRecord = {
  id: string;
  firstInitial: EducationLevel;
  otherAfterInitial: EducationLevel | null;
  baseSpecialty: string | null;
  hasTeacherQualification: boolean;
  hasAdditionalQualification: boolean;
  latestProfessionalQualification: ProfessionalQualification | null;
  laborExperienceYears: number;
  teachingExperienceYears: number;
  internalQualificationHours: number;
  mandatoryQualificationHours: number;
  mandatoryQualificationCredits: number;
  recommendationsImplemented: boolean;
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
    latestProfessionalQualification: "",
    laborExperienceYears: 0,
    teachingExperienceYears: 0,
    internalQualificationHours: 0,
    mandatoryQualificationHours: 0,
    mandatoryQualificationCredits: 0,
    recommendationsImplemented: false,
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

export function getProfessionalQualificationValidationError(
  value: ProfessionalQualification | "" | null | undefined,
): string | null {
  if (!value) {
    return "Поле 3 е задължително.";
  }

  return null;
}

export function parseExperienceYears(value: unknown): number {
  const numeric = Number(value);

  if (!Number.isInteger(numeric) || numeric < EXPERIENCE_YEARS_MIN || numeric > EXPERIENCE_YEARS_MAX) {
    return NaN;
  }

  return numeric;
}

export function getExperienceYearsValidationError(label: string, value: unknown): string | null {
  const parsedValue = parseExperienceYears(value);

  if (Number.isNaN(parsedValue)) {
    return `${label} трябва да е цяло число от 0 до 99.`;
  }

  return null;
}

export function parseQualificationAmount(value: unknown): number {
  const numeric = Number(value);

  if (!Number.isInteger(numeric) || numeric < QUALIFICATION_HOURS_MIN || numeric > QUALIFICATION_HOURS_MAX) {
    return NaN;
  }

  return numeric;
}

export function getQualificationAmountValidationError(label: string, value: unknown): string | null {
  const parsedValue = parseQualificationAmount(value);

  if (Number.isNaN(parsedValue)) {
    return `${label} трябва да е цяло число от 0 до 999.`;
  }

  return null;
}

export function educationLabelToDbValue(label: EducationLevel): EducationLevelDb {
  return educationLevelToDbValue[label];
}

export function educationDbValueToLabel(value: EducationLevelDb): EducationLevel {
  return educationLevelFromDbValue[value];
}

export function professionalQualificationLabelToDbValue(
  label: ProfessionalQualification,
): ProfessionalQualificationDb {
  return professionalQualificationToDbValue[label];
}

export function professionalQualificationDbValueToLabel(
  value: ProfessionalQualificationDb,
): ProfessionalQualification {
  return professionalQualificationFromDbValue[value];
}

