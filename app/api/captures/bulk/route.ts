import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const bulkUpdateSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  status: z.enum(["PENDING", "ANNOTATED", "VERIFIED", "EXPORTED", "REJECTED"]),
});

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const data = bulkUpdateSchema.parse(body);

    const result = await db.capture.updateMany({
      where: { id: { in: data.ids } },
      data: { status: data.status },
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error("Error bulk updating captures:", error);
    return NextResponse.json(
      { error: "Failed to update captures" },
      { status: 500 }
    );
  }
}
