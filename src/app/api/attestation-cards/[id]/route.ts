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

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const card = await prisma.attestationCard.findUnique({
    where: { id },
  });

  if (!card) {
    return NextResponse.json({ error: "Записът не е намерен." }, { status: 404 });
  }

  return NextResponse.json({
    card: serializeCard(card),
  });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as AttestationCardFormData;

  if (!body.firstInitial) {
    return NextResponse.json({ error: "Поле 1.1 е задължително." }, { status: 400 });
  }

  const baseSpecialtyError = getBaseSpecialtyValidationError(body.baseSpecialty);

  if (baseSpecialtyError) {
    return NextResponse.json({ error: baseSpecialtyError }, { status: 400 });
  }

  const professionalQualificationError = getProfessionalQualificationValidationError(
    body.latestProfessionalQualification as ProfessionalQualification | "",
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

  const existingCard = await prisma.attestationCard.findUnique({
    where: { id },
  });

  if (!existingCard) {
    return NextResponse.json({ error: "Записът не е намерен." }, { status: 404 });
  }

  const updatedCard = await prisma.attestationCard.update({
    where: { id },
    data: {
      firstInitial: educationLabelToDbValue(body.firstInitial as EducationLevel),
      otherAfterInitial: body.otherAfterInitial
        ? educationLabelToDbValue(body.otherAfterInitial as EducationLevel)
        : null,
      baseSpecialty: normalizeBaseSpecialty(body.baseSpecialty),
      hasTeacherQualification: Boolean(body.hasTeacherQualification),
      hasAdditionalQualification: Boolean(body.hasAdditionalQualification),
      latestProfessionalQualification: professionalQualificationLabelToDbValue(
        body.latestProfessionalQualification as ProfessionalQualification,
      ),
      laborExperienceYears: parseExperienceYears(body.laborExperienceYears),
      teachingExperienceYears: parseExperienceYears(body.teachingExperienceYears),
      internalQualificationHours: parseQualificationAmount(body.internalQualificationHours),
      mandatoryQualificationHours: parseQualificationAmount(body.mandatoryQualificationHours),
      mandatoryQualificationCredits: parseQualificationAmount(body.mandatoryQualificationCredits),
      recommendationsImplemented: Boolean(body.recommendationsImplemented),
    },
  });

  return NextResponse.json({
    card: serializeCard(updatedCard),
  });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.attestationCard.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
