export const WIND_DIRECTIONS = [
  "N",
  "NE",
  "E",
  "SE",
  "S",
  "SW",
  "W",
  "NW",
] as const;

export const CLASSIFICATION_OPTIONS = [
  { value: "HARMFUL", label: "Harmful", color: "red" },
  { value: "HARMLESS", label: "Harmless", color: "green" },
  { value: "UNKNOWN", label: "Unknown", color: "purple" },
] as const;

export const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "ANNOTATED", label: "Annotated" },
  { value: "VERIFIED", label: "Verified" },
  { value: "EXPORTED", label: "Exported" },
  { value: "REJECTED", label: "Rejected" },
] as const;

export const MEDIA_TYPE_OPTIONS = [
  { value: "IMAGE", label: "Image" },
  { value: "VIDEO", label: "Video" },
] as const;

export const TRIGGER_TYPE_OPTIONS = [
  { value: "MOTION", label: "Motion Detected" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "MANUAL", label: "Manual" },
] as const;

export const EXPORT_FORMAT_OPTIONS = [
  { value: "COCO", label: "COCO JSON", description: "Common Objects in Context format" },
  { value: "YOLO", label: "YOLO", description: "You Only Look Once format" },
  { value: "PASCAL_VOC", label: "Pascal VOC", description: "XML format" },
  { value: "CSV", label: "CSV", description: "Spreadsheet format" },
  { value: "RAW", label: "Raw", description: "Files with JSON manifest" },
] as const;

export const DEVICE_TYPE_OPTIONS = [
  { value: "CAMERA", label: "Camera" },
  { value: "VIDEO_RECORDER", label: "Video Recorder" },
  { value: "MULTI_SENSOR", label: "Multi-Sensor" },
] as const;

export const COMMON_INSECT_TYPES = [
  "Aphid",
  "Whitefly",
  "Thrip",
  "Spider Mite",
  "Caterpillar",
  "Beetle",
  "Grasshopper",
  "Ladybug",
  "Lacewing",
  "Hoverfly",
  "Bee",
  "Wasp",
  "Butterfly",
  "Moth",
  "Ant",
  "Unknown",
] as const;

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 20;
