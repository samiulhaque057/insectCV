import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createAreaSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET() {
  try {
    const areas = await db.area.findMany({
      include: {
        _count: {
          select: {
            captures: true,
            devices: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: areas });
  } catch (error) {
    console.error("Error fetching areas:", error);
    return NextResponse.json(
      { error: "Failed to fetch areas" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createAreaSchema.parse(body);

    const area = await db.area.create({
      data,
    });

    return NextResponse.json({ data: area }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error creating area:", error);
    return NextResponse.json(
      { error: "Failed to create area" },
      { status: 500 }
    );
  }
}
