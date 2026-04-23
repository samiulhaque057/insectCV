"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { X, Filter, Save, Trash2 } from "lucide-react";
import { STATUS_OPTIONS, CLASSIFICATION_OPTIONS, MEDIA_TYPE_OPTIONS } from "@/lib/constants";
import type { Area } from "@/types";

const SAVED_VIEWS_STORAGE_KEY = "captures.savedViews";
const FILTER_KEYS = ["areaId", "status", "classification", "mediaType", "startDate", "endDate"] as const;

type SavedView = {
  id: string;
  name: string;
  params: Record<string, string>;
};

interface CaptureFiltersProps {
  areas: Pick<Area, "id" | "name">[];
}

export function CaptureFilters({ areas }: CaptureFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [savedViews, setSavedViews] = useState<SavedView[]>(() => {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(SAVED_VIEWS_STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as SavedView[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [selectedViewId, setSelectedViewId] = useState<string>("none");

  const activeFilters = useMemo(() => {
    const result: Record<string, string> = {};
    FILTER_KEYS.forEach((key) => {
      const value = searchParams.get(key);
      if (value) result[key] = value;
    });
    return result;
  }, [searchParams]);

  const persistViews = (views: SavedView[]) => {
    setSavedViews(views);
    localStorage.setItem(SAVED_VIEWS_STORAGE_KEY, JSON.stringify(views));
  };

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // Reset to first page
    router.push(`/captures?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/captures");
    setSelectedViewId("none");
  };

  const saveCurrentView = () => {
    if (Object.keys(activeFilters).length === 0) return;
    const name = window.prompt("Saved view name");
    if (!name?.trim()) return;

    const next: SavedView = {
      id: `${Date.now()}`,
      name: name.trim(),
      params: activeFilters,
    };

    persistViews([next, ...savedViews]);
    setSelectedViewId(next.id);
  };

  const applySavedView = (id: string) => {
    setSelectedViewId(id);
    if (id === "none") {
      clearFilters();
      return;
    }

    const view = savedViews.find((item) => item.id === id);
    if (!view) return;

    const params = new URLSearchParams();
    Object.entries(view.params).forEach(([key, value]) => {
      params.set(key, value);
    });
    params.set("page", "1");
    router.push(`/captures?${params.toString()}`);
  };

  const deleteSavedView = () => {
    if (selectedViewId === "none") return;
    const next = savedViews.filter((item) => item.id !== selectedViewId);
    persistViews(next);
    setSelectedViewId("none");
  };

  const hasFilters =
    searchParams.get("areaId") ||
    searchParams.get("status") ||
    searchParams.get("classification") ||
    searchParams.get("mediaType") ||
    searchParams.get("startDate") ||
    searchParams.get("endDate");

  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="font-medium text-sm text-slate-300">Filters</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={saveCurrentView}
            className="text-slate-300"
            disabled={Object.keys(activeFilters).length === 0}
          >
            <Save className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Save view</span>
          </Button>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="ml-auto text-slate-400"
            >
              <X className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Clear all</span>
            </Button>
          )}
        </div>

        <div className="mb-3 sm:mb-4 flex flex-wrap items-center gap-2">
          <div className="w-full sm:w-64">
            <Select value={selectedViewId} onValueChange={applySavedView}>
              <SelectTrigger>
                <SelectValue placeholder="Saved views" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No saved view</SelectItem>
                {savedViews.map((view) => (
                  <SelectItem key={view.id} value={view.id}>
                    {view.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={deleteSavedView}
            disabled={selectedViewId === "none"}
          >
            <Trash2 className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Delete view</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Area</Label>
            <Select
              value={searchParams.get("areaId") || "all"}
              onValueChange={(value) => updateFilter("areaId", value === "all" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All areas</SelectItem>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Status</Label>
            <Select
              value={searchParams.get("status") || "all"}
              onValueChange={(value) => updateFilter("status", value === "all" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Classification</Label>
            <Select
              value={searchParams.get("classification") || "all"}
              onValueChange={(value) => updateFilter("classification", value === "all" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All classifications" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All classifications</SelectItem>
                {CLASSIFICATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Media Type</Label>
            <Select
              value={searchParams.get("mediaType") || "all"}
              onValueChange={(value) => updateFilter("mediaType", value === "all" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {MEDIA_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Start Date</Label>
            <Input
              type="date"
              value={searchParams.get("startDate")?.split("T")[0] || ""}
              onChange={(e) =>
                updateFilter(
                  "startDate",
                  e.target.value ? `${e.target.value}T00:00:00Z` : null
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">End Date</Label>
            <Input
              type="date"
              value={searchParams.get("endDate")?.split("T")[0] || ""}
              onChange={(e) =>
                updateFilter(
                  "endDate",
                  e.target.value ? `${e.target.value}T23:59:59Z` : null
                )
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
