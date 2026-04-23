import { PageHeader } from "@/components/layout/page-header";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { AreaForm } from "@/components/areas/area-form";

export default function NewAreaPage() {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <Breadcrumb
        items={[
          { label: "Areas", href: "/areas" },
          { label: "New Area" },
        ]}
      />

      <PageHeader
        title="Create New Area"
        description="Add a new monitoring location for data collection"
      />

      <div className="max-w-2xl">
        <AreaForm mode="create" />
      </div>
    </div>
  );
}
