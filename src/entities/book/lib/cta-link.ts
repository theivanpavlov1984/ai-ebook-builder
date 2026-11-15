/**
 * The link on a book's last page – where a lead magnet sends its readers next.
 * People type addresses the way they say them ("mysite.com/call"), so a missing scheme is added.
 * Returns undefined for an empty field or anything that isn't a web address.
 */
export function ctaLink(raw: string | undefined): { href: string; label: string } | undefined {
  const text = raw?.trim();
  if (!text || /\s/.test(text)) return undefined;
  const withScheme = /^[a-z][a-z\d+.-]*:/i.test(text) ? text : `https://${text}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return undefined;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
  // A host needs a dot and a two-letter ending at least: "mysite" alone is a typo, not a site.
  if (!/\.[a-z]{2,}$/i.test(url.hostname)) return undefined;
  const label = `${url.hostname.replace(/^www\./, "")}${url.pathname === "/" ? "" : url.pathname}${url.search}`;
  return { href: url.href, label };
}
