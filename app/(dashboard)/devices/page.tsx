"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Radio, Plus, Image, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { generateDeviceSerial, formatDateTime } from "@/lib/utils";
import { DEVICE_TYPE_OPTIONS } from "@/lib/constants";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { DeviceWithArea, Area } from "@/types";

export default function DevicesPage() {
  const [devices, setDevices] = useState<(DeviceWithArea & { _count: { captures: number } })[]>([]);
  const [areas, setAreas] = useState<Pick<Area, "id" | "name">[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    serialNumber: "",
    deviceType: "CAMERA",
    areaId: "",
    isActive: true,
  });

  const fetchData = async () => {
    try {
      const [devicesRes, areasRes] = await Promise.all([
        fetch("/api/devices"),
        fetch("/api/areas"),
      ]);

      if (devicesRes.ok) {
        const data = await devicesRes.json();
        setDevices(data.data);
      }
      if (areasRes.ok) {
        const data = await areasRes.json();
        setAreas(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load devices");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!formData.name) {
      toast.error("Please enter a device name");
      return;
    }

    try {
      const response = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          serialNumber: formData.serialNumber || generateDeviceSerial(),
          areaId: formData.areaId || undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to create");

      toast.success("Device created successfully");
      setIsDialogOpen(false);
      setFormData({
        name: "",
        serialNumber: "",
        deviceType: "CAMERA",
        areaId: "",
        isActive: true,
      });
      fetchData();
    } catch {
      toast.error("Failed to create device");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/devices/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast.success("Device deleted successfully");
      setDevices((prev) => prev.filter((d) => d.id !== id));
      setDeletingId(null);
    } catch {
      toast.error("Failed to delete device");
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <PageHeader title="Devices" description="Loading..." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <PageHeader
        title="Devices"
        description={`${devices.length} devices registered`}
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Device</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label required>Device Name</Label>
                <Input
                  placeholder="e.g., Field Camera 1"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Serial Number</Label>
                <Input
                  placeholder="Auto-generated if empty"
                  value={formData.serialNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      serialNumber: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Device Type</Label>
                <Select
                  value={formData.deviceType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, deviceType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEVICE_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Assigned Area</Label>
                <Select
                  value={formData.areaId || "unassigned"}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      areaId: value === "unassigned" ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">No area assigned</SelectItem>
                    {areas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700">
                <Label>Active</Label>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isActive: checked }))
                  }
                />
              </div>

              <Button onClick={handleCreate} className="w-full">
                Create Device
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {devices.length === 0 ? (
        <EmptyState
          icon={Radio}
          title="No devices registered"
          description="Register your first IoT device to start collecting data"
          action={{
            label: "Add Device",
            onClick: () => setIsDialogOpen(true),
          }}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => (
            <Card key={device.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-blue-900/30 p-2">
                      <Radio className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-100">
                        {device.name}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        {device.serialNumber}
                      </p>
                    </div>
                  </div>
                  <Badge variant={device.isActive ? "default" : "secondary"}>
                    {device.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <span>{device.area?.name || "No area assigned"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Image className="h-4 w-4 text-slate-500" />
                    <span>{device._count.captures} captures</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700 flex justify-between items-center">
                  <p className="text-xs text-slate-400">
                    {device.lastSyncAt
                      ? `Last sync: ${formatDateTime(device.lastSyncAt)}`
                      : "Never synced"}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingId(device.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={() => setDeletingId(null)}
        title="Delete Device"
        description="Are you sure you want to delete this device?"
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deletingId && handleDelete(deletingId)}
      />
    </div>
  );
}
