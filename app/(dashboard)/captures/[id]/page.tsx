export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatFileSize, formatCoordinates, getStatusColor } from "@/lib/utils";
import { CaptureAnnotations } from "./capture-annotations";
import {
  ArrowLeft,
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Calendar,
  Radio,
  FileType,
  HardDrive,
} from "lucide-react";

interface CaptureDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getCapture(id: string) {
  try {
    const capture = await db.capture.findUnique({
      where: { id },
      include: {
        area: true,
        device: { select: { id: true, name: true } },
        annotations: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return capture;
  } catch (error) {
    console.error("Failed to load capture details from database:", error);
    return null;
  }
}

export default async function CaptureDetailPage({ params }: CaptureDetailPageProps) {
  const { id } = await params;
  const capture = await getCapture(id);

  if (!capture) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <Breadcrumb
        items={[
          { label: "Captures", href: "/captures" },
          { label: capture.fileName },
        ]}
      />

      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href="/captures">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <PageHeader
          title={capture.fileName}
          description={`Captured on ${formatDateTime(capture.capturedAt)}`}
          className="min-w-0"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main media view */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-video bg-slate-900 rounded-t-xl overflow-hidden">
                {capture.mediaType === "VIDEO" ? (
                  <video
                    src={capture.mediaUrl}
                    controls
                    className="w-full h-full object-contain"
                    poster={capture.thumbnailUrl || undefined}
                  />
                ) : (
                  <Image
                    src={capture.mediaUrl}
                    alt={capture.fileName}
                    fill
                    className="object-contain"
                  />
                )}
              </div>
              <div className="p-3 sm:p-4 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{capture.mediaType}</Badge>
                <Badge className={getStatusColor(capture.status)}>
                  {capture.status}
                </Badge>
                <Badge variant="outline">{capture.triggerType}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle>Capture Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Location
                </p>
                <p className="text-sm font-medium">{capture.area.name}</p>
                <p className="text-xs text-slate-400">
                  {formatCoordinates(capture.area.latitude, capture.area.longitude)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Captured At
                </p>
                <p className="text-sm font-medium">
                  {formatDateTime(capture.capturedAt)}
                </p>
              </div>

              {capture.device && (
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Radio className="h-3 w-3" />
                    Device
                  </p>
                  <p className="text-sm font-medium">{capture.device.name}</p>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <FileType className="h-3 w-3" />
                  Type
                </p>
                <p className="text-sm font-medium">{capture.mimeType}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  Size
                </p>
                <p className="text-sm font-medium">
                  {formatFileSize(capture.fileSize)}
                </p>
                {capture.width && capture.height && (
                  <p className="text-xs text-slate-400">
                    {capture.width} x {capture.height}
                  </p>
                )}
              </div>

              {capture.temperature !== null && (
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Thermometer className="h-3 w-3" />
                    Temperature
                  </p>
                  <p className="text-sm font-medium">{capture.temperature}°C</p>
                </div>
              )}

              {capture.humidity !== null && (
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Droplets className="h-3 w-3" />
                    Humidity
                  </p>
                  <p className="text-sm font-medium">{capture.humidity}%</p>
                </div>
              )}

              {capture.windSpeed !== null && (
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Wind className="h-3 w-3" />
                    Wind
                  </p>
                  <p className="text-sm font-medium">
                    {capture.windSpeed} km/h {capture.windDirection || ""}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Annotations sidebar */}
        <div className="space-y-4 sm:space-y-6">
          <CaptureAnnotations
            captureId={capture.id}
            initialAnnotations={capture.annotations}
          />
        </div>
      </div>
    </div>
  );
}
