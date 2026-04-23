import { z } from "zod";

export const createExportSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  format: z.enum(["COCO", "YOLO", "PASCAL_VOC", "CSV", "RAW"]),
  filterCriteria: z.object({
    areaIds: z.array(z.string()).optional(),
    classifications: z.array(z.enum(["HARMFUL", "HARMLESS", "UNKNOWN"])).optional(),
    statuses: z.array(z.enum(["PENDING", "ANNOTATED", "VERIFIED", "EXPORTED", "REJECTED"])).optional(),
    mediaTypes: z.array(z.enum(["IMAGE", "VIDEO"])).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    verifiedOnly: z.boolean().optional(),
  }).optional(),
});

export type CreateExportInput = z.infer<typeof createExportSchema>;
