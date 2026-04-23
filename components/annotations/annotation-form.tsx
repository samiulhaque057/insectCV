"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CLASSIFICATION_OPTIONS, COMMON_INSECT_TYPES } from "@/lib/constants";
import { toast } from "sonner";
import { Plus, AlertCircle, Leaf, HelpCircle } from "lucide-react";
import type { Classification } from "@/types";

interface AnnotationFormProps {
  captureId: string;
  onSuccess?: () => void;
}

export function AnnotationForm({ captureId, onSuccess }: AnnotationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classification, setClassification] = useState<Classification | "">("");
  const [insectType, setInsectType] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!classification) {
      toast.error("Please select a classification");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/captures/${captureId}/annotations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classification,
          insectType: insectType || undefined,
          notes: notes || undefined,
          source: "MANUAL",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create annotation");
      }

      toast.success("Annotation added successfully");
      setClassification("");
      setInsectType("");
      setNotes("");
      onSuccess?.();
    } catch {
      toast.error("Failed to add annotation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Annotation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label required>Classification</Label>
            <div className="grid grid-cols-3 gap-2">
              {CLASSIFICATION_OPTIONS.map((option) => {
                const Icon =
                  option.value === "HARMFUL"
                    ? AlertCircle
                    : option.value === "HARMLESS"
                      ? Leaf
                      : HelpCircle;
                const colors =
                  option.value === "HARMFUL"
                    ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    : option.value === "HARMLESS"
                      ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                      : "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100";
                const selectedColors =
                  option.value === "HARMFUL"
                    ? "border-red-500 bg-red-100 ring-2 ring-red-500"
                    : option.value === "HARMLESS"
                      ? "border-green-500 bg-green-100 ring-2 ring-green-500"
                      : "border-purple-500 bg-purple-100 ring-2 ring-purple-500";

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setClassification(option.value as Classification)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      classification === option.value ? selectedColors : colors
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Insect Type</Label>
            <Select value={insectType} onValueChange={setInsectType}>
              <SelectTrigger>
                <SelectValue placeholder="Select or type insect type" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_INSECT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Or enter custom type..."
              value={insectType}
              onChange={(e) => setInsectType(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              placeholder="Additional observations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Annotation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
