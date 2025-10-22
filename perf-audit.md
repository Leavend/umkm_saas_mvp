# Performance audit

## Tooling attempts

* `pnpm dlx npm-why lucide-react` *(failed – registry returned 403 Forbidden)*
* `pnpm why lucide-react` *(no output – pnpm lockfile is not present in this repository)*
* `npm install` *(failed – private package `@daveyplate/better-auth-ui` is not accessible in this environment)*
* `next build --profile` *(blocked because dependencies could not be installed)*

## Manual observations

Even without a full profile we can apply several low-risk optimisations:

1. **Server components first** – marketing, blog, and product pages are implemented as Server Components. Client interactivity is limited to the language toggle and dashboard UI islands.
2. **Localized navigation helper** – `src/lib/i18n/navigation.tsx` centralises link building, preventing duplicate client bundles from pulling `next/link` in multiple places.
3. **Route groups** – marketing routes live under `app/[lang]/(marketing)` and application dashboards under `app/[lang]/(dashboard)`, enabling granular streaming and bundle caching.
4. **Dynamic data islands** – heavy datasets (blog/posts/products) are resolved server-side and delivered as HTML.
5. **`next/image` adoption** – product listing cards now use `<Image>` with responsive `sizes`, paving the way for optimised image delivery once the CDN is configured.

## Follow-up suggestions

When registry access is restored:

* Capture a fresh `next build --profile` report to quantify JS reduction.
* Consider importing only the icons used from `lucide-react` (tree-shaking works well in Next, but manual imports guarantee minimal payload).
* Audit third-party UI libraries (Radix, Sonner) with `pnpm why` to confirm they are still required after the refactor.
* Enable the Next.js bundle analyzer (`ANALYZE=true next build`) to validate that localized route groups do not introduce duplicate bundles.
