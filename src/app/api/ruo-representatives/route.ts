import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const representatives = await prisma.ruoRepresentative.findMany({
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
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    return NextResponse.json(representatives, { status: 200 });
  } catch (error) {
    console.error('Error fetching RUO representatives:', error);
    return NextResponse.json({ error: 'Failed to fetch RUO representatives' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, middleName, lastName, ruoOfficeId, userId, isActive } = body;

    const errors: Record<string, string> = {};

    if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
      errors.firstName = 'Името е задължително';
    }

    if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
      errors.lastName = 'Фамилията е задължителна';
    }

    if (!ruoOfficeId || typeof ruoOfficeId !== 'string') {
      errors.ruoOfficeId = 'РУО офисът е задължителен';
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

    const ruoOffice = await prisma.ruoOffice.findUnique({
      where: { id: ruoOfficeId },
      select: { id: true },
    });

    if (!ruoOffice) {
      return NextResponse.json({ error: 'РУО офисът не е намерен' }, { status: 404 });
    }

    const normalizedUserId = typeof userId === 'string' && userId.trim().length > 0 ? userId.trim() : null;

    if (normalizedUserId) {
      const user = await prisma.user.findUnique({ where: { id: normalizedUserId }, select: { id: true } });

      if (!user) {
        return NextResponse.json({ error: 'Потребителят не е намерен' }, { status: 404 });
      }

      const duplicateUserLink = await prisma.ruoRepresentative.findFirst({
        where: {
          userId: normalizedUserId,
        },
        select: { id: true },
      });

      if (duplicateUserLink) {
        return NextResponse.json({ error: 'Този UserID вече е зает' }, { status: 409 });
      }
    }

    const created = await prisma.ruoRepresentative.create({
      data: {
        firstName: firstName.trim(),
        middleName: typeof middleName === 'string' && middleName.trim().length > 0 ? middleName.trim() : null,
        lastName: lastName.trim(),
        ruoOfficeId,
        userId: normalizedUserId,
        isActive: isActive !== false,
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

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating RUO representative:', error);
    return NextResponse.json({ error: 'Failed to create RUO representative' }, { status: 500 });
  }
}