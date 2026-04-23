import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createExportSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET() {
  try {
    const exports = await db.export.findMany({
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: exports });
  } catch (error) {
    console.error("Error fetching exports:", error);
    return NextResponse.json(
      { error: "Failed to fetch exports" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createExportSchema.parse(body);

    // Build filter criteria for captures
    const where: Record<string, unknown> = {};

    if (data.filterCriteria) {
      const { areaIds, classifications, statuses, mediaTypes, startDate, endDate, verifiedOnly } = data.filterCriteria;

      if (areaIds?.length) where.areaId = { in: areaIds };
      if (statuses?.length) where.status = { in: statuses };
      if (mediaTypes?.length) where.mediaType = { in: mediaTypes };

      if (startDate || endDate) {
        where.capturedAt = {};
        if (startDate) (where.capturedAt as Record<string, Date>).gte = new Date(startDate);
        if (endDate) (where.capturedAt as Record<string, Date>).lte = new Date(endDate);
      }

      if (classifications?.length) {
        where.annotations = {
          some: {
            classification: { in: classifications },
          },
        };
      }

      if (verifiedOnly) {
        where.annotations = {
          ...where.annotations as object,
          some: {
            ...(where.annotations as Record<string, Record<string, unknown>>)?.some,
            isVerified: true,
          },
        };
      }
    }

    // Get matching captures
    const captures = await db.capture.findMany({
      where,
      include: {
        annotations: true,
      },
    });

    // Calculate total size
    const totalSize = captures.reduce((acc, c) => acc + c.fileSize, 0);

    // Create export record
    const exportRecord = await db.export.create({
      data: {
        name: data.name,
        description: data.description,
        format: data.format,
        filterCriteria: data.filterCriteria || {},
        totalCaptures: captures.length,
        totalSize,
        status: "PROCESSING",
      },
    });

    // Create export items
    await db.exportItem.createMany({
      data: captures.map((capture) => ({
        exportId: exportRecord.id,
        captureId: capture.id,
        annotationSnapshot: capture.annotations,
      })),
    });

    // In a real application, you would trigger an async job here
    // For the prototype, we'll mark it as completed immediately
    await db.export.update({
      where: { id: exportRecord.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
    });

    // Update capture statuses
    await db.capture.updateMany({
      where: { id: { in: captures.map((c) => c.id) } },
      data: { status: "EXPORTED" },
    });

    const result = await db.export.findUnique({
      where: { id: exportRecord.id },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error creating export:", error);
    return NextResponse.json(
      { error: "Failed to create export" },
      { status: 500 }
    );
  }
}
