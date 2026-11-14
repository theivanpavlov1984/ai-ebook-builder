import type { Metadata } from "next";
import { MyBooks } from "@/views/books";
import { AppShell } from "@/widgets/layout";

export const metadata: Metadata = { title: "My books – Primer" };

export default function BooksPage() {
  return (
    <AppShell active="books">
      <div className="mx-auto max-w-[1080px] px-10 py-12">
        <h1 className="font-display text-2xl font-medium">My books</h1>
        <p className="mt-1 text-base text-secondary">Saved on this device.</p>
        <div className="mt-8">
          <MyBooks />
        </div>
      </div>
    </AppShell>
  );
}
