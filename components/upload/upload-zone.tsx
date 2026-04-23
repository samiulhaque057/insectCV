"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Upload, Image, Video, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface UploadedFile {
  file: File;
  preview: string;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
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

interface UploadZoneProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
}

export function UploadZone({ onFilesUploaded }: UploadZoneProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: "pending" as const,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "video/*": [".mp4", ".webm", ".mov", ".avi"],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadFile = async (file: UploadedFile, index: number): Promise<UploadedFile> => {
    // Get signed upload params from our API
    const signatureResponse = await fetch("/api/upload", { method: "POST" });
    if (!signatureResponse.ok) {
      throw new Error("Failed to get upload signature");
    }
    const { data: signatureData } = await signatureResponse.json();

    // Upload to Cloudinary
    const formData = new FormData();
    formData.append("file", file.file);
    formData.append("api_key", signatureData.apiKey);
    formData.append("timestamp", signatureData.timestamp.toString());
    formData.append("signature", signatureData.signature);
    formData.append("upload_preset", signatureData.uploadPreset);
    formData.append("folder", signatureData.folder);

    const xhr = new XMLHttpRequest();
    const uploadUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`;

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setFiles((prev) => {
            const newFiles = [...prev];
            newFiles[index] = { ...newFiles[index], progress, status: "uploading" };
            return newFiles;
          });
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          const updatedFile: UploadedFile = {
            ...file,
            progress: 100,
            status: "complete",
            cloudinaryData: response,
          };
          setFiles((prev) => {
            const newFiles = [...prev];
            newFiles[index] = updatedFile;
            return newFiles;
          });
          resolve(updatedFile);
        } else {
          setFiles((prev) => {
            const newFiles = [...prev];
            newFiles[index] = { ...newFiles[index], status: "error" };
            return newFiles;
          });
          reject(new Error("Upload failed"));
        }
      });

      xhr.addEventListener("error", () => {
        setFiles((prev) => {
          const newFiles = [...prev];
          newFiles[index] = { ...newFiles[index], status: "error" };
          return newFiles;
        });
        reject(new Error("Upload failed"));
      });

      xhr.open("POST", uploadUrl);
      xhr.send(formData);
    });
  };

  const uploadAllFiles = async () => {
    setIsUploading(true);
    const pendingFiles = files.filter((f) => f.status === "pending");

    try {
      const uploadedFiles = await Promise.all(
        pendingFiles.map((file, index) => {
          const actualIndex = files.findIndex((f) => f === file);
          return uploadFile(file, actualIndex);
        })
      );
      onFilesUploaded(uploadedFiles);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const completedCount = files.filter((f) => f.status === "complete").length;

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed cursor-pointer transition-colors",
          isDragActive
            ? "border-green-500 bg-green-900/20"
            : "border-slate-600 hover:border-green-500"
        )}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <input {...getInputProps()} />
          <div className="rounded-full bg-green-900/30 p-4 mb-4">
            <Upload className="h-8 w-8 text-green-400" />
          </div>
          <p className="text-lg font-medium text-slate-100 mb-1">
            {isDragActive ? "Drop files here" : "Drag & drop files here"}
          </p>
          <p className="text-sm text-slate-400 mb-4">
            or click to browse your files
          </p>
          <p className="text-xs text-slate-500">
            Supports: PNG, JPG, GIF, WebP, MP4, WebM, MOV (max 100MB)
          </p>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-300">
                {files.length} file(s) selected
                {completedCount > 0 && ` (${completedCount} uploaded)`}
              </p>
              {pendingCount > 0 && (
                <Button onClick={uploadAllFiles} disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload All
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/50"
                >
                  <div className="h-12 w-12 rounded bg-slate-600 flex items-center justify-center overflow-hidden">
                    {file.file.type.startsWith("video/") ? (
                      <Video className="h-6 w-6 text-slate-400" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={file.preview}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-100 truncate">
                      {file.file.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {(file.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {file.status === "uploading" && (
                      <Progress value={file.progress} className="h-1 mt-1" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {file.status === "complete" && (
                      <span className="text-xs text-green-600 font-medium">
                        Uploaded
                      </span>
                    )}
                    {file.status === "error" && (
                      <span className="text-xs text-red-600 font-medium">
                        Failed
                      </span>
                    )}
                    {file.status === "uploading" && (
                      <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                    )}
                    {(file.status === "pending" || file.status === "error") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
