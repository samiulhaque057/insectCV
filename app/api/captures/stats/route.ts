import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [
      totalCaptures,
      pendingAnnotations,
      totalAnnotations,
      verifiedAnnotations,
      totalAreas,
      activeDevices,
      classificationCounts,
      capturesByDay,
      capturesByArea,
    ] = await Promise.all([
      db.capture.count(),
      db.capture.count({ where: { status: "PENDING" } }),
      db.annotation.count(),
      db.annotation.count({ where: { isVerified: true } }),
      db.area.count({ where: { isActive: true } }),
      db.device.count({ where: { isActive: true } }),
      db.annotation.groupBy({
        by: ["classification"],
        _count: { classification: true },
      }),
      db.capture.groupBy({
        by: ["capturedAt"],
        _count: { id: true },
        orderBy: { capturedAt: "desc" },
        take: 30,
      }),
      db.capture.groupBy({
        by: ["areaId"],
        _count: { id: true },
      }),
    ]);

    // Get area names for the capturesByArea data
    const areaIds = capturesByArea.map((item) => item.areaId);
    const areas = await db.area.findMany({
      where: { id: { in: areaIds } },
      select: { id: true, name: true },
    });
    const areaMap = new Map(areas.map((a) => [a.id, a.name]));

    // Format classification breakdown
    const classificationBreakdown = {
      harmful: 0,
      harmless: 0,
      unknown: 0,
    };
    classificationCounts.forEach((item) => {
      const key = item.classification.toLowerCase() as keyof typeof classificationBreakdown;
      classificationBreakdown[key] = item._count.classification;
    });

    // Format captures by day
    const formattedCapturesByDay = capturesByDay.map((item) => ({
      date: item.capturedAt.toISOString().split("T")[0],
      count: item._count.id,
    }));

    // Format captures by area
    const formattedCapturesByArea = capturesByArea.map((item) => ({
      areaId: item.areaId,
      areaName: areaMap.get(item.areaId) || "Unknown",
      count: item._count.id,
    }));

    return NextResponse.json({
      data: {
        totalCaptures,
        pendingAnnotations,
        totalAnnotations,
        verifiedAnnotations,
        totalAreas,
        activeDevices,
        classificationBreakdown,
        capturesByDay: formattedCapturesByDay,
        capturesByArea: formattedCapturesByArea,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
