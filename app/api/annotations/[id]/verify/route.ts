import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAnnotationSchema } from "@/lib/validations";
import { z } from "zod";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = verifyAnnotationSchema.parse(body);

    const annotation = await db.annotation.update({
      where: { id },
      data: {
        isVerified: data.isVerified,
        verifiedAt: data.isVerified ? new Date() : null,
        verifiedBy: data.verifiedBy || null,
      },
    });

    // If verified, update capture status to VERIFIED
    if (data.isVerified) {
      await db.capture.update({
        where: { id: annotation.captureId },
        data: { status: "VERIFIED" },
      });
    }

    return NextResponse.json({ data: annotation });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error verifying annotation:", error);
    return NextResponse.json(
      { error: "Failed to verify annotation" },
      { status: 500 }
    );
  }
}
