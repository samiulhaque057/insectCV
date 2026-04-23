"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WIND_DIRECTIONS, TRIGGER_TYPE_OPTIONS } from "@/lib/constants";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";
import type { Area, Device } from "@/types";

interface UploadedFile {
  cloudinaryData?: {
    public_id: string;
    secure_url: string;
    resource_type: string;
    format: string;
    bytes: number;
    width?: number;
    height?: number;
    duration?: number;
    original_filename: string;
  };
}

interface MetadataFormProps {
  areas: Pick<Area, "id" | "name">[];
  devices: Pick<Device, "id" | "name">[];
  uploadedFiles: UploadedFile[];
  onSuccess: () => void;
}

export function MetadataForm({
  areas,
  devices,
  uploadedFiles,
  onSuccess,
}: MetadataFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    areaId: "",
    deviceId: "",
    capturedAt: new Date().toISOString().slice(0, 16),
    temperature: "",
    humidity: "",
    windSpeed: "",
    windDirection: "",
    triggerType: "MOTION",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.areaId) {
      toast.error("Please select an area");
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error("Please upload at least one file");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create capture records for each uploaded file
      const results = await Promise.all(
        uploadedFiles.map(async (file) => {
          if (!file.cloudinaryData) return null;

          const response = await fetch("/api/upload/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cloudinaryResponse: file.cloudinaryData,
              metadata: {
                areaId: formData.areaId,
                deviceId: formData.deviceId && formData.deviceId !== "none" ? formData.deviceId : undefined,
                capturedAt: new Date(formData.capturedAt).toISOString(),
                temperature: formData.temperature
                  ? parseFloat(formData.temperature)
                  : undefined,
                humidity: formData.humidity
                  ? parseFloat(formData.humidity)
                  : undefined,
                windSpeed: formData.windSpeed
                  ? parseFloat(formData.windSpeed)
                  : undefined,
                windDirection: formData.windDirection && formData.windDirection !== "none" ? formData.windDirection : undefined,
                triggerType: formData.triggerType,
              },
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to create capture record");
          }

          return response.json();
        })
      );

      const successCount = results.filter((r) => r !== null).length;
      toast.success(`${successCount} capture(s) saved successfully`);
      onSuccess();
    } catch (error) {
      console.error("Error saving captures:", error);
      toast.error("Failed to save captures");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validFiles = uploadedFiles.filter((f) => f.cloudinaryData);

  if (validFiles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Capture Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 text-center py-4">
            Upload files first to add metadata
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Capture Metadata</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label required>Area / Location</Label>
              <Select
                value={formData.areaId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, areaId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Device (Optional)</Label>
              <Select
                value={formData.deviceId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, deviceId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No device</SelectItem>
                  {devices.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label required>Captured At</Label>
              <Input
                type="datetime-local"
                value={formData.capturedAt}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, capturedAt: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Trigger Type</Label>
              <Select
                value={formData.triggerType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, triggerType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4">
            <p className="text-sm font-medium text-slate-300 mb-3">
              Environmental Data (Optional)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Temperature (°C)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="-50"
                  max="60"
                  placeholder="25.0"
                  value={formData.temperature}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, temperature: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Humidity (%)</Label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  placeholder="65"
                  value={formData.humidity}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, humidity: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Wind Speed (km/h)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="200"
                  placeholder="10.0"
                  value={formData.windSpeed}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, windSpeed: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Wind Direction</Label>
                <Select
                  value={formData.windDirection}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, windDirection: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not specified</SelectItem>
                    {WIND_DIRECTIONS.map((dir) => (
                      <SelectItem key={dir} value={dir}>
                        {dir}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving {validFiles.length} capture(s)...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save {validFiles.length} Capture(s)
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
