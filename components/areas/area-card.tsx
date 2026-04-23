"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCoordinates } from "@/lib/utils";
import { MapPin, Image, Radio, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AreaWithCounts } from "@/types";

interface AreaCardProps {
  area: AreaWithCounts;
  onDelete?: (id: string) => void;
}

export function AreaCard({ area, onDelete }: AreaCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-green-900/30 p-2">
              <MapPin className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <Link
                href={`/areas/${area.id}`}
                className="font-semibold text-slate-100 hover:text-green-400 transition-colors"
              >
                {area.name}
              </Link>
              <p className="text-sm text-slate-400 mt-0.5">
                {formatCoordinates(area.latitude, area.longitude)}
              </p>
              {area.description && (
                <p className="text-sm text-slate-400 mt-2 line-clamp-2">
                  {area.description}
                </p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/areas/${area.id}`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => onDelete?.(area.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-700">
          <div className="flex items-center gap-1.5 text-sm text-slate-400">
            <Image className="h-4 w-4 text-slate-500" />
            <span>{area._count.captures} captures</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-400">
            <Radio className="h-4 w-4 text-slate-500" />
            <span>{area._count.devices} devices</span>
          </div>
          <div className="ml-auto">
            <Badge variant={area.isActive ? "default" : "secondary"}>
              {area.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
