import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/Toast";
import { bricolage, geist, newsreader } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Primer – turn what you know into a book",
  description: "Create a polished lead-magnet eBook with AI in minutes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${geist.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-canvas font-ui text-base text-primary">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
