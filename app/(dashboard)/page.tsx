export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentCaptures } from "@/components/dashboard/recent-captures";
import { ClassificationChart } from "@/components/dashboard/classification-chart";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Image, Clock, CheckCircle, MapPin, Radio, AlertCircle } from "lucide-react";

const EMPTY_DASHBOARD_DATA = {
  totalCaptures: 0,
  pendingCount: 0,
  verifiedCount: 0,
  totalAreas: 0,
  activeDevices: 0,
  recentCaptures: [],
  classificationBreakdown: {
    harmful: 0,
    harmless: 0,
    unknown: 0,
  },
  capturesByDay: [] as { date: string; count: number }[],
};

async function getDashboardData() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  try {
    const [
      totalCaptures,
      pendingCount,
      verifiedCount,
      totalAreas,
      activeDevices,
      recentCaptures,
      classificationCounts,
      capturesByDay,
    ] = await Promise.all([
      db.capture.count(),
      db.capture.count({ where: { status: "PENDING" } }),
      db.capture.count({ where: { status: "VERIFIED" } }),
      db.area.count({ where: { isActive: true } }),
      db.device.count({ where: { isActive: true } }),
      db.capture.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          area: { select: { id: true, name: true } },
          device: { select: { id: true, name: true } },
          annotations: {
            select: { id: true, classification: true, isVerified: true },
            take: 1,
          },
        },
      }),
      db.annotation.groupBy({
        by: ["classification"],
        _count: { classification: true },
      }),
      db.capture.groupBy({
        by: ["capturedAt"],
        where: { capturedAt: { gte: sevenDaysAgo } },
        _count: { id: true },
        orderBy: { capturedAt: "asc" },
      }),
    ]);

    // Format classification breakdown
    const classificationBreakdown = {
      harmful: 0,
      harmless: 0,
      unknown: 0,
    };
    classificationCounts.forEach((item) => {
      const key = item.classification.toLowerCase() as keyof typeof classificationBreakdown;
      classificationBreakdown[key] = item._count.classification;
    });

    // Aggregate captures by day
    const dailyCounts: Record<string, number> = {};
    capturesByDay.forEach((item) => {
      const date = item.capturedAt.toISOString().split("T")[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + item._count.id;
    });

    const formattedCapturesByDay = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalCaptures,
      pendingCount,
      verifiedCount,
      totalAreas,
      activeDevices,
      recentCaptures,
      classificationBreakdown,
      capturesByDay: formattedCapturesByDay,
    };
  } catch (error) {
    console.error("Failed to load dashboard data from database:", error);
    return EMPTY_DASHBOARD_DATA;
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your insect data collection pipeline"
      />

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <StatsCard
          title="Total Captures"
          value={data.totalCaptures}
          icon={Image}
        />
        <StatsCard
          title="Pending Review"
          value={data.pendingCount}
          icon={Clock}
        />
        <StatsCard
          title="Verified"
          value={data.verifiedCount}
          icon={CheckCircle}
        />
        <StatsCard
          title="Active Areas"
          value={data.totalAreas}
          icon={MapPin}
        />
        <StatsCard
          title="Active Devices"
          value={data.activeDevices}
          icon={Radio}
        />
        <StatsCard
          title="Harmful Detected"
          value={data.classificationBreakdown.harmful}
          icon={AlertCircle}
        />
      </div>

      {/* Charts and Recent Captures */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <ActivityChart data={data.capturesByDay} />
          <RecentCaptures captures={data.recentCaptures} />
        </div>
        <div className="space-y-4 sm:space-y-6">
          <ClassificationChart data={data.classificationBreakdown} />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
