import type { Metadata } from "next";
import { NewBook } from "@/features/start-book";

export const metadata: Metadata = { title: "New book – Primer" };

export default function NewBookPage() {
  return <NewBook />;
}
