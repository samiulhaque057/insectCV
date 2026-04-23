"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnnotationForm } from "@/components/annotations/annotation-form";
import { AnnotationList } from "@/components/annotations/annotation-list";
import type { Annotation } from "@/types";

interface CaptureAnnotationsProps {
  captureId: string;
  initialAnnotations: Annotation[];
}

export function CaptureAnnotations({
  captureId,
  initialAnnotations,
}: CaptureAnnotationsProps) {
  const router = useRouter();
  const [annotations, setAnnotations] = useState(initialAnnotations);

  const handleUpdate = () => {
    // Refresh the page data
    router.refresh();
    // Also re-fetch annotations client-side for immediate UI update
    fetchAnnotations();
  };

  const fetchAnnotations = async () => {
    try {
      const response = await fetch(`/api/captures/${captureId}/annotations`);
      if (response.ok) {
        const data = await response.json();
        setAnnotations(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch annotations:", error);
    }
  };

  return (
    <>
      <AnnotationForm captureId={captureId} onSuccess={handleUpdate} />
      <AnnotationList annotations={annotations} onUpdate={handleUpdate} />
    </>
  );
}
