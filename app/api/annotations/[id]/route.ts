import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { updateAnnotationSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const annotation = await db.annotation.findUnique({
      where: { id },
      include: {
        capture: {
          select: {
            id: true,
            mediaUrl: true,
            thumbnailUrl: true,
            mediaType: true,
          },
        },
      },
    });

    if (!annotation) {
      return NextResponse.json(
        { error: "Annotation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: annotation });
  } catch (error) {
    console.error("Error fetching annotation:", error);
    return NextResponse.json(
      { error: "Failed to fetch annotation" },
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
    const data = updateAnnotationSchema.parse(body);

    const annotation = await db.annotation.update({
      where: { id },
      data,
    });

    return NextResponse.json({ data: annotation });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error updating annotation:", error);
    return NextResponse.json(
      { error: "Failed to update annotation" },
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
    await db.annotation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting annotation:", error);
    return NextResponse.json(
      { error: "Failed to delete annotation" },
      { status: 500 }
    );
  }
}
