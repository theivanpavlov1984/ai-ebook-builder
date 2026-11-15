import type { Metadata } from "next";
import { NotFound } from "@/widgets/layout";

export const metadata: Metadata = { title: "Page not found – Primer" };

export default function NotFoundPage() {
  return (
    <NotFound
      active={null}
      title="This page doesn’t exist"
      body="The link may be mistyped or out of date. Start a new book, or find the ones you’ve made in My books."
    />
  );
}
