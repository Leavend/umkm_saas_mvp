import { strict as assert } from "node:assert";
import test from "node:test";

import { localizedHref } from "../../src/lib/i18n/navigation";
import { matchLocalizedPathname } from "../../src/lib/i18n/matcher";

const locales: Array<"en" | "id"> = ["en", "id"];

test("localizedHref maps dashboard route to localized segment", () => {
  assert.equal(localizedHref("en", "/dashboard"), "/en/dashboard");
  assert.equal(localizedHref("id", "/dashboard"), "/id/dasbor");
});

test("localizedHref fills dynamic segments", () => {
  const href = localizedHref("id", { pathname: "/products/[slug]", params: { slug: "peningkat-kualitas" } });
  assert.equal(href, "/id/produk/peningkat-kualitas");
});

test("matchLocalizedPathname resolves templates for each locale", () => {
  for (const locale of locales) {
    const localized = localizedHref(locale, "/blog");
    const normalized = localized.replace(new RegExp(`^/${locale}`), "") || "/";
    const match = matchLocalizedPathname(normalized, locale);
    assert.ok(match, `expected match for locale ${locale}`);
    assert.equal(match?.template, "/blog");
  }
});
