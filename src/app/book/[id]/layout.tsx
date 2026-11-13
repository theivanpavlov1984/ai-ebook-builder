import { Suspense, type ReactNode } from "react";

/** Book pages read the id on the client (books live in localStorage), so they stream in after prerendering. */
export default function BookLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
