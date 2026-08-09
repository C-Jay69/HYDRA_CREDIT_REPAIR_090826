import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/letters?disputeId=xxx — List letters for a dispute
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const disputeId = searchParams.get('disputeId');

    if (!disputeId) {
      return NextResponse.json(
        { error: 'disputeId query parameter is required' },
        { status: 400 }
      );
    }

    const letters = await db.letter.findMany({
      where: { disputeId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: letters });
  } catch (error) {
    console.error('[GET /api/letters]', error);
    return NextResponse.json({ error: 'Failed to fetch letters' }, { status: 500 });
  }
}

// POST /api/letters — Generate/create a letter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { disputeId, templateType, recipientName, recipientAddr, content } = body;

    if (!disputeId || !templateType || !content) {
      return NextResponse.json(
        { error: 'disputeId, templateType, and content are required' },
        { status: 400 }
      );
    }

    // Verify the dispute exists
    const dispute = await db.dispute.findUnique({ where: { id: disputeId } });
    if (!dispute) {
      return NextResponse.json({ error: 'Dispute not found' }, { status: 404 });
    }

    const letter = await db.letter.create({
      data: {
        disputeId,
        templateType,
        recipientName: recipientName ?? null,
        recipientAddr: recipientAddr ?? null,
        content,
        status: 'generated',
      },
    });

    return NextResponse.json({ data: letter }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/letters]', error);
    return NextResponse.json({ error: 'Failed to create letter' }, { status: 500 });
  }
}

// PUT /api/letters — Update letter status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, sentVia, trackingNumber } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const existing = await db.letter.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (sentVia !== undefined) updateData.sentVia = sentVia;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;

    const letter = await db.letter.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: letter });
  } catch (error) {
    console.error('[PUT /api/letters]', error);
    return NextResponse.json({ error: 'Failed to update letter' }, { status: 500 });
  }
}
