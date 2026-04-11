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

export type AttestationCardFormData = {
  firstInitial: EducationLevel | "";
  otherAfterInitial: EducationLevel | "";
};

export type AttestationCardRecord = {
  id: string;
  firstInitial: EducationLevel;
  otherAfterInitial: EducationLevel | null;
  createdAt: string;
  updatedAt: string;
};

export function createEmptyAttestationCardForm(): AttestationCardFormData {
  return {
    firstInitial: "",
    otherAfterInitial: "",
  };
}

export function educationLabelToDbValue(label: EducationLevel): EducationLevelDb {
  return educationLevelToDbValue[label];
}

export function educationDbValueToLabel(value: EducationLevelDb): EducationLevel {
  return educationLevelFromDbValue[value];
}

