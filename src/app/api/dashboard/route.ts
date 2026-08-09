import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/dashboard?userId=xxx — Dashboard stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Run all counts in parallel for performance
    const [
      totalDisputes,
      activeDisputes,
      resolvedDisputes,
      deniedDisputes,
      pendingDeadlines,
      upcomingDeadlines,
      totalReports,
      documents,
      recentActivity,
    ] = await Promise.all([
      // Total disputes
      db.dispute.count({ where: { userId } }),

      // Active disputes (draft, pending-review, approved, sent, in-progress)
      db.dispute.count({
        where: {
          userId,
          status: { in: ['draft', 'pending-review', 'approved', 'sent', 'in-progress'] },
        },
      }),

      // Resolved disputes
      db.dispute.count({
        where: { userId, status: 'resolved' },
      }),

      // Denied disputes
      db.dispute.count({
        where: { userId, status: 'denied' },
      }),

      // Pending (uncompleted) deadlines
      db.deadline.count({
        where: {
          dispute: { userId },
          isCompleted: false,
        },
      }),

      // Upcoming deadlines (within next 7 days, uncompleted)
      db.deadline.count({
        where: {
          dispute: { userId },
          isCompleted: false,
          dueDate: {
            gte: now,
            lte: sevenDaysFromNow,
          },
        },
      }),

      // Total credit reports
      db.creditReport.count({ where: { userId } }),

      // Documents count
      db.document.count({ where: { userId } }),

      // Recent activity: last 10 disputes with reportItem info
      db.dispute.findMany({
        where: { userId },
        include: {
          reportItem: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      data: {
        totalDisputes,
        activeDisputes,
        resolvedDisputes,
        deniedDisputes,
        pendingDeadlines,
        upcomingDeadlines,
        totalReports,
        documents,
        recentActivity,
      },
    });
  } catch (error) {
    console.error('[GET /api/dashboard]', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
