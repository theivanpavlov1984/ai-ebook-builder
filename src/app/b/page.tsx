import type { Metadata } from "next";
import { SharedPage } from "@/components/reader/SharedPage";

export const metadata: Metadata = { title: "A book made with Primer" };

export default function SharedBookPage() {
  return <SharedPage />;
}
