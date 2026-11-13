import type { Metadata } from "next";
import { AppShell } from "@/components/shell/AppShell";
import { Showcase } from "./Showcase";

export const metadata: Metadata = {
  title: "Design system – Primer",
};

export default function SystemPage() {
  return (
    <AppShell active="new">
      <Showcase />
    </AppShell>
  );
}
