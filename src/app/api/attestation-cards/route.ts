import { NextResponse } from "next/server";

import { auth } from "@/auth";
import {
  educationDbValueToLabel,
  educationLabelToDbValue,
  type AttestationCardFormData,
  type EducationLevel,
} from "@/lib/attestation-card";
import { prisma } from "@/lib/prisma";

function serializeCard(card: {
  id: string;
  firstInitial: string;
  otherAfterInitial: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: card.id,
    firstInitial: educationDbValueToLabel(card.firstInitial as keyof typeof educationDbValueToLabel),
    otherAfterInitial: card.otherAfterInitial
      ? educationDbValueToLabel(card.otherAfterInitial as keyof typeof educationDbValueToLabel)
      : null,
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

  const body = (await request.json()) as AttestationCardFormData;

  if (!body.firstInitial) {
    return NextResponse.json({ error: "Поле 1.1 е задължително." }, { status: 400 });
  }

  const firstInitial = educationLabelToDbValue(body.firstInitial as EducationLevel);
  const otherAfterInitial = body.otherAfterInitial
    ? educationLabelToDbValue(body.otherAfterInitial as EducationLevel)
    : null;

  const createdCard = await prisma.attestationCard.create({
    data: {
      firstInitial,
      otherAfterInitial,
    },
  });

  return NextResponse.json(
    {
      card: serializeCard(createdCard),
    },
    { status: 201 },
  );
}
