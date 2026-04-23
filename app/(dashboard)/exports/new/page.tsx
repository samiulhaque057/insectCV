"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EXPORT_FORMAT_OPTIONS, CLASSIFICATION_OPTIONS, STATUS_OPTIONS } from "@/lib/constants";
import { toast } from "sonner";
import { Loader2, Package, X } from "lucide-react";
import type { Area } from "@/types";

export default function NewExportPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [areas, setAreas] = useState<Pick<Area, "id" | "name">[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    format: "COCO",
    filterCriteria: {
      areaIds: [] as string[],
      classifications: [] as string[],
      statuses: [] as string[],
      verifiedOnly: false,
      startDate: "",
      endDate: "",
    },
  });

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await fetch("/api/areas");
        if (response.ok) {
          const data = await response.json();
          setAreas(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch areas:", error);
      }
    };
    fetchAreas();
  }, []);

  const toggleArrayItem = (
    key: "areaIds" | "classifications" | "statuses",
    value: string
  ) => {
    setFormData((prev) => {
      const current = prev.filterCriteria[key];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return {
        ...prev,
        filterCriteria: { ...prev.filterCriteria, [key]: updated },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Please enter an export name");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/exports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          format: formData.format,
          filterCriteria: {
            areaIds: formData.filterCriteria.areaIds.length
              ? formData.filterCriteria.areaIds
              : undefined,
            classifications: formData.filterCriteria.classifications.length
              ? formData.filterCriteria.classifications
              : undefined,
            statuses: formData.filterCriteria.statuses.length
              ? formData.filterCriteria.statuses
              : undefined,
            verifiedOnly: formData.filterCriteria.verifiedOnly || undefined,
            startDate: formData.filterCriteria.startDate
              ? `${formData.filterCriteria.startDate}T00:00:00Z`
              : undefined,
            endDate: formData.filterCriteria.endDate
              ? `${formData.filterCriteria.endDate}T23:59:59Z`
              : undefined,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to create export");

      const data = await response.json();
      toast.success(`Export created with ${data.data.totalCaptures} captures`);
      router.push("/exports");
    } catch {
      toast.error("Failed to create export");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <Breadcrumb
        items={[
          { label: "Exports", href: "/exports" },
          { label: "New Export" },
        ]}
      />

      <PageHeader
        title="Create Dataset Export"
        description="Export annotated captures for ML training"
      />

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-4 sm:space-y-6">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle>Export Details</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
            <div className="space-y-2">
              <Label required>Export Name</Label>
              <Input
                placeholder="e.g., Training Set v1.0"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Optional description..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select
                value={formData.format}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPORT_FORMAT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-xs text-slate-500">
                          {option.description}
                        </p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle>Filter Criteria</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label>Areas</Label>
              <div className="flex flex-wrap gap-2">
                {areas.map((area) => (
                  <Badge
                    key={area.id}
                    variant={
                      formData.filterCriteria.areaIds.includes(area.id)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem("areaIds", area.id)}
                  >
                    {area.name}
                    {formData.filterCriteria.areaIds.includes(area.id) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
                {areas.length === 0 && (
                  <span className="text-sm text-slate-500">No areas available</span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Leave empty to include all areas
              </p>
            </div>

            <div className="space-y-2">
              <Label>Classifications</Label>
              <div className="flex flex-wrap gap-2">
                {CLASSIFICATION_OPTIONS.map((option) => (
                  <Badge
                    key={option.value}
                    variant={
                      formData.filterCriteria.classifications.includes(
                        option.value
                      )
                        ? (option.value.toLowerCase() as
                            | "harmful"
                            | "harmless"
                            | "unknown")
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() =>
                      toggleArrayItem("classifications", option.value)
                    }
                  >
                    {option.label}
                    {formData.filterCriteria.classifications.includes(
                      option.value
                    ) && <X className="h-3 w-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Statuses</Label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((option) => (
                  <Badge
                    key={option.value}
                    variant={
                      formData.filterCriteria.statuses.includes(option.value)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem("statuses", option.value)}
                  >
                    {option.label}
                    {formData.filterCriteria.statuses.includes(option.value) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.filterCriteria.startDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      filterCriteria: {
                        ...prev.filterCriteria,
                        startDate: e.target.value,
                      },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.filterCriteria.endDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      filterCriteria: {
                        ...prev.filterCriteria,
                        endDate: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-slate-800">
              <div>
                <Label>Verified Annotations Only</Label>
                <p className="text-xs sm:text-sm text-slate-400">
                  Only include captures with verified annotations
                </p>
              </div>
              <Switch
                checked={formData.filterCriteria.verifiedOnly}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    filterCriteria: {
                      ...prev.filterCriteria,
                      verifiedOnly: checked,
                    },
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Export...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Create Export
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
