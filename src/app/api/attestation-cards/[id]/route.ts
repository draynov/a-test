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
