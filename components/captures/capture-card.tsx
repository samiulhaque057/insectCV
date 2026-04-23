"use client";

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, getStatusColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ImageIcon, Video, MapPin, Eye } from "lucide-react";
import type { CaptureWithRelations } from "@/types";

interface CaptureCardProps {
  capture: CaptureWithRelations;
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onPreview?: () => void;
}

export function CaptureCard({
  capture,
  selectable = false,
  isSelected = false,
  onToggleSelect,
  onPreview,
}: CaptureCardProps) {
  const classification = capture.annotations[0]?.classification;

  return (
    <Card
      className={`group overflow-hidden hover:shadow-md transition-shadow ${
        isSelected ? "ring-2 ring-cyan-400/80" : ""
      }`}
    >
      <div className="relative">
        {selectable && (
          <div className="absolute left-2 top-2 z-20">
            <button
              type="button"
              onClick={onToggleSelect}
              className="flex h-6 w-6 items-center justify-center rounded-md border border-white/30 bg-slate-900/70 text-white"
              aria-label={isSelected ? "Unselect capture" : "Select capture"}
            >
              <span className={`h-3 w-3 rounded-sm ${isSelected ? "bg-cyan-400" : "bg-transparent"}`} />
            </button>
          </div>
        )}
        <div className="absolute right-2 top-10 z-20">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={onPreview}
            className="h-7 w-7 bg-slate-900/70"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <Link href={`/captures/${capture.id}`}>
        <div className="relative aspect-[4/3] bg-slate-700">
          {capture.thumbnailUrl ? (
            <Image
              src={capture.thumbnailUrl}
              alt={capture.fileName}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              {capture.mediaType === "VIDEO" ? (
                <Video className="h-12 w-12 text-slate-400" />
              ) : (
                <ImageIcon className="h-12 w-12 text-slate-400" />
              )}
            </div>
          )}

          {/* Media type badge */}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-black/50 text-white border-0">
              {capture.mediaType === "VIDEO" ? (
                <Video className="h-3 w-3 mr-1" />
              ) : (
                <ImageIcon className="h-3 w-3 mr-1" />
              )}
              {capture.mediaType}
            </Badge>
          </div>

          {/* Classification badge */}
          {classification && (
            <div className="absolute top-2 right-2">
              <Badge
                variant={classification.toLowerCase() as "harmful" | "harmless" | "unknown"}
              >
                {classification}
              </Badge>
            </div>
          )}

          {/* Status indicator */}
          <div className="absolute bottom-2 right-2">
            <Badge className={getStatusColor(capture.status)}>
              {capture.status}
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <p className="font-medium text-slate-100 truncate">{capture.fileName}</p>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{capture.area.name}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {formatDateTime(capture.capturedAt)}
          </p>
        </div>
      </Link>
    </Card>
  );
}
