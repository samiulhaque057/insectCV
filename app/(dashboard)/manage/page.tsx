"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  Database,
  Image,
  MapPin,
  Radio,
  Plus,
  Trash2,
  Upload,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { formatDateTime, generateDeviceSerial } from "@/lib/utils";
import { DEVICE_TYPE_OPTIONS } from "@/lib/constants";
import { UploadZone } from "@/components/upload/upload-zone";
import { MetadataForm } from "@/components/upload/metadata-form";

type TabType = "captures" | "areas" | "devices" | "upload";

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

export default function ManageDataPage() {
  const [activeTab, setActiveTab] = useState<TabType>("captures");
  const [captures, setCaptures] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<TabType | null>(null);

  // Area form
  const [areaDialogOpen, setAreaDialogOpen] = useState(false);
  const [areaForm, setAreaForm] = useState({
    name: "",
    description: "",
    latitude: "",
    longitude: "",
    isActive: true,
  });

  // Device form
  const [deviceDialogOpen, setDeviceDialogOpen] = useState(false);
  const [deviceForm, setDeviceForm] = useState({
    name: "",
    serialNumber: "",
    deviceType: "CAMERA",
    areaId: "",
    isActive: true,
  });

  // Upload
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [capturesRes, areasRes, devicesRes] = await Promise.all([
        fetch("/api/captures?limit=100"),
        fetch("/api/areas"),
        fetch("/api/devices"),
      ]);

      if (capturesRes.ok) {
        const data = await capturesRes.json();
        setCaptures(data.data || []);
      }
      if (areasRes.ok) {
        const data = await areasRes.json();
        setAreas(data.data || []);
      }
      if (devicesRes.ok) {
        const data = await devicesRes.json();
        setDevices(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deletingId || !deleteType) return;

    const endpoints: Record<string, string> = {
      captures: `/api/captures/${deletingId}`,
      areas: `/api/areas/${deletingId}`,
      devices: `/api/devices/${deletingId}`,
    };

    try {
      const response = await fetch(endpoints[deleteType], { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");

      toast.success(`${deleteType.slice(0, -1)} deleted successfully`);
      fetchData();
    } catch {
      toast.error(`Failed to delete ${deleteType.slice(0, -1)}`);
    } finally {
      setDeletingId(null);
      setDeleteType(null);
    }
  };

  const handleCreateArea = async () => {
    if (!areaForm.name || !areaForm.latitude || !areaForm.longitude) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const response = await fetch("/api/areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...areaForm,
          latitude: parseFloat(areaForm.latitude),
          longitude: parseFloat(areaForm.longitude),
        }),
      });

      if (!response.ok) throw new Error("Failed to create");

      toast.success("Area created successfully");
      setAreaDialogOpen(false);
      setAreaForm({ name: "", description: "", latitude: "", longitude: "", isActive: true });
      fetchData();
    } catch {
      toast.error("Failed to create area");
    }
  };

  const handleCreateDevice = async () => {
    if (!deviceForm.name) {
      toast.error("Please enter a device name");
      return;
    }

    try {
      const response = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...deviceForm,
          serialNumber: deviceForm.serialNumber || generateDeviceSerial(),
          areaId: deviceForm.areaId || undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to create");

      toast.success("Device created successfully");
      setDeviceDialogOpen(false);
      setDeviceForm({ name: "", serialNumber: "", deviceType: "CAMERA", areaId: "", isActive: true });
      fetchData();
    } catch {
      toast.error("Failed to create device");
    }
  };

  const tabs = [
    { id: "captures" as TabType, label: "Captures", icon: Image, count: captures.length },
    { id: "areas" as TabType, label: "Areas", icon: MapPin, count: areas.length },
    { id: "devices" as TabType, label: "Devices", icon: Radio, count: devices.length },
    { id: "upload" as TabType, label: "Upload", icon: Upload, count: null },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <PageHeader
        title="Manage Data"
        description="Create, view, and delete database records"
      >
        <Button variant="outline" onClick={fetchData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </PageHeader>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-green-900/50 text-green-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.count !== null && (
              <Badge variant="secondary" className="ml-1">
                {tab.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Captures Tab */}
      {activeTab === "captures" && (
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Captures ({captures.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            {captures.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No captures found. Upload some images first.</p>
            ) : (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Captured At</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {captures.map((capture) => (
                    <TableRow key={capture.id}>
                      <TableCell className="font-medium text-slate-100">{capture.fileName}</TableCell>
                      <TableCell className="text-slate-400">{capture.area?.name || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={capture.status === "VERIFIED" ? "default" : "secondary"}>
                          {capture.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400">{formatDateTime(capture.capturedAt)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingId(capture.id);
                            setDeleteType("captures");
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Areas Tab */}
      {activeTab === "areas" && (
        <Card>
          <CardHeader className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Areas ({areas.length})
            </CardTitle>
            <Button onClick={() => setAreaDialogOpen(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Area
            </Button>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            {areas.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No areas configured. Create your first monitoring area.</p>
            ) : (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Coordinates</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Captures</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {areas.map((area) => (
                    <TableRow key={area.id}>
                      <TableCell className="font-medium text-slate-100">{area.name}</TableCell>
                      <TableCell className="text-slate-400">{area.latitude?.toFixed(4)}, {area.longitude?.toFixed(4)}</TableCell>
                      <TableCell>
                        <Badge variant={area.isActive ? "default" : "secondary"}>
                          {area.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400">{area._count?.captures || 0}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingId(area.id);
                            setDeleteType("areas");
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Devices Tab */}
      {activeTab === "devices" && (
        <Card>
          <CardHeader className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Devices ({devices.length})
            </CardTitle>
            <Button onClick={() => setDeviceDialogOpen(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Device
            </Button>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            {devices.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No devices registered. Register your first IoT device.</p>
            ) : (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium text-slate-100">{device.name}</TableCell>
                      <TableCell className="text-slate-400 font-mono text-xs">{device.serialNumber}</TableCell>
                      <TableCell className="text-slate-400">{device.deviceType}</TableCell>
                      <TableCell className="text-slate-400">{device.area?.name || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={device.isActive ? "default" : "secondary"}>
                          {device.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingId(device.id);
                            setDeleteType("devices");
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Tab */}
      {activeTab === "upload" && (
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          <UploadZone onFilesUploaded={(files) => setUploadedFiles((prev) => [...prev, ...files])} />
          <MetadataForm
            areas={areas}
            devices={devices}
            uploadedFiles={uploadedFiles}
            onSuccess={() => {
              toast.success("Captures saved successfully!");
              setUploadedFiles([]);
              fetchData();
              setActiveTab("captures");
            }}
          />
        </div>
      )}

      {/* Area Dialog */}
      <Dialog open={areaDialogOpen} onOpenChange={setAreaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Area</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label required>Area Name</Label>
              <Input
                placeholder="e.g., North Field Section A"
                value={areaForm.name}
                onChange={(e) => setAreaForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Optional description..."
                value={areaForm.description}
                onChange={(e) => setAreaForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label required>Latitude</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g., 40.7128"
                  value={areaForm.latitude}
                  onChange={(e) => setAreaForm((prev) => ({ ...prev, latitude: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label required>Longitude</Label>
                <Input
                  type="number"
                  step="any"
                  placeholder="e.g., -74.0060"
                  value={areaForm.longitude}
                  onChange={(e) => setAreaForm((prev) => ({ ...prev, longitude: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700">
              <Label>Active</Label>
              <Switch
                checked={areaForm.isActive}
                onCheckedChange={(checked) => setAreaForm((prev) => ({ ...prev, isActive: checked }))}
              />
            </div>
            <Button onClick={handleCreateArea} className="w-full">
              Create Area
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Device Dialog */}
      <Dialog open={deviceDialogOpen} onOpenChange={setDeviceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register New Device</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label required>Device Name</Label>
              <Input
                placeholder="e.g., Field Camera 1"
                value={deviceForm.name}
                onChange={(e) => setDeviceForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Serial Number</Label>
              <Input
                placeholder="Auto-generated if empty"
                value={deviceForm.serialNumber}
                onChange={(e) => setDeviceForm((prev) => ({ ...prev, serialNumber: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Device Type</Label>
              <Select
                value={deviceForm.deviceType}
                onValueChange={(value) => setDeviceForm((prev) => ({ ...prev, deviceType: value }))}
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
                value={deviceForm.areaId}
                onValueChange={(value) => setDeviceForm((prev) => ({ ...prev, areaId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No area assigned</SelectItem>
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
                checked={deviceForm.isActive}
                onCheckedChange={(checked) => setDeviceForm((prev) => ({ ...prev, isActive: checked }))}
              />
            </div>
            <Button onClick={handleCreateDevice} className="w-full">
              Create Device
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingId}
        onOpenChange={() => {
          setDeletingId(null);
          setDeleteType(null);
        }}
        title={`Delete ${deleteType?.slice(0, -1) || "item"}`}
        description={`Are you sure you want to delete this ${deleteType?.slice(0, -1) || "item"}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
