"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { UploadZone } from "@/components/upload/upload-zone";
import { MetadataForm } from "@/components/upload/metadata-form";
import { toast } from "sonner";
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

export default function UploadPage() {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [areas, setAreas] = useState<Pick<Area, "id" | "name">[]>([]);
  const [devices, setDevices] = useState<Pick<Device, "id" | "name">[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [areasRes, devicesRes] = await Promise.all([
          fetch("/api/areas"),
          fetch("/api/devices"),
        ]);

        if (areasRes.ok) {
          const areasData = await areasRes.json();
          setAreas(areasData.data);
        }

        if (devicesRes.ok) {
          const devicesData = await devicesRes.json();
          setDevices(devicesData.data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load areas and devices");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const handleSuccess = () => {
    toast.success("Captures saved successfully!");
    router.push("/captures");
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <PageHeader title="Upload Captures" description="Loading..." />
      </div>
    );
  }

  if (areas.length === 0) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <PageHeader
          title="Upload Captures"
          description="Add new images and videos to your collection"
        />
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 sm:p-6 text-center">
          <p className="text-amber-800 font-medium mb-2">No areas configured</p>
          <p className="text-sm text-amber-700 mb-4">
            You need to create at least one monitoring area before uploading
            captures.
          </p>
          <a
            href="/areas/new"
            className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            Create an Area
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <PageHeader
        title="Upload Captures"
        description="Add new images and videos to your collection"
      />

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <UploadZone onFilesUploaded={handleFilesUploaded} />
        </div>
        <div>
          <MetadataForm
            areas={areas}
            devices={devices}
            uploadedFiles={uploadedFiles}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  );
}
