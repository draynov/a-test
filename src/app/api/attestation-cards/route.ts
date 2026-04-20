import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  getExperienceYearsValidationError,
  getQualificationAmountValidationError,
  getProfessionalQualificationValidationError,
  parseExperienceYears,
  parseQualificationAmount,
  professionalQualificationDbValueToLabel,
  professionalQualificationLabelToDbValue,
  getBaseSpecialtyValidationError,
  normalizeBaseSpecialty,
  educationDbValueToLabel,
  educationLabelToDbValue,
  type AttestationCardFormData,
  type EducationLevel,
  type ProfessionalQualification,
} from "@/lib/attestation-card";
import { prisma } from "@/lib/prisma";

function serializeCard(card: {
  id: string;
  firstInitial: string;
  otherAfterInitial: string | null;
  baseSpecialty: string | null;
  hasTeacherQualification: boolean;
  hasAdditionalQualification: boolean;
  latestProfessionalQualification: string | null;
  laborExperienceYears: number;
  teachingExperienceYears: number;
  internalQualificationHours: number;
  mandatoryQualificationHours: number;
  mandatoryQualificationCredits: number;
  recommendationsImplemented: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: card.id,
    firstInitial: educationDbValueToLabel(card.firstInitial as keyof typeof educationDbValueToLabel),
    otherAfterInitial: card.otherAfterInitial
      ? educationDbValueToLabel(card.otherAfterInitial as keyof typeof educationDbValueToLabel)
      : null,
    baseSpecialty: card.baseSpecialty,
    hasTeacherQualification: card.hasTeacherQualification,
    hasAdditionalQualification: card.hasAdditionalQualification,
    latestProfessionalQualification: card.latestProfessionalQualification
      ? professionalQualificationDbValueToLabel(
          card.latestProfessionalQualification as keyof typeof professionalQualificationDbValueToLabel,
        )
      : null,
    laborExperienceYears: card.laborExperienceYears,
    teachingExperienceYears: card.teachingExperienceYears,
    internalQualificationHours: card.internalQualificationHours,
    mandatoryQualificationHours: card.mandatoryQualificationHours,
    mandatoryQualificationCredits: card.mandatoryQualificationCredits,
    recommendationsImplemented: card.recommendationsImplemented,
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
  };
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cards = await prisma.attestationCard.findMany({
    orderBy: {
      updatedAt: "desc",
    },
  });

  return NextResponse.json({
    cards: cards.map(serializeCard),
  });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await request.text();
  const body = rawBody ? (JSON.parse(rawBody) as Partial<AttestationCardFormData>) : {};

  const firstInitialLabel = (body.firstInitial as EducationLevel | undefined) ?? "Средно образование";
  const firstInitial = educationLabelToDbValue(firstInitialLabel);
  const otherAfterInitial = body.otherAfterInitial
    ? educationLabelToDbValue(body.otherAfterInitial as EducationLevel)
    : null;
  const baseSpecialtyError = getBaseSpecialtyValidationError(body.baseSpecialty);

  if (baseSpecialtyError) {
    return NextResponse.json({ error: baseSpecialtyError }, { status: 400 });
  }

  const baseSpecialty = normalizeBaseSpecialty(body.baseSpecialty);
  const hasTeacherQualification = Boolean(body.hasTeacherQualification);
  const hasAdditionalQualification = Boolean(body.hasAdditionalQualification);
  const professionalQualificationError = getProfessionalQualificationValidationError(
    body.latestProfessionalQualification as ProfessionalQualification | "" | undefined,
  );

  if (professionalQualificationError) {
    return NextResponse.json({ error: professionalQualificationError }, { status: 400 });
  }

  const laborExperienceYearsError = getExperienceYearsValidationError(
    "Поле 4.1 години трудов стаж",
    body.laborExperienceYears,
  );

  if (laborExperienceYearsError) {
    return NextResponse.json({ error: laborExperienceYearsError }, { status: 400 });
  }

  const teachingExperienceYearsError = getExperienceYearsValidationError(
    "Поле 4.2 години учителски стаж",
    body.teachingExperienceYears,
  );

  if (teachingExperienceYearsError) {
    return NextResponse.json({ error: teachingExperienceYearsError }, { status: 400 });
  }

  const latestProfessionalQualification = professionalQualificationLabelToDbValue(
    body.latestProfessionalQualification as ProfessionalQualification,
  );
  const laborExperienceYears = parseExperienceYears(body.laborExperienceYears);
  const teachingExperienceYears = parseExperienceYears(body.teachingExperienceYears);
  const internalQualificationHoursError = getQualificationAmountValidationError(
    "Поле 5.1 академични часове",
    body.internalQualificationHours,
  );

  if (internalQualificationHoursError) {
    return NextResponse.json({ error: internalQualificationHoursError }, { status: 400 });
  }

  const mandatoryQualificationHoursError = getQualificationAmountValidationError(
    "Поле 5.2 академични часове",
    body.mandatoryQualificationHours,
  );

  if (mandatoryQualificationHoursError) {
    return NextResponse.json({ error: mandatoryQualificationHoursError }, { status: 400 });
  }

  const mandatoryQualificationCreditsError = getQualificationAmountValidationError(
    "Поле 5.2 квалификационни кредити",
    body.mandatoryQualificationCredits,
  );

  if (mandatoryQualificationCreditsError) {
    return NextResponse.json({ error: mandatoryQualificationCreditsError }, { status: 400 });
  }

  const internalQualificationHours = parseQualificationAmount(body.internalQualificationHours);
  const mandatoryQualificationHours = parseQualificationAmount(body.mandatoryQualificationHours);
  const mandatoryQualificationCredits = parseQualificationAmount(body.mandatoryQualificationCredits);
  const recommendationsImplemented = Boolean(body.recommendationsImplemented);

  const createdCard = await prisma.attestationCard.create({
    data: {
      firstInitial,
      otherAfterInitial,
      baseSpecialty,
      hasTeacherQualification,
      hasAdditionalQualification,
      latestProfessionalQualification,
      laborExperienceYears,
      teachingExperienceYears,
      internalQualificationHours,
      mandatoryQualificationHours,
      mandatoryQualificationCredits,
      recommendationsImplemented,
    },
  });

  return NextResponse.json(
    {
      card: serializeCard(createdCard),
    },
    { status: 201 },
  );
}
