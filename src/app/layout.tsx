import type { Metadata } from "next";
import { ToastProvider } from "@/shared/ui";
import { bricolage, geist, newsreader } from "@/app/fonts";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Primer – turn what you know into a book",
  description: "Create a polished lead-magnet eBook with AI in minutes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // scrollbar-gutter: stable keeps room for the scrollbar, so pages don't shift sideways when they grow taller.
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${geist.variable} ${bricolage.variable} h-full [scrollbar-gutter:stable] antialiased`}
    >
      <body className="min-h-full bg-canvas font-ui text-base text-primary">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
