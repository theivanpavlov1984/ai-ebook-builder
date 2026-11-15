import { describe, expect, it } from "vitest";
import { ctaLink } from "./cta-link";

describe("ctaLink", () => {
  it("adds https to an address typed the way people say it", () => {
    expect(ctaLink("mysite.com/call")).toEqual({ href: "https://mysite.com/call", label: "mysite.com/call" });
    expect(ctaLink("  www.mysite.com  ")).toEqual({ href: "https://www.mysite.com/", label: "mysite.com" });
  });

  it("keeps a full address as it is", () => {
    expect(ctaLink("http://cal.com/mara?ref=book")).toEqual({
      href: "http://cal.com/mara?ref=book",
      label: "cal.com/mara?ref=book",
    });
  });

  it("returns nothing for an empty field or something that isn't a web address", () => {
    for (const raw of [undefined, "", "   ", "mysite", "my site.com", "mailto:me@mysite.com", "javascript:alert(1)"])
      expect(ctaLink(raw)).toBeUndefined();
  });
});
