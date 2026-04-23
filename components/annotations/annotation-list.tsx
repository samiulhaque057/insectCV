"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { Check, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { Annotation } from "@/types";

interface AnnotationListProps {
  annotations: Annotation[];
  onUpdate?: () => void;
}

export function AnnotationList({ annotations, onUpdate }: AnnotationListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const handleVerify = async (id: string) => {
    setVerifyingId(id);
    try {
      const response = await fetch(`/api/annotations/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: true }),
      });

      if (!response.ok) throw new Error("Failed to verify");

      toast.success("Annotation verified");
      onUpdate?.();
    } catch {
      toast.error("Failed to verify annotation");
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/annotations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast.success("Annotation deleted");
      setDeletingId(null);
      onUpdate?.();
    } catch {
      toast.error("Failed to delete annotation");
    }
  };

  if (annotations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Annotations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 text-center py-4">
            No annotations yet. Add one using the form above.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Annotations ({annotations.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {annotations.map((annotation) => (
            <div
              key={annotation.id}
              className="flex items-start justify-between p-3 rounded-lg bg-slate-50 border border-slate-200"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      annotation.classification.toLowerCase() as
                        | "harmful"
                        | "harmless"
                        | "unknown"
                    }
                  >
                    {annotation.classification}
                  </Badge>
                  {annotation.isVerified && (
                    <Badge variant="default" className="bg-green-600">
                      <Check className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                {annotation.insectType && (
                  <p className="text-sm font-medium text-slate-700">
                    {annotation.insectType}
                  </p>
                )}
                {annotation.notes && (
                  <p className="text-sm text-slate-500">{annotation.notes}</p>
                )}
                <p className="text-xs text-slate-400">
                  {formatDateTime(annotation.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {!annotation.isVerified && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleVerify(annotation.id)}
                    disabled={verifyingId === annotation.id}
                    title="Verify annotation"
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeletingId(annotation.id)}
                  title="Delete annotation"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={() => setDeletingId(null)}
        title="Delete Annotation"
        description="Are you sure you want to delete this annotation? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deletingId && handleDelete(deletingId)}
      />
    </>
  );
}
