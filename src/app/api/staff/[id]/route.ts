import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const staff = await prisma.staff.findUnique({
      where: { id },
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

    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    return NextResponse.json(staff, { status: 200 });
  } catch (error) {
    console.error('Error fetching staff by id:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.staff.findUnique({
      where: { id },
      select: {
        id: true,
        identifierType: true,
        identifierValue: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
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

    if (firstName !== undefined && (typeof firstName !== 'string' || firstName.trim().length === 0)) {
      errors.firstName = 'Името е задължително';
    }

    if (lastName !== undefined && (typeof lastName !== 'string' || lastName.trim().length === 0)) {
      errors.lastName = 'Фамилията е задължителна';
    }

    const allowedIdentifierTypes = ['EGN', 'LNCH', 'SERVICE_ID'];
    if (identifierType !== undefined && !allowedIdentifierTypes.includes(identifierType)) {
      errors.identifierType = 'Невалиден тип идентификатор';
    }

    if (
      identifierValue !== undefined &&
      (typeof identifierValue !== 'string' || identifierValue.trim().length === 0)
    ) {
      errors.identifierValue = 'Стойността на идентификатора е задължителна';
    }

    if (institutionId !== undefined && typeof institutionId !== 'string') {
      errors.institutionId = 'Невалидна институция';
    }

    const allowedInstitutionRoles = ['INSTITUTION_ADMIN', 'STAFF_MEMBER'];
    if (institutionRole !== undefined && !allowedInstitutionRoles.includes(institutionRole)) {
      errors.institutionRole = 'Невалидна функция в институцията';
    }

    if (isActive !== undefined && typeof isActive !== 'boolean') {
      errors.isActive = 'Невалиден флаг за активност';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const nextIdentifierType = identifierType ?? existing.identifierType;
    const nextIdentifierValue =
      typeof identifierValue === 'string' ? identifierValue.trim() : existing.identifierValue;

    if (
      nextIdentifierType !== existing.identifierType ||
      nextIdentifierValue !== existing.identifierValue
    ) {
      const duplicate = await prisma.staff.findFirst({
        where: {
          identifierType: nextIdentifierType,
          identifierValue: nextIdentifierValue,
          NOT: { id },
        },
        select: { id: true },
      });

      if (duplicate) {
        return NextResponse.json({ error: 'Вече има служител с този идентификатор' }, { status: 409 });
      }
    }

    if (institutionId) {
      const institution = await prisma.institution.findUnique({
        where: { id: institutionId },
        select: { id: true },
      });

      if (!institution) {
        return NextResponse.json({ error: 'Институцията не е намерена' }, { status: 404 });
      }
    }

    const updated = await prisma.staff.update({
      where: { id },
      data: {
        ...(typeof firstName === 'string' ? { firstName: firstName.trim() } : {}),
        ...(typeof middleName === 'string'
          ? { middleName: middleName.trim().length > 0 ? middleName.trim() : null }
          : {}),
        ...(typeof lastName === 'string' ? { lastName: lastName.trim() } : {}),
        ...(identifierType ? { identifierType } : {}),
        ...(typeof identifierValue === 'string' ? { identifierValue: identifierValue.trim() } : {}),
        ...(institutionId ? { institutionId } : {}),
        ...(institutionRole ? { institutionRole } : {}),
        ...(typeof isActive === 'boolean' ? { isActive } : {}),
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

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Error updating staff:', error);
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.staff.findUnique({ where: { id }, select: { id: true } });

    if (!existing) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    await prisma.staff.delete({ where: { id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting staff:', error);
    return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 });
  }
}
