"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Image,
  Database,
  MapPin,
  Radio,
  Download,
  Bug,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Captures",
    href: "/captures",
    icon: Image,
  },
  {
    title: "Manage Data",
    href: "/manage",
    icon: Database,
  },
  {
    title: "Areas",
    href: "/areas",
    icon: MapPin,
  },
  {
    title: "Devices",
    href: "/devices",
    icon: Radio,
  },
  {
    title: "Exports",
    href: "/exports",
    icon: Download,
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (mobileOpen && onMobileClose) {
      onMobileClose();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Handle escape key to close mobile sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen && onMobileClose) {
        onMobileClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileOpen, onMobileClose]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen border-r border-white/10 bg-slate-950/60 backdrop-blur-xl transition-all duration-300",
          // Desktop: always visible, can be collapsed
          "hidden lg:block",
          collapsed ? "lg:w-[80px]" : "lg:w-[280px]",
          // Mobile: slide in from left
          mobileOpen && "block w-[280px]"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-500">
                <Bug className="h-6 w-6 text-white" />
              </div>
              {(!collapsed || mobileOpen) && (
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-100">InsectCV</span>
                  <span className="text-xs text-slate-300/80">Data Pipeline</span>
                </div>
              )}
            </Link>
            {/* Mobile close button */}
            {mobileOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMobileClose}
                className="lg:hidden"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/25 to-indigo-500/25 text-cyan-200 border border-cyan-300/20"
                      : "text-slate-300 hover:bg-white/10 hover:text-slate-100"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive ? "text-cyan-200" : "text-slate-400"
                    )}
                  />
                  {(!collapsed || mobileOpen) && <span>{item.title}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User info and sign out */}
          <div className="border-t border-white/10 p-4 space-y-2">
            {session?.user && (!collapsed || mobileOpen) && (
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                  <User className="h-4 w-4 text-slate-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className={cn(
                "w-full text-slate-400 hover:text-red-400 hover:bg-red-900/20",
                collapsed && !mobileOpen ? "justify-center" : "justify-start"
              )}
            >
              <LogOut className="h-4 w-4" />
              {(!collapsed || mobileOpen) && <span className="ml-2">Sign out</span>}
            </Button>
          </div>

          {/* Collapse button - only on desktop */}
          <div className="hidden lg:block border-t border-white/10 p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="w-full justify-center"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  <span>Collapse</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
