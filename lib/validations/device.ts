import { z } from "zod";

export const createDeviceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  serialNumber: z.string().min(1, "Serial number is required"),
  deviceType: z.enum(["CAMERA", "VIDEO_RECORDER", "MULTI_SENSOR"]).default("CAMERA"),
  isActive: z.boolean().default(true),
  areaId: z.string().optional(),
});

export const updateDeviceSchema = createDeviceSchema.partial().omit({ serialNumber: true });

export type CreateDeviceInput = z.infer<typeof createDeviceSchema>;
export type UpdateDeviceInput = z.infer<typeof updateDeviceSchema>;
