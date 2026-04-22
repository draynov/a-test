import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/institutions
 * Fetch all institutions (accessible to ADMIN and TECHNICAL_SECRETARY only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has permission (ADMIN or TECHNICAL_SECRETARY)
    const allowedRoles = ['ADMIN', 'TECHNICAL_SECRETARY'];
    if (!allowedRoles.includes(session.user.role || '')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const institutions = await prisma.institution.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(institutions, { status: 200 });
  } catch (error) {
    console.error('Error fetching institutions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch institutions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/institutions
 * Create a new institution (accessible to ADMIN and TECHNICAL_SECRETARY only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has permission
    const allowedRoles = ['ADMIN', 'TECHNICAL_SECRETARY'];
    if (!allowedRoles.includes(session.user.role || '')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { neispuoCode, name, municipality } = body;

    // Validation
    const errors: Record<string, string> = {};

    if (!neispuoCode || typeof neispuoCode !== 'string') {
      errors.neispuoCode = 'Код по НЕИСПУО е задължителен';
    } else if (neispuoCode.trim().length === 0) {
      errors.neispuoCode = 'Код по НЕИСПУО не може да е празен';
    }

    if (!name || typeof name !== 'string') {
      errors.name = 'Наименование е задължително';
    } else if (name.trim().length === 0) {
      errors.name = 'Наименование не може да е празно';
    }

    if (!municipality || typeof municipality !== 'string') {
      errors.municipality = 'Община е задължителна';
    } else if (municipality.trim().length === 0) {
      errors.municipality = 'Община не може да е празна';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    // Check for duplicate NEISPUO code
    const existing = await prisma.institution.findUnique({
      where: { neispuoCode: neispuoCode.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Institution with this NEISPUO code already exists' },
        { status: 400 }
      );
    }

    // Create institution
    const institution = await prisma.institution.create({
      data: {
        neispuoCode: neispuoCode.trim(),
        name: name.trim(),
        municipality: municipality.trim(),
        createdBy: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(institution, { status: 201 });
  } catch (error) {
    console.error('Error creating institution:', error);
    return NextResponse.json(
      { error: 'Failed to create institution' },
      { status: 500 }
    );
  }
}
