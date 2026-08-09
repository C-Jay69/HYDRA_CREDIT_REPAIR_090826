import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/documents?userId=xxx&category=yyy&search=zzz — List documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { userId };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { fileName: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const documents = await db.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: documents });
  } catch (error) {
    console.error('[GET /api/documents]', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

// POST /api/documents — Create a document record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, fileName, fileType, category, description, relatedDisputeId, fileSize } = body;

    if (!userId || !fileName || !fileType || !category) {
      return NextResponse.json(
        { error: 'userId, fileName, fileType, and category are required' },
        { status: 400 }
      );
    }

    const document = await db.document.create({
      data: {
        userId,
        fileName,
        fileType,
        category,
        description: description ?? null,
        relatedDisputeId: relatedDisputeId ?? null,
        fileSize: fileSize ?? null,
      },
    });

    return NextResponse.json({ data: document }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/documents]', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}

// DELETE /api/documents?id=xxx — Delete a document
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id query parameter is required' },
        { status: 400 }
      );
    }

    const existing = await db.document.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    await db.document.delete({ where: { id } });

    return NextResponse.json({ data: { id, deleted: true } });
  } catch (error) {
    console.error('[DELETE /api/documents]', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
