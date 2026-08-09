import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/disputes?userId=xxx&status=yyy — List disputes for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400 });
    }

    const where: Record<string, unknown> = { userId };
    if (status) {
      where.status = status;
    }

    const disputes = await db.dispute.findMany({
      where,
      include: {
        reportItem: true,
        letters: {
          orderBy: { createdAt: 'desc' },
        },
        deadlines: {
          orderBy: { dueDate: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: disputes });
  } catch (error) {
    console.error('[GET /api/disputes]', error);
    return NextResponse.json({ error: 'Failed to fetch disputes' }, { status: 500 });
  }
}

// POST /api/disputes — Create a dispute
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, reportItemId, disputeType, strategy, targetName, targetAddress, legalBasis, reason, confidence } = body;

    if (!userId || !disputeType) {
      return NextResponse.json(
        { error: 'userId and disputeType are required' },
        { status: 400 }
      );
    }

    const dispute = await db.dispute.create({
      data: {
        userId,
        reportItemId: reportItemId ?? null,
        disputeType,
        strategy: strategy ?? null,
        targetName: targetName ?? null,
        targetAddress: targetAddress ?? null,
        legalBasis: legalBasis ?? null,
        reason: reason ?? null,
        confidence: confidence ?? null,
        status: 'draft',
      },
      include: {
        reportItem: true,
        letters: true,
        deadlines: true,
      },
    });

    return NextResponse.json({ data: dispute }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/disputes]', error);
    return NextResponse.json({ error: 'Failed to create dispute' }, { status: 500 });
  }
}

// PUT /api/disputes — Update dispute status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, outcome, responseDate, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const existing = await db.dispute.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (outcome !== undefined) updateData.outcome = outcome;
    if (responseDate !== undefined) updateData.responseDate = responseDate ? new Date(responseDate) : null;
    if (notes !== undefined) updateData.notes = notes;

    // Auto-set sentDate when status changes to sent
    if (status === 'sent' && !existing.sentDate) {
      updateData.sentDate = new Date();
    }

    const dispute = await db.dispute.update({
      where: { id },
      data: updateData,
      include: {
        reportItem: true,
        letters: true,
        deadlines: true,
      },
    });

    return NextResponse.json({ data: dispute });
  } catch (error) {
    console.error('[PUT /api/disputes]', error);
    return NextResponse.json({ error: 'Failed to update dispute' }, { status: 500 });
  }
}
