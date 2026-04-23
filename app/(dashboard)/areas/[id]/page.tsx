export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { AreaForm } from "@/components/areas/area-form";

interface EditAreaPageProps {
  params: Promise<{ id: string }>;
}

async function getArea(id: string) {
  const area = await db.area.findUnique({
    where: { id },
  });

  return area;
}

export default async function EditAreaPage({ params }: EditAreaPageProps) {
  const { id } = await params;
  const area = await getArea(id);

  if (!area) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <Breadcrumb
        items={[
          { label: "Areas", href: "/areas" },
          { label: area.name },
        ]}
      />

      <PageHeader
        title={`Edit ${area.name}`}
        description="Update area details and settings"
      />

      <div className="max-w-2xl">
        <AreaForm area={area} mode="edit" />
      </div>
    </div>
  );
}
