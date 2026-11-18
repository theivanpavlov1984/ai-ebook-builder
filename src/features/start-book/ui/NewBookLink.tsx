"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";
import { useBooks } from "@/entities/book";
import { blankBookId, describePath } from "../model/blankBook";

/**
 * "Start my book" and "New book". Opens a blank book on Describe in one step. Going through /new and
 * redirecting from there could leave the browser sitting on an empty /new after Back – the bug this replaces.
 * Keeps href="/new" so a new tab, or a click before saved books load, still works.
 */
type Props = Omit<ComponentProps<typeof Link>, "href"> & {
  /** Where a new-tab or early click goes; /new picks the blank book there. */
  href?: string;
};

export function NewBookLink({ onClick, href = "/new", ...props }: Props) {
  const router = useRouter();

  function open(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    const newTab = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
    if (e.defaultPrevented || newTab || !useBooks.persist.hasHydrated()) return;
    e.preventDefault();
    router.push(describePath(blankBookId()));
  }

  return <Link href={href} prefetch={false} onClick={open} {...props} />;
}
