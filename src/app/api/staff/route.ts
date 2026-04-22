import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const staff = await prisma.staff.findMany({
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            neispuoCode: true,
          },
        },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    return NextResponse.json(staff, { status: 200 });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName,
      middleName,
      lastName,
      identifierType,
      identifierValue,
      institutionId,
      institutionRole,
      isActive,
    } = body;

    const errors: Record<string, string> = {};

    if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
      errors.firstName = 'Името е задължително';
    }

    if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
      errors.lastName = 'Фамилията е задължителна';
    }

    const allowedIdentifierTypes = ['EGN', 'LNCH', 'SERVICE_ID'];
    if (!identifierType || !allowedIdentifierTypes.includes(identifierType)) {
      errors.identifierType = 'Невалиден тип идентификатор';
    }

    if (
      !identifierValue ||
      typeof identifierValue !== 'string' ||
      identifierValue.trim().length === 0
    ) {
      errors.identifierValue = 'Стойността на идентификатора е задължителна';
    }

    if (!institutionId || typeof institutionId !== 'string') {
      errors.institutionId = 'Институцията е задължителна';
    }

    const allowedInstitutionRoles = ['INSTITUTION_ADMIN', 'STAFF_MEMBER'];
    if (!institutionRole || !allowedInstitutionRoles.includes(institutionRole)) {
      errors.institutionRole = 'Невалидна функция в институцията';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
      select: { id: true },
    });

    if (!institution) {
      return NextResponse.json({ error: 'Институцията не е намерена' }, { status: 404 });
    }

    const duplicate = await prisma.staff.findFirst({
      where: {
        identifierType,
        identifierValue: identifierValue.trim(),
      },
      select: { id: true },
    });

    if (duplicate) {
      return NextResponse.json({ error: 'Вече има служител с този идентификатор' }, { status: 409 });
    }

    const created = await prisma.staff.create({
      data: {
        firstName: firstName.trim(),
        middleName: typeof middleName === 'string' && middleName.trim().length > 0 ? middleName.trim() : null,
        lastName: lastName.trim(),
        identifierType,
        identifierValue: identifierValue.trim(),
        institutionId,
        institutionRole,
        isActive: isActive !== false,
      },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            neispuoCode: true,
          },
        },
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 });
  }
}
