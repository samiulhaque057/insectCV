import type {
  Area,
  Device,
  Capture,
  Annotation,
  Export,
  ExportItem,
  MediaType,
  TriggerType,
  CaptureStatus,
  Classification,
  AnnotationSource,
  ExportFormat,
  ExportStatus,
  DeviceType,
} from "@prisma/client";

// Re-export Prisma types
export type {
  Area,
  Device,
  Capture,
  Annotation,
  Export,
  ExportItem,
  MediaType,
  TriggerType,
  CaptureStatus,
  Classification,
  AnnotationSource,
  ExportFormat,
  ExportStatus,
  DeviceType,
};

// Extended types with relations
export type CaptureWithRelations = Capture & {
  area: Pick<Area, "id" | "name">;
  device?: Pick<Device, "id" | "name"> | null;
  annotations: Pick<Annotation, "id" | "classification" | "isVerified">[];
};

export type AnnotationWithCapture = Annotation & {
  capture: Pick<Capture, "id" | "mediaUrl" | "thumbnailUrl" | "mediaType">;
};

export type AreaWithCounts = Area & {
  _count: {
    captures: number;
    devices: number;
  };
};

export type DeviceWithArea = Device & {
  area?: Pick<Area, "id" | "name"> | null;
};

export type ExportWithItems = Export & {
  items: (ExportItem & {
    capture: Pick<Capture, "id" | "mediaUrl" | "thumbnailUrl">;
  })[];
};

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalCaptures: number;
  pendingAnnotations: number;
  totalAnnotations: number;
  verifiedAnnotations: number;
  totalAreas: number;
  activeDevices: number;
  classificationBreakdown: {
    harmful: number;
    harmless: number;
    unknown: number;
  };
  capturesByDay: {
    date: string;
    count: number;
  }[];
  capturesByArea: {
    areaId: string;
    areaName: string;
    count: number;
  }[];
}

export interface UploadSignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  uploadPreset: string;
}

// Form types
export interface CaptureFilters {
  areaId?: string;
  deviceId?: string;
  classification?: Classification;
  status?: CaptureStatus;
  mediaType?: MediaType;
  startDate?: string;
  endDate?: string;
}
