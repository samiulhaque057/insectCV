import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createAnnotationSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const annotations = await db.annotation.findMany({
      where: { captureId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: annotations });
  } catch (error) {
    console.error("Error fetching annotations:", error);
    return NextResponse.json(
      { error: "Failed to fetch annotations" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = createAnnotationSchema.parse({ ...body, captureId: id });

    const annotation = await db.annotation.create({
      data,
    });

    // Update capture status to ANNOTATED if it was PENDING
    await db.capture.update({
      where: { id, status: "PENDING" },
      data: { status: "ANNOTATED" },
    });

    return NextResponse.json({ data: annotation }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error creating annotation:", error);
    return NextResponse.json(
      { error: "Failed to create annotation" },
      { status: 500 }
    );
  }
}
