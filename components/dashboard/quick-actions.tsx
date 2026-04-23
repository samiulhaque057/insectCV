import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Database, Download, Image } from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      title: "Upload Captures",
      description: "Add new images or videos",
      icon: Upload,
      href: "/manage",
      color: "bg-green-900/30 text-green-400",
    },
    {
      title: "Manage Data",
      description: "CRUD operations for DB",
      icon: Database,
      href: "/manage",
      color: "bg-blue-900/30 text-blue-400",
    },
    {
      title: "Review Pending",
      description: "Annotate pending captures",
      icon: Image,
      href: "/captures?status=PENDING",
      color: "bg-amber-900/30 text-amber-400",
    },
    {
      title: "Export Dataset",
      description: "Export for ML training",
      icon: Download,
      href: "/exports/new",
      color: "bg-purple-900/30 text-purple-400",
    },
  ];

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 grid grid-cols-2 gap-2 sm:gap-3">
        {actions.map((action) => (
          <Button
            key={action.title}
            variant="outline"
            className="h-auto flex-col items-start gap-1.5 sm:gap-2 p-3 sm:p-4 justify-start"
            asChild
          >
            <Link href={action.href}>
              <div className={`rounded-lg p-1.5 sm:p-2 ${action.color}`}>
                <action.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-100 text-xs sm:text-sm">{action.title}</p>
                <p className="text-[10px] sm:text-xs text-slate-400 font-normal hidden sm:block">
                  {action.description}
                </p>
              </div>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
