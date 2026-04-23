import { NextResponse } from "next/server";
import { generateSignature } from "@/lib/cloudinary";

export async function POST() {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!uploadPreset) {
      return NextResponse.json(
        { error: "Upload preset not configured" },
        { status: 500 }
      );
    }

    const paramsToSign = {
      timestamp,
      upload_preset: uploadPreset,
      folder: "insect-captures",
    };

    const signature = generateSignature(paramsToSign);

    return NextResponse.json({
      data: {
        signature,
        timestamp,
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        uploadPreset,
        folder: "insect-captures",
      },
    });
  } catch (error) {
    console.error("Error generating upload signature:", error);
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}
