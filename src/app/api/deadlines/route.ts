import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/deadlines?userId=xxx&upcoming=true — List deadlines
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const upcoming = searchParams.get('upcoming');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    // Find all dispute IDs for this user
    const userDisputes = await db.dispute.findMany({
      where: { userId },
      select: { id: true },
    });
    const disputeIds = userDisputes.map((d) => d.id);

    if (disputeIds.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const where: Record<string, unknown> = {
      disputeId: { in: disputeIds },
      isCompleted: false,
    };

    // If upcoming=true, filter to deadlines due within the next 7 days
    if (upcoming === 'true') {
      const now = new Date();
      const sevenDaysFromNow = new Date(now);
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      where.dueDate = {
        gte: now,
        lte: sevenDaysFromNow,
      };
    }

    const deadlines = await db.deadline.findMany({
      where,
      include: {
        dispute: {
          include: {
            reportItem: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json({ data: deadlines });
  } catch (error) {
    console.error('[GET /api/deadlines]', error);
    return NextResponse.json({ error: 'Failed to fetch deadlines' }, { status: 500 });
  }
}

// POST /api/deadlines — Create a deadline
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { disputeId, deadlineType, title, dueDate } = body;

    if (!disputeId || !deadlineType || !title || !dueDate) {
      return NextResponse.json(
        { error: 'disputeId, deadlineType, title, and dueDate are required' },
        { status: 400 }
      );
    }

    // Verify dispute exists
    const dispute = await db.dispute.findUnique({ where: { id: disputeId } });
    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    const deadline = await db.deadline.create({
      data: {
        disputeId,
        deadlineType,
        title,
        dueDate: new Date(dueDate),
      },
      include: {
        dispute: {
          include: {
            reportItem: true,
          },
        },
      },
    });

    return NextResponse.json({ data: deadline }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/deadlines]', error);
    return NextResponse.json({ error: 'Failed to create deadline' }, { status: 500 });
  }
}

// PUT /api/deadlines — Mark deadline completed
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isCompleted, completedDate } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const existing = await db.deadline.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Deadline not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (isCompleted !== undefined) updateData.isCompleted = isCompleted;
    if (completedDate !== undefined) {
      updateData.completedDate = completedDate ? new Date(completedDate) : null;
    } else if (isCompleted === true && !existing.completedDate) {
      // Auto-set completedDate when marking complete
      updateData.completedDate = new Date();
    }

    const deadline = await db.deadline.update({
      where: { id },
      data: updateData,
      include: {
        dispute: {
          include: {
            reportItem: true,
          },
        },
      },
    });

    return NextResponse.json({ data: deadline });
  } catch (error) {
    console.error('[PUT /api/deadlines]', error);
    return NextResponse.json({ error: 'Failed to update deadline' }, { status: 500 });
  }
}
