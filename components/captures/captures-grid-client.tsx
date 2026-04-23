"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CaptureCard } from "@/components/captures/capture-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { STATUS_OPTIONS } from "@/lib/constants";
import { ImageIcon, Loader2 } from "lucide-react";
import type { CaptureStatus, CaptureWithRelations } from "@/types";

interface CapturesGridClientProps {
  captures: CaptureWithRelations[];
}

export function CapturesGridClient({ captures }: CapturesGridClientProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<CaptureStatus | "">("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewCapture, setPreviewCapture] = useState<CaptureWithRelations | null>(null);

  const allSelected = captures.length > 0 && selectedIds.length === captures.length;

  const selectedCount = selectedIds.length;

  const selectedCaptureNames = useMemo(() => {
    const selectedSet = new Set(selectedIds);
    return captures.filter((c) => selectedSet.has(c.id)).map((c) => c.fileName);
  }, [captures, selectedIds]);

  const toggleCapture = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) => (prev.length === captures.length ? [] : captures.map((c) => c.id)));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const applyBulkStatus = async () => {
    if (!bulkStatus || selectedIds.length === 0) return;

    setIsUpdating(true);
    try {
      const response = await fetch("/api/captures/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedIds,
          status: bulkStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Bulk update failed");
      }

      toast.success(`Updated ${selectedIds.length} capture(s) to ${bulkStatus}`);
      setSelectedIds([]);
      router.refresh();
    } catch {
      toast.error("Failed to update captures");
    } finally {
      setIsUpdating(false);
    }
  };

  if (captures.length === 0) {
    return (
      <EmptyState
        icon={ImageIcon}
        title="No captures found"
        description="No captures match your current filters. Try adjusting your filters or upload new captures."
        action={{
          label: "Upload Captures",
          href: "/upload",
        }}
      />
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/15 bg-slate-900/45 p-3">
          <Button variant="outline" size="sm" onClick={toggleSelectAll}>
            {allSelected ? "Unselect all" : "Select all"}
          </Button>
          {selectedCount > 0 && (
            <Badge variant="secondary" className="text-slate-900">
              {selectedCount} selected
            </Badge>
          )}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Select
              value={bulkStatus || undefined}
              onValueChange={(value) => setBulkStatus(value as CaptureStatus)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Bulk status..." />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={applyBulkStatus}
              disabled={!bulkStatus || selectedCount === 0 || isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating
                </>
              ) : (
                "Apply"
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSelection} disabled={selectedCount === 0}>
              Clear
            </Button>
          </div>
        </div>
        {selectedCaptureNames.length > 0 && (
          <p className="text-xs text-slate-300/80 truncate">
            Selected: {selectedCaptureNames.join(", ")}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {captures.map((capture) => (
          <CaptureCard
            key={capture.id}
            capture={capture}
            selectable
            isSelected={selectedIds.includes(capture.id)}
            onToggleSelect={() => toggleCapture(capture.id)}
            onPreview={() => setPreviewCapture(capture)}
          />
        ))}
      </div>

      <Dialog open={!!previewCapture} onOpenChange={(open) => !open && setPreviewCapture(null)}>
        <DialogContent className="max-w-3xl">
          {previewCapture && (
            <>
              <DialogHeader>
                <DialogTitle>{previewCapture.fileName}</DialogTitle>
                <DialogDescription>
                  {previewCapture.area.name} • {previewCapture.status}
                </DialogDescription>
              </DialogHeader>
              <div className="relative mt-2 aspect-video overflow-hidden rounded-xl bg-slate-900">
                {previewCapture.mediaType === "VIDEO" ? (
                  <video
                    src={previewCapture.mediaUrl}
                    controls
                    className="h-full w-full object-contain"
                    poster={previewCapture.thumbnailUrl || undefined}
                  />
                ) : (
                  <Image
                    src={previewCapture.mediaUrl}
                    alt={previewCapture.fileName}
                    fill
                    className="object-contain"
                  />
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
