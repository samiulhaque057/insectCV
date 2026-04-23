import { z } from "zod";

export const createCaptureSchema = z.object({
  mediaType: z.enum(["IMAGE", "VIDEO"]),
  mediaUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  publicId: z.string().min(1),
  fileName: z.string().min(1),
  fileSize: z.number().positive(),
  mimeType: z.string().min(1),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  duration: z.number().positive().optional(),
  capturedAt: z.string().datetime().or(z.date()),
  temperature: z.number().min(-50).max(60).optional(),
  humidity: z.number().min(0).max(100).optional(),
  windSpeed: z.number().min(0).max(200).optional(),
  windDirection: z.enum(["N", "NE", "E", "SE", "S", "SW", "W", "NW"]).optional(),
  triggerType: z.enum(["MOTION", "SCHEDULED", "MANUAL"]).default("MOTION"),
  areaId: z.string().min(1),
  deviceId: z.string().optional(),
});

export const updateCaptureSchema = z.object({
  status: z.enum(["PENDING", "ANNOTATED", "VERIFIED", "EXPORTED", "REJECTED"]).optional(),
  temperature: z.number().min(-50).max(60).optional(),
  humidity: z.number().min(0).max(100).optional(),
  windSpeed: z.number().min(0).max(200).optional(),
  windDirection: z.enum(["N", "NE", "E", "SE", "S", "SW", "W", "NW"]).optional(),
});

export const captureQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  areaId: z.string().optional(),
  deviceId: z.string().optional(),
  classification: z.enum(["HARMFUL", "HARMLESS", "UNKNOWN"]).optional(),
  status: z.enum(["PENDING", "ANNOTATED", "VERIFIED", "EXPORTED", "REJECTED"]).optional(),
  mediaType: z.enum(["IMAGE", "VIDEO"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(["capturedAt", "createdAt", "fileSize"]).default("capturedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateCaptureInput = z.infer<typeof createCaptureSchema>;
export type UpdateCaptureInput = z.infer<typeof updateCaptureSchema>;
export type CaptureQueryInput = z.infer<typeof captureQuerySchema>;
