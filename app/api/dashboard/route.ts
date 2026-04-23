import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Get recent captures
    const recentCaptures = await db.capture.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        area: { select: { id: true, name: true } },
        annotations: {
          select: { id: true, classification: true },
          take: 1,
        },
      },
    });

    // Get stats
    const [
      totalCaptures,
      pendingCount,
      annotatedCount,
      verifiedCount,
      totalAreas,
      activeDevices,
    ] = await Promise.all([
      db.capture.count(),
      db.capture.count({ where: { status: "PENDING" } }),
      db.capture.count({ where: { status: "ANNOTATED" } }),
      db.capture.count({ where: { status: "VERIFIED" } }),
      db.area.count({ where: { isActive: true } }),
      db.device.count({ where: { isActive: true } }),
    ]);

    // Get classification breakdown
    const classificationCounts = await db.annotation.groupBy({
      by: ["classification"],
      _count: { classification: true },
    });

    const classificationBreakdown = {
      harmful: 0,
      harmless: 0,
      unknown: 0,
    };
    classificationCounts.forEach((item) => {
      const key = item.classification.toLowerCase() as keyof typeof classificationBreakdown;
      classificationBreakdown[key] = item._count.classification;
    });

    // Get captures by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const capturesByDay = await db.capture.groupBy({
      by: ["capturedAt"],
      where: {
        capturedAt: { gte: sevenDaysAgo },
      },
      _count: { id: true },
      orderBy: { capturedAt: "asc" },
    });

    // Aggregate by date
    const dailyCounts: Record<string, number> = {};
    capturesByDay.forEach((item) => {
      const date = item.capturedAt.toISOString().split("T")[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + item._count.id;
    });

    const formattedCapturesByDay = Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      count,
    }));

    return NextResponse.json({
      data: {
        recentCaptures,
        stats: {
          totalCaptures,
          pendingCount,
          annotatedCount,
          verifiedCount,
          totalAreas,
          activeDevices,
        },
        classificationBreakdown,
        capturesByDay: formattedCapturesByDay,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
