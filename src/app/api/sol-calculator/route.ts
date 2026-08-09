import { NextRequest, NextResponse } from 'next/server';
import { calculateSolExpiration } from '@/data/sol-data';

// POST /api/sol-calculator — Calculate SOL expiration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lastPaymentDate, state, country, debtType } = body;

    if (!lastPaymentDate || !state || !debtType) {
      return NextResponse.json(
        { error: 'lastPaymentDate, state, and debtType are required' },
        { status: 400 }
      );
    }

    // Only US states are supported by calculateSolExpiration
    // For Canadian provinces, return a not-supported message
    if (country === 'CA') {
      return NextResponse.json({
        error: 'Canadian SOL calculation is not yet supported via this endpoint. Use provincial data directly.',
        supportedCountry: 'US',
      }, { status: 400 });
    }

    const result = calculateSolExpiration(lastPaymentDate, state, debtType);

    return NextResponse.json({
      data: {
        lastPaymentDate,
        state,
        debtType,
        ...result,
      },
    });
  } catch (error) {
    console.error('[POST /api/sol-calculator]', error);
    return NextResponse.json({ error: 'Failed to calculate SOL' }, { status: 500 });
  }
}
