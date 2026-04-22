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

    const representative = await prisma.ruoRepresentative.findUnique({
      where: { id },
      include: {
        ruoOffice: {
          select: {
            id: true,
            name: true,
            region: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!representative) {
      return NextResponse.json({ error: 'RUO representative not found' }, { status: 404 });
    }

    return NextResponse.json(representative, { status: 200 });
  } catch (error) {
    console.error('Error fetching RUO representative by id:', error);
    return NextResponse.json({ error: 'Failed to fetch RUO representative' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.ruoRepresentative.findUnique({
      where: { id },
      select: {
        id: true,
        ruoOfficeId: true,
        userId: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'RUO representative not found' }, { status: 404 });
    }

    const body = await request.json();
    const { firstName, middleName, lastName, ruoOfficeId, userId, isActive } = body;

    const errors: Record<string, string> = {};

    if (firstName !== undefined && (typeof firstName !== 'string' || firstName.trim().length === 0)) {
      errors.firstName = 'Името трябва да е текст';
    }

    if (lastName !== undefined && (typeof lastName !== 'string' || lastName.trim().length === 0)) {
      errors.lastName = 'Фамилията трябва да е текст';
    }

    if (ruoOfficeId !== undefined && (typeof ruoOfficeId !== 'string' || ruoOfficeId.trim().length === 0)) {
      errors.ruoOfficeId = 'РУО офисът трябва да е текст';
    }

    if (userId !== undefined && userId !== null && typeof userId !== 'string') {
      errors.userId = 'UserID трябва да е текст';
    }

    if (isActive !== undefined && typeof isActive !== 'boolean') {
      errors.isActive = 'Невалиден флаг за активност';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const nextRuoOfficeId = typeof ruoOfficeId === 'string' ? ruoOfficeId.trim() : existing.ruoOfficeId;
    const normalizedUserId =
      userId === undefined ? existing.userId : typeof userId === 'string' && userId.trim().length > 0 ? userId.trim() : null;

    if (nextRuoOfficeId !== existing.ruoOfficeId) {
      const ruoOffice = await prisma.ruoOffice.findUnique({
        where: { id: nextRuoOfficeId },
        select: { id: true },
      });

      if (!ruoOffice) {
        return NextResponse.json({ error: 'РУО офисът не е намерен' }, { status: 404 });
      }
    }

    if (normalizedUserId) {
      const user = await prisma.user.findUnique({ where: { id: normalizedUserId }, select: { id: true } });

      if (!user) {
        return NextResponse.json({ error: 'Потребителят не е намерен' }, { status: 404 });
      }

      const duplicateUserLink = await prisma.ruoRepresentative.findFirst({
        where: {
          userId: normalizedUserId,
          NOT: { id },
        },
        select: { id: true },
      });

      if (duplicateUserLink) {
        return NextResponse.json({ error: 'Този UserID вече е зает' }, { status: 409 });
      }
    }

    const updated = await prisma.ruoRepresentative.update({
      where: { id },
      data: {
        ...(typeof firstName === 'string' ? { firstName: firstName.trim() } : {}),
        ...(typeof middleName === 'string'
          ? { middleName: middleName.trim().length > 0 ? middleName.trim() : null }
          : {}),
        ...(typeof lastName === 'string' ? { lastName: lastName.trim() } : {}),
        ...(typeof ruoOfficeId === 'string' ? { ruoOfficeId: nextRuoOfficeId } : {}),
        ...(userId !== undefined ? { userId: normalizedUserId } : {}),
        ...(typeof isActive === 'boolean' ? { isActive } : {}),
      },
      include: {
        ruoOffice: {
          select: {
            id: true,
            name: true,
            region: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Error updating RUO representative:', error);
    return NextResponse.json({ error: 'Failed to update RUO representative' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.ruoRepresentative.findUnique({ where: { id }, select: { id: true } });

    if (!existing) {
      return NextResponse.json({ error: 'RUO representative not found' }, { status: 404 });
    }

    await prisma.ruoRepresentative.delete({ where: { id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting RUO representative:', error);
    return NextResponse.json({ error: 'Failed to delete RUO representative' }, { status: 500 });
  }
}