import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateCaptureSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const capture = await db.capture.findUnique({
      where: { id },
      include: {
        area: { select: { id: true, name: true, latitude: true, longitude: true } },
        device: { select: { id: true, name: true } },
        annotations: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!capture) {
      return NextResponse.json({ error: "Capture not found" }, { status: 404 });
    }

    return NextResponse.json({ data: capture });
  } catch (error) {
    console.error("Error fetching capture:", error);
    return NextResponse.json(
      { error: "Failed to fetch capture" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateCaptureSchema.parse(body);

    const capture = await db.capture.update({
      where: { id },
      data,
      include: {
        area: { select: { id: true, name: true } },
        device: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: capture });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error updating capture:", error);
    return NextResponse.json(
      { error: "Failed to update capture" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.capture.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting capture:", error);
    return NextResponse.json(
      { error: "Failed to delete capture" },
      { status: 500 }
    );
  }
}
