"use client";

import { motion } from "motion/react";
import { Home, BookOpen, FileText, Newspaper, User } from "lucide-react";
import { useNav, type View } from "@/lib/store/nav";
import { ExpandableTabs } from "./expandable-tabs";

const TABS = [
  { title: "Home", view: "home" as View, icon: Home },
  { title: "Books", view: "books" as View, icon: BookOpen },
  { title: "Resources", view: "resources" as View, icon: FileText },
  { title: "Blog", view: "blog" as View, icon: Newspaper },
  { title: "About", view: "about" as View, icon: User },
];

export function MobileNav() {
  const { view, navigate } = useNav();

  // About tab is also active when on Contact (Contact is reached via About area).
  const activeIndex = (() => {
    const idx = TABS.findIndex((t) => t.view === view);
    if (idx !== -1) return idx;
    return view === "contact" ? TABS.findIndex((t) => t.view === "about") : 0;
  })();

  return (
    <div
      className="fixed inset-x-0 z-50 flex justify-center px-3 md:hidden"
      style={{ bottom: "max(28px, env(safe-area-inset-bottom))" }}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.2 }}
        className="w-full max-w-md"
      >
        <ExpandableTabs
          tabs={TABS}
          value={activeIndex}
          activeColor="text-clay"
          className="flex-nowrap justify-between gap-0.5 border-border/60 bg-background/85 backdrop-blur-xl shadow-float"
          onChange={(index) => {
            if (index === null) return;
            const t = TABS[index];
            if (t) navigate(t.view);
          }}
        />
      </motion.div>
    </div>
  );
}
