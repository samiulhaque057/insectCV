"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";
import type { Area } from "@/types";

interface AreaFormProps {
  area?: Area;
  mode: "create" | "edit";
}

export function AreaForm({ area, mode }: AreaFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: area?.name || "",
    description: area?.description || "",
    latitude: area?.latitude?.toString() || "",
    longitude: area?.longitude?.toString() || "",
    radius: area?.radius?.toString() || "",
    isActive: area?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.latitude || !formData.longitude) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = mode === "create" ? "/api/areas" : `/api/areas/${area?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          radius: formData.radius ? parseFloat(formData.radius) : undefined,
          isActive: formData.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save area");
      }

      toast.success(
        mode === "create" ? "Area created successfully" : "Area updated successfully"
      );
      router.push("/areas");
      router.refresh();
    } catch (error) {
      console.error("Error saving area:", error);
      toast.error("Failed to save area");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create New Area" : "Edit Area"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label required>Area Name</Label>
            <Input
              placeholder="e.g., North Field Section A"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Optional description of this monitoring area..."
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label required>Latitude</Label>
              <Input
                type="number"
                step="any"
                min="-90"
                max="90"
                placeholder="40.7128"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, latitude: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label required>Longitude</Label>
              <Input
                type="number"
                step="any"
                min="-180"
                max="180"
                placeholder="-74.0060"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, longitude: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Monitoring Radius (meters)</Label>
            <Input
              type="number"
              step="any"
              min="0"
              placeholder="100"
              value={formData.radius}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, radius: e.target.value }))
              }
            />
            <p className="text-xs text-slate-500">
              Optional geofence radius for this monitoring area
            </p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
            <div>
              <Label>Active Status</Label>
              <p className="text-sm text-slate-500">
                Inactive areas will not receive new captures
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: checked }))
              }
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === "create" ? "Create Area" : "Save Changes"}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
