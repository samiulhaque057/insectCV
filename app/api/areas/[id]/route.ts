import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateAreaSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const area = await db.area.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            captures: true,
            devices: true,
          },
        },
        devices: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    if (!area) {
      return NextResponse.json({ error: "Area not found" }, { status: 404 });
    }

    return NextResponse.json({ data: area });
  } catch (error) {
    console.error("Error fetching area:", error);
    return NextResponse.json(
      { error: "Failed to fetch area" },
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
    const data = updateAreaSchema.parse(body);

    const area = await db.area.update({
      where: { id },
      data,
    });

    return NextResponse.json({ data: area });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error updating area:", error);
    return NextResponse.json(
      { error: "Failed to update area" },
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
    await db.area.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting area:", error);
    return NextResponse.json(
      { error: "Failed to delete area" },
      { status: 500 }
    );
  }
}
