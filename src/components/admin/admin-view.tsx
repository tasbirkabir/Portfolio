"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  LayoutDashboard, BookOpen, Newspaper, FileText, ShoppingCart, Users,
  Mail, BarChart3, Settings, Search as SearchIcon, LogOut, ExternalLink,
  Loader2, UserCog, ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/store/auth";
import { useNav } from "@/lib/store/nav";
import { AuthPrompt } from "@/components/views/auth-prompt";
import { AdminDashboard } from "./admin-dashboard";
import { AdminBooks } from "./admin-books";
import { AdminBlog } from "./admin-blog";
import { AdminResources } from "./admin-resources";
import { AdminOrders } from "./admin-orders";
import { AdminUsers } from "./admin-users";
import { AdminNewsletter } from "./admin-newsletter";
import { AdminAnalytics } from "./admin-analytics";
import { AdminSettings } from "./admin-settings";
import { AdminAccount } from "./admin-account";
import { AdminSecurity } from "./admin-security";
import { cn } from "@/lib/utils";

type Tab = "dashboard" | "books" | "blog" | "resources" | "orders" | "users" | "newsletter" | "analytics" | "settings" | "account" | "security";

const NAV: { id: Tab; label: string; icon: typeof BookOpen }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "books", label: "Ebooks", icon: BookOpen },
  { id: "blog", label: "Blog", icon: Newspaper },
  { id: "resources", label: "Resources", icon: FileText },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "users", label: "Users", icon: Users },
  { id: "newsletter", label: "Newsletter", icon: Mail },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Site Settings", icon: Settings },
  { id: "account", label: "Account", icon: UserCog },
  { id: "security", label: "Security", icon: ShieldCheck },
];

export function AdminView() {
  const { user, loading, logout, fetchUser } = useAuth();
  const navigate = useNav((s) => s.navigate);
  const [tab, setTab] = useState<Tab>("dashboard");

  useEffect(() => {
    if (loading) fetchUser();
  }, [loading, fetchUser]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <AuthPrompt title="Admin access" desc="Sign in with an admin account to manage the entire platform." />;
  }
  if (user.role !== "admin") {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-display text-3xl">Admin only</h1>
        <p className="mt-2 text-muted-foreground">Your account doesn't have admin access. Sign in with your admin account.</p>
        <button onClick={() => { logout(); navigate("home"); }} className="mt-5 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background">Back to site</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-3xl border border-border/60 bg-card p-4">
            <div className="mb-4 flex items-center gap-2.5 px-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground font-display text-sm text-background">T</span>
              <div>
                <p className="text-sm font-semibold leading-tight">Admin</p>
                <p className="text-[10px] text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <nav className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col">
              {NAV.map((n) => {
                const Icon = n.icon;
                const active = tab === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => setTab(n.id)}
                    className={cn(
                      "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors",
                      active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {n.label}
                  </button>
                );
              })}
            </nav>
            <div className="mt-3 border-t border-border/60 pt-3">
              <button onClick={() => navigate("search")} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground">
                <SearchIcon className="h-4 w-4" /> Search
              </button>
              <button onClick={() => navigate("home")} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground">
                <ExternalLink className="h-4 w-4" /> View site
              </button>
              <button onClick={async () => { await logout(); navigate("home"); }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* Content */}
        <motion.main
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {tab === "dashboard" && <AdminDashboard onNavigate={setTab} />}
          {tab === "books" && <AdminBooks />}
          {tab === "blog" && <AdminBlog />}
          {tab === "resources" && <AdminResources />}
          {tab === "orders" && <AdminOrders />}
          {tab === "users" && <AdminUsers />}
          {tab === "newsletter" && <AdminNewsletter />}
          {tab === "analytics" && <AdminAnalytics />}
          {tab === "settings" && <AdminSettings />}
          {tab === "account" && <AdminAccount />}
          {tab === "security" && <AdminSecurity />}
        </motion.main>
      </div>
    </div>
  );
}
