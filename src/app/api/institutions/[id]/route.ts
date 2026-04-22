import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/institutions/[id]
 * Fetch a specific institution
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    const institution = await prisma.institution.findUnique({
      where: { id },
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

    if (!institution) {
      return NextResponse.json(
        { error: 'Institution not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(institution, { status: 200 });
  } catch (error) {
    console.error('Error fetching institution:', error);
    return NextResponse.json(
      { error: 'Failed to fetch institution' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/institutions/[id]
 * Update a specific institution
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // Check if institution exists
    const existing = await prisma.institution.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Institution not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { neispuoCode, name, municipality } = body;

    // Validation
    const errors: Record<string, string> = {};

    if (neispuoCode !== undefined) {
      if (typeof neispuoCode !== 'string') {
        errors.neispuoCode = 'Код по НЕИСПУО трябва да е текст';
      } else if (neispuoCode.trim().length === 0) {
        errors.neispuoCode = 'Код по НЕИСПУО не може да е празен';
      }
    }

    if (name !== undefined) {
      if (typeof name !== 'string') {
        errors.name = 'Наименование трябва да е текст';
      } else if (name.trim().length === 0) {
        errors.name = 'Наименование не може да е празно';
      }
    }

    if (municipality !== undefined) {
      if (typeof municipality !== 'string') {
        errors.municipality = 'Община трябва да е текст';
      } else if (municipality.trim().length === 0) {
        errors.municipality = 'Община не може да е празна';
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    // Check for duplicate NEISPUO code if it's being changed
    if (neispuoCode && neispuoCode.trim() !== existing.neispuoCode) {
      const duplicate = await prisma.institution.findUnique({
        where: { neispuoCode: neispuoCode.trim() },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: 'Institution with this NEISPUO code already exists' },
          { status: 400 }
        );
      }
    }

    // Update institution
    const updated = await prisma.institution.update({
      where: { id },
      data: {
        ...(neispuoCode && { neispuoCode: neispuoCode.trim() }),
        ...(name && { name: name.trim() }),
        ...(municipality && { municipality: municipality.trim() }),
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

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Error updating institution:', error);
    return NextResponse.json(
      { error: 'Failed to update institution' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/institutions/[id]
 * Delete a specific institution
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // Check if institution exists
    const existing = await prisma.institution.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Institution not found' },
        { status: 404 }
      );
    }

    // Delete institution (CASCADE will handle related templates)
    await prisma.institution.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Institution deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting institution:', error);
    return NextResponse.json(
      { error: 'Failed to delete institution' },
      { status: 500 }
    );
  }
}
