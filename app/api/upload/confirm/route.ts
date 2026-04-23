import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createCaptureSchema } from "@/lib/validations";
import { z } from "zod";

// Schema for Cloudinary upload response
const cloudinaryResponseSchema = z.object({
  public_id: z.string(),
  secure_url: z.string().url(),
  resource_type: z.enum(["image", "video"]),
  format: z.string(),
  bytes: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  duration: z.number().optional(),
  original_filename: z.string(),
});

const confirmUploadSchema = z.object({
  cloudinaryResponse: cloudinaryResponseSchema,
  metadata: z.object({
    areaId: z.string().min(1),
    deviceId: z.string().optional(),
    capturedAt: z.string().datetime(),
    temperature: z.number().optional(),
    humidity: z.number().optional(),
    windSpeed: z.number().optional(),
    windDirection: z.enum(["N", "NE", "E", "SE", "S", "SW", "W", "NW"]).optional(),
    triggerType: z.enum(["MOTION", "SCHEDULED", "MANUAL"]).default("MOTION"),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cloudinaryResponse, metadata } = confirmUploadSchema.parse(body);

    // Generate thumbnail URL for images
    let thumbnailUrl: string | undefined;
    if (cloudinaryResponse.resource_type === "image") {
      thumbnailUrl = cloudinaryResponse.secure_url.replace(
        "/upload/",
        "/upload/c_fill,w_300,h_200/"
      );
    } else if (cloudinaryResponse.resource_type === "video") {
      thumbnailUrl = cloudinaryResponse.secure_url
        .replace("/upload/", "/upload/c_fill,w_300,h_200,so_0/")
        .replace(/\.[^.]+$/, ".jpg");
    }

    const captureData = {
      mediaType: cloudinaryResponse.resource_type === "image" ? "IMAGE" : "VIDEO",
      mediaUrl: cloudinaryResponse.secure_url,
      thumbnailUrl,
      publicId: cloudinaryResponse.public_id,
      fileName: cloudinaryResponse.original_filename,
      fileSize: cloudinaryResponse.bytes,
      mimeType: `${cloudinaryResponse.resource_type}/${cloudinaryResponse.format}`,
      width: cloudinaryResponse.width,
      height: cloudinaryResponse.height,
      duration: cloudinaryResponse.duration,
      ...metadata,
    } as const;

    // Validate the complete capture data
    const validatedData = createCaptureSchema.parse(captureData);

    const capture = await db.capture.create({
      data: {
        ...validatedData,
        capturedAt: new Date(validatedData.capturedAt),
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
    console.error("Error confirming upload:", error);
    return NextResponse.json(
      { error: "Failed to confirm upload" },
      { status: 500 }
    );
  }
}
