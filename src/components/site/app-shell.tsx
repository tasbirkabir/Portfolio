"use client";

import { useEffect, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNav } from "@/lib/store/nav";
import { useAuth } from "@/lib/store/auth";
import { Navbar } from "@/components/site/navbar";
import { MobileNav } from "@/components/site/mobile-nav";
import { Footer } from "@/components/site/footer";
import { HomeView } from "@/components/views/home-view";
import { AboutView } from "@/components/views/about-view";
import { BooksView } from "@/components/views/books-view";
import { BookView } from "@/components/views/book-view";
import { ResourcesView } from "@/components/views/resources-view";
import { BlogView } from "@/components/views/blog-view";
import { PostView } from "@/components/views/post-view";
import { AuthModal } from "@/components/platform/auth-modal";
import { ContactView } from "@/components/views/contact-view";

// Lazy-load heavy views that aren't needed on initial page load.
// This cuts ~257 KiB of unused JavaScript from the initial bundle.
const AdminView = lazy(() => import("@/components/admin/admin-view").then(m => ({ default: m.AdminView })));
const EbookReader = lazy(() => import("@/components/reader/ebook-reader").then(m => ({ default: m.EbookReader })));
const LibraryView = lazy(() => import("@/components/views/library-view").then(m => ({ default: m.LibraryView })));
const AccountView = lazy(() => import("@/components/views/account-view").then(m => ({ default: m.AccountView })));
const SearchView = lazy(() => import("@/components/views/search-view").then(m => ({ default: m.SearchView })));
const KnowledgeHubView = lazy(() => import("@/components/views/knowledge-hub-view").then(m => ({ default: m.KnowledgeHubView })));
const CheckoutModal = lazy(() => import("@/components/platform/checkout-modal").then(m => ({ default: m.CheckoutModal })));

function ViewLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-foreground" />
    </div>
  );
}

export function AppShell() {
  const { view, bookSlug, postSlug, pageKey, readerBookSlug } = useNav();
  const fetchUser = useAuth((s) => s.fetchUser);

  // Fetch the current user on mount so the whole app knows the auth state
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Admin view: no public chrome
  if (view === "admin") {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 pt-16">
          <Suspense fallback={<ViewLoader />}>
            <AdminView />
          </Suspense>
        </main>
        <AuthModal />
        <AnimatePresence>
          {readerBookSlug && (
            <Suspense fallback={null}>
              <EbookReader key={readerBookSlug} slug={readerBookSlug} />
            </Suspense>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="skip-link">Skip to content</a>
      <Navbar />
      <main id="main" className="flex-1 pt-20 sm:pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={pageKey}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {view === "home" && <HomeView />}
            {view === "about" && <AboutView />}
            {view === "books" && <BooksView />}
            {view === "book" && bookSlug && <BookView slug={bookSlug} />}
            {view === "resources" && <ResourcesView />}
            {view === "blog" && <BlogView />}
            {view === "post" && postSlug && <PostView slug={postSlug} />}
            {view === "contact" && <ContactView />}
            {view === "library" && <Suspense fallback={<ViewLoader />}><LibraryView /></Suspense>}
            {view === "account" && <Suspense fallback={<ViewLoader />}><AccountView /></Suspense>}
            {view === "search" && <Suspense fallback={<ViewLoader />}><SearchView /></Suspense>}
            {view === "knowledge" && <Suspense fallback={<ViewLoader />}><KnowledgeHubView /></Suspense>}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <MobileNav />

      {/* Global auth modal */}
      <AuthModal />

      {/* Ebook reader overlay */}
      <AnimatePresence>
        {readerBookSlug && (
          <Suspense fallback={null}>
            <EbookReader key={readerBookSlug} slug={readerBookSlug} />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}
