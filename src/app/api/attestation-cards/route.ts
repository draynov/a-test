import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  getExperienceYearsValidationError,
  getProfessionalQualificationValidationError,
  parseExperienceYears,
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
    },
  });

  return NextResponse.json(
    {
      card: serializeCard(createdCard),
    },
    { status: 201 },
  );
}
