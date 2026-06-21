"use client";

import { useEffect } from "react";
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
import { AdminView } from "@/components/admin/admin-view";
import { AuthModal } from "@/components/platform/auth-modal";
import { EbookReader } from "@/components/reader/ebook-reader";
import { ContactView } from "@/components/views/contact-view";
import { LibraryView } from "@/components/views/library-view";
import { AccountView } from "@/components/views/account-view";
import { SearchView } from "@/components/views/search-view";

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
          <AdminView />
        </main>
        <AuthModal />
        <AnimatePresence>
          {readerBookSlug && <EbookReader key={readerBookSlug} slug={readerBookSlug} />}
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
            {view === "library" && <LibraryView />}
            {view === "account" && <AccountView />}
            {view === "search" && <SearchView />}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <MobileNav />

      {/* Global auth modal */}
      <AuthModal />

      {/* Ebook reader overlay */}
      <AnimatePresence>
        {readerBookSlug && <EbookReader key={readerBookSlug} slug={readerBookSlug} />}
      </AnimatePresence>
    </div>
  );
}
