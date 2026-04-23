"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Plus, Package, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { formatDateTime, formatFileSize } from "@/lib/utils";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { Export } from "@/types";

export default function ExportsPage() {
  const [exports, setExports] = useState<(Export & { _count: { items: number } })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchExports = async () => {
    try {
      const response = await fetch("/api/exports");
      if (response.ok) {
        const data = await response.json();
        setExports(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch exports:", error);
      toast.error("Failed to load exports");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExports();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/exports/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast.success("Export deleted successfully");
      setExports((prev) => prev.filter((e) => e.id !== id));
      setDeletingId(null);
    } catch {
      toast.error("Failed to delete export");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <PageHeader title="Exports" description="Loading..." />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <PageHeader
        title="Dataset Exports"
        description="Export your annotated data for ML training"
      >
        <Button asChild>
          <Link href="/exports/new">
            <Plus className="h-4 w-4 mr-2" />
            New Export
          </Link>
        </Button>
      </PageHeader>

      {exports.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No exports yet"
          description="Create your first dataset export for ML training"
          action={{
            label: "Create Export",
            href: "/exports/new",
          }}
        />
      ) : (
        <div className="space-y-4">
          {exports.map((exp) => (
            <Card key={exp.id}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    <div className="rounded-lg bg-purple-900/30 p-2 sm:p-3 shrink-0">
                      <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-100 truncate">
                          {exp.name}
                        </h3>
                        <Badge className={getStatusColor(exp.status)}>
                          {exp.status}
                        </Badge>
                        <Badge variant="outline">{exp.format}</Badge>
                      </div>
                      {exp.description && (
                        <p className="text-sm text-slate-400 mt-1 line-clamp-1">
                          {exp.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-slate-400">
                        <span>{exp._count.items} captures</span>
                        <span>{formatFileSize(exp.totalSize)}</span>
                        <span className="hidden sm:inline">Created {formatDateTime(exp.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-auto sm:ml-0">
                    {exp.status === "COMPLETED" && exp.downloadUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={exp.downloadUrl} download>
                          <Download className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Download</span>
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingId(exp.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={() => setDeletingId(null)}
        title="Delete Export"
        description="Are you sure you want to delete this export?"
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deletingId && handleDelete(deletingId)}
      />
    </div>
  );
}
