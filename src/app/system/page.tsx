import type { Metadata } from "next";
import { AppShell } from "@/widgets/layout";
import { Showcase } from "@/views/design-system";

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
