import type { Metadata } from "next";
import { SharedPage } from "@/views/shared-book";

export const metadata: Metadata = { title: "A book made with Primer" };

export default function SharedBookPage() {
  return <SharedPage />;
}
