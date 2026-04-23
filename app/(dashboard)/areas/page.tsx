"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { AreaCard } from "@/components/areas/area-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, MapPin } from "lucide-react";
import { toast } from "sonner";
import type { AreaWithCounts } from "@/types";

export default function AreasPage() {
  const [areas, setAreas] = useState<AreaWithCounts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAreas = async () => {
    try {
      const response = await fetch("/api/areas");
      if (response.ok) {
        const data = await response.json();
        setAreas(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch areas:", error);
      toast.error("Failed to load areas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/areas/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      toast.success("Area deleted successfully");
      setAreas((prev) => prev.filter((a) => a.id !== id));
      setDeletingId(null);
    } catch {
      toast.error("Failed to delete area");
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <PageHeader title="Areas" description="Loading..." />
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <PageHeader
        title="Monitoring Areas"
        description={`${areas.length} areas configured`}
      >
        <Button asChild>
          <Link href="/areas/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Area
          </Link>
        </Button>
      </PageHeader>

      {areas.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No areas configured"
          description="Create your first monitoring area to start collecting data"
          action={{
            label: "Add Area",
            href: "/areas/new",
          }}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {areas.map((area) => (
            <AreaCard
              key={area.id}
              area={area}
              onDelete={(id) => setDeletingId(id)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={() => setDeletingId(null)}
        title="Delete Area"
        description="Are you sure you want to delete this area? This will also delete all associated captures and devices."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deletingId && handleDelete(deletingId)}
      />
    </div>
  );
}
