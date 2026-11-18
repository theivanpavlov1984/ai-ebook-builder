"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useHydrated } from "@/entities/book";
import { blankBookId, describePath } from "../model/blankBook";

/**
 * /new opened directly (typed, bookmarked, or clicked before the app loaded). In-app clicks skip this page –
 * see NewBookLink. Waits for saved books to load (creating one earlier would be overwritten by them).
 */
export function NewBook() {
  const router = useRouter();
  const hydrated = useHydrated();
  const started = useRef(false);

  useEffect(() => {
    if (!hydrated || started.current) return;
    started.current = true;
    router.replace(describePath(blankBookId()));
  }, [hydrated, router]);

  return null;
}
