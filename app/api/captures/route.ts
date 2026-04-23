import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createCaptureSchema, captureQuerySchema } from "@/lib/validations";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = captureQuerySchema.parse(Object.fromEntries(searchParams));

    const where: Record<string, unknown> = {};

    if (params.areaId) where.areaId = params.areaId;
    if (params.deviceId) where.deviceId = params.deviceId;
    if (params.status) where.status = params.status;
    if (params.mediaType) where.mediaType = params.mediaType;

    if (params.startDate || params.endDate) {
      where.capturedAt = {};
      if (params.startDate) {
        (where.capturedAt as Record<string, Date>).gte = new Date(params.startDate);
      }
      if (params.endDate) {
        (where.capturedAt as Record<string, Date>).lte = new Date(params.endDate);
      }
    }

    if (params.classification) {
      where.annotations = {
        some: {
          classification: params.classification,
        },
      };
    }

    const [captures, total] = await Promise.all([
      db.capture.findMany({
        where,
        include: {
          area: { select: { id: true, name: true } },
          device: { select: { id: true, name: true } },
          annotations: {
            select: { id: true, classification: true, isVerified: true },
          },
        },
        orderBy: { [params.sortBy]: params.sortOrder },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      db.capture.count({ where }),
    ]);

    return NextResponse.json({
      data: captures,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error fetching captures:", error);
    return NextResponse.json(
      { error: "Failed to fetch captures" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createCaptureSchema.parse(body);

    const capture = await db.capture.create({
      data: {
        ...data,
        capturedAt: new Date(data.capturedAt),
      },
      include: {
        area: { select: { id: true, name: true } },
        device: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: capture }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error creating capture:", error);
    return NextResponse.json(
      { error: "Failed to create capture" },
      { status: 500 }
    );
  }
}
