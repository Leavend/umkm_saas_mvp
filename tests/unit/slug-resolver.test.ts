import { strict as assert } from "node:assert";
import test from "node:test";

import { listProducts } from "../../src/lib/content/products";
import { resolveLocalizedSlug } from "../../src/lib/i18n/slug-resolver";
import { pickSlug } from "../../src/lib/i18n/slug";

test("resolveLocalizedSlug switches between locales", () => {
  const product = listProducts()[0];
  const enSlug = pickSlug(product, "en");
  const idSlug = pickSlug(product, "id");

  assert.equal(
    resolveLocalizedSlug("/products/[slug]", enSlug, "en", "id"),
    idSlug,
  );
  assert.equal(
    resolveLocalizedSlug("/products/[slug]", idSlug, "id", "en"),
    enSlug,
  );
});
