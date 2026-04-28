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
  metadata: {
    areaName: string;
    deviceName: string;
    capturedAt: string;
    triggerType: "MOTION" | "SCHEDULED" | "MANUAL";
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";
    source: "MANUAL" | "ML_ASSISTED" | "IMPORTED";
    insectType: string;
    notes: string;
    boundingBoxX: number;
    boundingBoxY: number;
    boundingBoxW: number;
    boundingBoxH: number;
    verifiedBy: string;
  };
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

const AREA_NAMES = ["North Fence", "Rice Plot A", "Greenhouse 2", "East Crop Zone"];
const DEVICE_NAMES = ["Cam-01", "Fence Sensor A", "Field Unit 3", "Agri Node X"];
const TRIGGER_TYPES: DetectionResult["metadata"]["triggerType"][] = ["MOTION", "SCHEDULED", "MANUAL"];
const WIND_DIRECTIONS: DetectionResult["metadata"]["windDirection"][] = [
  "N",
  "NE",
  "E",
  "SE",
  "S",
  "SW",
  "W",
  "NW",
];
const NOTES = [
  "Detected near leaf edge with clear body outline.",
  "Single insect visible under moderate daylight conditions.",
  "Image quality is sufficient for manual validation.",
  "Specimen appears centered and suitable for annotation review.",
];

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function getRandomResult(): DetectionResult {
  const label: DetectionResult["label"] = Math.random() > 0.5 ? "HARMFUL" : "HARMLESS";
  const pool = label === "HARMFUL" ? HARMFUL_INSECTS : HARMLESS_INSECTS;
  const selected = randomItem(pool);
  const confidence = Number((70 + Math.random() * 29).toFixed(1));

  return {
    label,
    insectName: selected.insectName,
    confidence,
    details: selected.details,
    metadata: {
      areaName: randomItem(AREA_NAMES),
      deviceName: randomItem(DEVICE_NAMES),
      capturedAt: new Date().toLocaleString(),
      triggerType: randomItem(TRIGGER_TYPES),
      temperature: Number((22 + Math.random() * 11).toFixed(1)),
      humidity: Number((45 + Math.random() * 35).toFixed(1)),
      windSpeed: Number((2 + Math.random() * 18).toFixed(1)),
      windDirection: randomItem(WIND_DIRECTIONS),
      source: "ML_ASSISTED",
      insectType: selected.insectName,
      notes: randomItem(NOTES),
      boundingBoxX: Number((10 + Math.random() * 30).toFixed(1)),
      boundingBoxY: Number((12 + Math.random() * 28).toFixed(1)),
      boundingBoxW: Number((18 + Math.random() * 24).toFixed(1)),
      boundingBoxH: Number((16 + Math.random() * 22).toFixed(1)),
      verifiedBy: "Demo Reviewer",
    },
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

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                  <p className="text-xs text-slate-400">Area</p>
                  <p className="text-sm font-medium text-slate-100">{result.metadata.areaName}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                  <p className="text-xs text-slate-400">Device</p>
                  <p className="text-sm font-medium text-slate-100">{result.metadata.deviceName}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                  <p className="text-xs text-slate-400">Captured At</p>
                  <p className="text-sm font-medium text-slate-100">{result.metadata.capturedAt}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                  <p className="text-xs text-slate-400">Trigger Type</p>
                  <p className="text-sm font-medium text-slate-100">{result.metadata.triggerType}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                  <p className="text-xs text-slate-400">Temperature</p>
                  <p className="text-sm font-medium text-slate-100">{result.metadata.temperature}°C</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                  <p className="text-xs text-slate-400">Humidity</p>
                  <p className="text-sm font-medium text-slate-100">{result.metadata.humidity}%</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                  <p className="text-xs text-slate-400">Wind Speed</p>
                  <p className="text-sm font-medium text-slate-100">{result.metadata.windSpeed} km/h</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                  <p className="text-xs text-slate-400">Wind Direction</p>
                  <p className="text-sm font-medium text-slate-100">{result.metadata.windDirection}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                  <p className="text-xs text-slate-400">Annotation Source</p>
                  <p className="text-sm font-medium text-slate-100">{result.metadata.source}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                  <p className="text-xs text-slate-400">Insect Type</p>
                  <p className="text-sm font-medium text-slate-100">{result.metadata.insectType}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3 sm:col-span-2">
                  <p className="text-xs text-slate-400">Notes</p>
                  <p className="text-sm font-medium text-slate-100">{result.metadata.notes}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3 sm:col-span-2 lg:col-span-1">
                  <p className="text-xs text-slate-400">Bounding Box</p>
                  <p className="text-sm font-medium text-slate-100">
                    X: {result.metadata.boundingBoxX}, Y: {result.metadata.boundingBoxY}, W:{" "}
                    {result.metadata.boundingBoxW}, H: {result.metadata.boundingBoxH}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                  <p className="text-xs text-slate-400">Verified By</p>
                  <p className="text-sm font-medium text-slate-100">{result.metadata.verifiedBy}</p>
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
