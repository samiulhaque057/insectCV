import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const exportRecord = await db.export.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            capture: {
              select: {
                id: true,
                mediaUrl: true,
                thumbnailUrl: true,
                fileName: true,
                mediaType: true,
              },
            },
          },
        },
      },
    });

    if (!exportRecord) {
      return NextResponse.json({ error: "Export not found" }, { status: 404 });
    }

    return NextResponse.json({ data: exportRecord });
  } catch (error) {
    console.error("Error fetching export:", error);
    return NextResponse.json(
      { error: "Failed to fetch export" },
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
    await db.export.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting export:", error);
    return NextResponse.json(
      { error: "Failed to delete export" },
      { status: 500 }
    );
  }
}
