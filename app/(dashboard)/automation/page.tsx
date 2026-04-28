"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Loader2, ScanSearch } from "lucide-react";

type DetectionResult = {
  label: "HARMFUL" | "HARMLESS";
  insectName: string;
  confidence: number;
  details: string;
};

const HARMFUL_INSECTS = [
  { insectName: "Aphid", details: "Small sap-feeding pest often found in clusters on leaves." },
  { insectName: "Whitefly", details: "Winged pest that weakens crops by sucking plant nutrients." },
  { insectName: "Caterpillar", details: "Leaf-chewing larval stage that can rapidly damage plants." },
  { insectName: "Thrip", details: "Tiny insect causing silvering and distortion on leaf surfaces." },
];

const HARMLESS_INSECTS = [
  { insectName: "Ladybug", details: "Beneficial predator that feeds on aphids and soft-bodied pests." },
  { insectName: "Lacewing", details: "Helpful insect whose larvae consume many crop pests." },
  { insectName: "Bee", details: "Pollinator that supports flowering and fruit set." },
  { insectName: "Butterfly", details: "Generally harmless pollinator often seen around flowering crops." },
];

function getRandomResult(): DetectionResult {
  const label: DetectionResult["label"] = Math.random() > 0.5 ? "HARMFUL" : "HARMLESS";
  const pool = label === "HARMFUL" ? HARMFUL_INSECTS : HARMLESS_INSECTS;
  const selected = pool[Math.floor(Math.random() * pool.length)];
  const confidence = Number((70 + Math.random() * 29).toFixed(1));

  return {
    label,
    insectName: selected.insectName,
    confidence,
    details: selected.details,
  };
}

export default function AutomationPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    async function attachStream() {
      if (!cameraOpen || !videoRef.current || !streamRef.current) return;
      videoRef.current.srcObject = streamRef.current;
      try {
        await videoRef.current.play();
      } catch {
        setError("Webcam preview could not start. Please try again.");
      }
    }

    void attachStream();
  }, [cameraOpen]);

  const resultColor = useMemo(
    () => (result?.label === "HARMFUL" ? "text-red-400" : "text-green-400"),
    [result]
  );

  async function openCamera() {
    setError(null);
    setResult(null);
    setCapturedImage(null);

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      setCameraOpen(true);
    } catch {
      setError("Unable to access webcam. Please allow camera permission and try again.");
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  }

  function captureAndProcess() {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedImage(image);
    setResult(null);
    stopCamera();

    setIsProcessing(true);
    window.setTimeout(() => {
      setResult(getRandomResult());
      setIsProcessing(false);
    }, 2000);
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PageHeader
        title="Automation"
        description="Webcam capture with simulated ML insect classification."
      />

      <Card>
        <CardHeader>
          <CardTitle>Live Capture Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!cameraOpen && !capturedImage && (
            <Button onClick={openCamera}>
              <Camera className="h-4 w-4 mr-2" />
              Capture
            </Button>
          )}

          {cameraOpen && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl border border-white/15 bg-slate-900">
                <video
                  ref={videoRef}
                  className="w-full max-h-[420px] object-cover"
                  autoPlay
                  muted
                  playsInline
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={captureAndProcess}>
                  <ScanSearch className="h-4 w-4 mr-2" />
                  Take Picture
                </Button>
                <Button variant="outline" onClick={stopCamera}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {capturedImage && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl border border-white/15 bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={capturedImage} alt="Captured insect sample" className="w-full max-h-[420px] object-cover" />
              </div>
              <Button variant="outline" onClick={openCamera}>
                Retake
              </Button>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center gap-2 text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing image with demo ML model...
            </div>
          )}

          {result && (
            <div className="rounded-xl border border-white/15 bg-slate-900/50 p-4 space-y-2">
              <p className="text-sm text-slate-300">Prediction Result</p>
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    result.label === "HARMFUL"
                      ? "bg-red-600/20 text-red-300 border border-red-400/30"
                      : "bg-green-600/20 text-green-300 border border-green-400/30"
                  }
                >
                  {result.label}
                </Badge>
                <span className="text-sm text-slate-400">Confidence: {result.confidence}%</span>
              </div>
              <p className={`text-lg font-semibold ${resultColor}`}>{result.insectName}</p>
              <p className="text-sm text-slate-300">{result.details}</p>
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
