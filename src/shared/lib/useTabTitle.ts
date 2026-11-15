"use client";

import { useEffect } from "react";

/**
 * Shows `text` in the browser tab while the component is mounted; `undefined` leaves the page's own title.
 * The browser shows the first <title> in <head>. Next.js renders the page title from metadata, so we put
 * our own element in front of it and remove it on leaving – Next's element is never touched.
 */
export function useTabTitle(text: string | undefined) {
  useEffect(() => {
    if (!text) return;
    const el = document.createElement("title");
    el.textContent = text;
    const keepFirst = () => {
      if (document.head.querySelector("title") !== el) document.head.prepend(el);
    };
    keepFirst();
    // React may re-insert the metadata <title> at the top of <head> after navigation; stay in front of it.
    const observer = new MutationObserver(keepFirst);
    observer.observe(document.head, { childList: true });
    return () => {
      observer.disconnect();
      el.remove();
    };
  }, [text]);
}
