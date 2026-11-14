"use client";

import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!offline) return null;
  return (
    <div role="status" className="flex items-center gap-2 bg-warning-subtle px-8 py-2 text-sm text-primary">
      <WifiOff aria-hidden className="size-4 text-warning" />
      You’re offline. Your book is saved on this device – writing will continue when you’re back online.
    </div>
  );
}
