"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Toaster } from "sonner";
import { Menu, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-transparent">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Mobile header */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-white/10 bg-slate-950/65 backdrop-blur-md px-4 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-500">
            <Bug className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-slate-100">InsectCV</span>
        </Link>
      </div>

      {/* Main content */}
      <div className="lg:pl-[280px] transition-all duration-300">
        <main className="min-h-screen">{children}</main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
