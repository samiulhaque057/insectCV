"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import { ArrowRight, ImageIcon } from "lucide-react";
import type { CaptureWithRelations } from "@/types";

interface RecentCapturesProps {
  captures: CaptureWithRelations[];
}

export function RecentCaptures({ captures }: RecentCapturesProps) {
  if (captures.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Captures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ImageIcon className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-sm text-slate-500">No captures yet</p>
            <Button asChild className="mt-4">
              <Link href="/upload">Upload First Capture</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">Recent Captures</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/captures">
            <span className="hidden sm:inline">View all</span>
            <ArrowRight className="sm:ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {captures.map((capture) => (
            <Link
              key={capture.id}
              href={`/captures/${capture.id}`}
              className="group relative aspect-square rounded-lg overflow-hidden bg-slate-700"
            >
              {capture.thumbnailUrl ? (
                <Image
                  src={capture.thumbnailUrl}
                  alt={capture.fileName}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-slate-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-xs text-white truncate">
                    {formatDateTime(capture.capturedAt)}
                  </p>
                  <p className="text-xs text-white/80 truncate">
                    {capture.area.name}
                  </p>
                </div>
              </div>
              {capture.annotations.length > 0 && (
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={
                      capture.annotations[0].classification.toLowerCase() as
                        | "harmful"
                        | "harmless"
                        | "unknown"
                    }
                    className="text-xs"
                  >
                    {capture.annotations[0].classification}
                  </Badge>
                </div>
              )}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
