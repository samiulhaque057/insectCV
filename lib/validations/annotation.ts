import { z } from "zod";

export const createAnnotationSchema = z.object({
  captureId: z.string().min(1),
  classification: z.enum(["HARMFUL", "HARMLESS", "UNKNOWN"]),
  confidence: z.number().min(0).max(100).optional(),
  boundingBoxX: z.number().min(0).max(100).optional(),
  boundingBoxY: z.number().min(0).max(100).optional(),
  boundingBoxW: z.number().min(0).max(100).optional(),
  boundingBoxH: z.number().min(0).max(100).optional(),
  timestampStart: z.number().min(0).optional(),
  timestampEnd: z.number().min(0).optional(),
  insectType: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
  source: z.enum(["MANUAL", "ML_ASSISTED", "IMPORTED"]).default("MANUAL"),
});

export const updateAnnotationSchema = createAnnotationSchema.partial().omit({ captureId: true });

export const verifyAnnotationSchema = z.object({
  isVerified: z.boolean(),
  verifiedBy: z.string().optional(),
});

export type CreateAnnotationInput = z.infer<typeof createAnnotationSchema>;
export type UpdateAnnotationInput = z.infer<typeof updateAnnotationSchema>;
export type VerifyAnnotationInput = z.infer<typeof verifyAnnotationSchema>;
