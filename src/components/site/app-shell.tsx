"use client";

import { useEffect, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNav } from "@/lib/store/nav";
import { useAuth } from "@/lib/store/auth";
import { Navbar } from "@/components/site/navbar";
import { MobileNav } from "@/components/site/mobile-nav";
import { Footer } from "@/components/site/footer";
import { HomeView } from "@/components/views/home-view";

// Lazy-load ALL views except HomeView (the landing page).
// This dramatically reduces unused JavaScript in the initial bundle.
const AboutView = lazy(() => import("@/components/views/about-view").then(m => ({ default: m.AboutView })));
const BooksView = lazy(() => import("@/components/views/books-view").then(m => ({ default: m.BooksView })));
const BookView = lazy(() => import("@/components/views/book-view").then(m => ({ default: m.BookView })));
const ResourcesView = lazy(() => import("@/components/views/resources-view").then(m => ({ default: m.ResourcesView })));
const BlogView = lazy(() => import("@/components/views/blog-view").then(m => ({ default: m.BlogView })));
const PostView = lazy(() => import("@/components/views/post-view").then(m => ({ default: m.PostView })));
const ContactView = lazy(() => import("@/components/views/contact-view").then(m => ({ default: m.ContactView })));
const AdminView = lazy(() => import("@/components/admin/admin-view").then(m => ({ default: m.AdminView })));
const EbookReader = lazy(() => import("@/components/reader/ebook-reader").then(m => ({ default: m.EbookReader })));
const LibraryView = lazy(() => import("@/components/views/library-view").then(m => ({ default: m.LibraryView })));
const AccountView = lazy(() => import("@/components/views/account-view").then(m => ({ default: m.AccountView })));
const SearchView = lazy(() => import("@/components/views/search-view").then(m => ({ default: m.SearchView })));
const KnowledgeHubView = lazy(() => import("@/components/views/knowledge-hub-view").then(m => ({ default: m.KnowledgeHubView })));
const AuthModal = lazy(() => import("@/components/platform/auth-modal").then(m => ({ default: m.AuthModal })));
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
        <Suspense fallback={null}><AuthModal /></Suspense>
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
            {view === "about" && <Suspense fallback={<ViewLoader />}><AboutView /></Suspense>}
            {view === "books" && <Suspense fallback={<ViewLoader />}><BooksView /></Suspense>}
            {view === "book" && bookSlug && <Suspense fallback={<ViewLoader />}><BookView slug={bookSlug} /></Suspense>}
            {view === "resources" && <Suspense fallback={<ViewLoader />}><ResourcesView /></Suspense>}
            {view === "blog" && <Suspense fallback={<ViewLoader />}><BlogView /></Suspense>}
            {view === "post" && postSlug && <Suspense fallback={<ViewLoader />}><PostView slug={postSlug} /></Suspense>}
            {view === "contact" && <Suspense fallback={<ViewLoader />}><ContactView /></Suspense>}
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
      <Suspense fallback={null}><AuthModal /></Suspense>

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
