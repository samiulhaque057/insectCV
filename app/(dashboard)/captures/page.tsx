export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { CaptureFilters } from "@/components/captures/capture-filters";
import { CapturesGridClient } from "@/components/captures/captures-grid-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload } from "lucide-react";
import type { CaptureStatus, MediaType, Classification } from "@/types";

const PAGE_SIZE = 12;
const EMPTY_CAPTURES_DATA = {
  captures: [],
  pagination: {
    page: 1,
    totalPages: 0,
    total: 0,
  },
  areas: [] as { id: string; name: string }[],
};

interface CapturesPageProps {
  searchParams: Promise<{
    page?: string;
    areaId?: string;
    status?: CaptureStatus;
    classification?: Classification;
    mediaType?: MediaType;
    startDate?: string;
    endDate?: string;
  }>;
}

async function getCaptures(searchParams: Awaited<CapturesPageProps["searchParams"]>) {
  const page = parseInt(searchParams.page || "1");

  const where: Record<string, unknown> = {};

  if (searchParams.areaId) where.areaId = searchParams.areaId;
  if (searchParams.status) where.status = searchParams.status;
  if (searchParams.mediaType) where.mediaType = searchParams.mediaType;

  if (searchParams.startDate || searchParams.endDate) {
    where.capturedAt = {};
    if (searchParams.startDate) {
      (where.capturedAt as Record<string, Date>).gte = new Date(searchParams.startDate);
    }
    if (searchParams.endDate) {
      (where.capturedAt as Record<string, Date>).lte = new Date(searchParams.endDate);
    }
  }

  if (searchParams.classification) {
    where.annotations = {
      some: {
        classification: searchParams.classification,
      },
    };
  }

  try {
    const [captures, total, areas] = await Promise.all([
      db.capture.findMany({
        where,
        include: {
          area: { select: { id: true, name: true } },
          device: { select: { id: true, name: true } },
          annotations: {
            select: { id: true, classification: true, isVerified: true },
            take: 1,
          },
        },
        orderBy: { capturedAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      db.capture.count({ where }),
      db.area.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return {
      captures,
      pagination: {
        page,
        totalPages: Math.ceil(total / PAGE_SIZE),
        total,
      },
      areas,
    };
  } catch (error) {
    console.error("Failed to load captures data from database:", error);
    return {
      ...EMPTY_CAPTURES_DATA,
      pagination: {
        ...EMPTY_CAPTURES_DATA.pagination,
        page,
      },
    };
  }
}

function CapturesLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default async function CapturesPage({ searchParams }: CapturesPageProps) {
  const params = await searchParams;
  const data = await getCaptures(params);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <PageHeader
        title="Captures"
        description={`${data.pagination.total} captures in your collection`}
      >
        <Button asChild>
          <Link href="/upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Link>
        </Button>
      </PageHeader>

      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <CaptureFilters areas={data.areas} />
      </Suspense>

      <Suspense fallback={<CapturesLoading />}>
        <CapturesGridClient captures={data.captures} />
      </Suspense>

      {data.pagination.totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <PaginationWrapper
            currentPage={data.pagination.page}
            totalPages={data.pagination.totalPages}
          />
        </div>
      )}
    </div>
  );
}

function PaginationWrapper({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
        Math.max(0, currentPage - 3),
        currentPage + 2
      ).map((page) => (
        <Link
          key={page}
          href={`/captures?page=${page}`}
          className={`px-3 py-1 rounded-md text-sm ${
            page === currentPage
              ? "bg-green-600 text-white"
              : "bg-slate-700 text-slate-200 hover:bg-slate-600"
          }`}
        >
          {page}
        </Link>
      ))}
    </div>
  );
}
