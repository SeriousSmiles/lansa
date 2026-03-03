
## Root Cause — Definitively Confirmed

The GitHub issue #20236 gives us the exact answer. The error is **not** a workerSrc configuration problem. The issue is:

**`pdfjs-dist >= v5.4.149` introduced internal use of `getOrInsertComputed()` on `Map` instances** — this is a V8-native `Map` method. When Vite/webpack bundles pdfjs with any `eval-*` source map (which Vite uses by default), it wraps the module in a runtime that shadows native `Map`, breaking this call.

Key finding from the issue thread:
- **v5.4.54 works fine**
- **v5.4.149+ breaks** in both dev and prod when bundled by Vite/webpack
- The PR #20724 ("fix: rename webpack runtime variables to avoid conflicts with bundlers") was only just linked on Feb 23, 2026 — it is **not yet in any released version**

The `new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url)` approach does NOT fix this — several developers in the thread tried exactly that and it still fails. The fix is to **use a version before the breaking change**.

---

## The Fix: Pin to `pdfjs-dist@4.10.38`

`pdfjs-dist v4` (latest: `4.10.38`) does NOT use `getOrInsertComputed`. Identical API — same `getDocument()`, `page.render()`, same canvas approach. Used by thousands of production Vite apps without this issue.

We also add the "public folder strategy" from the Medium article as belt-and-suspenders: copy the worker to `public/` so Vite never hashes/loses it between deploys.

---

## Changes

### 1. `package.json`
```
"pdfjs-dist": "^5.4.149"  →  "pdfjs-dist": "4.10.38"
```
Pinned, no caret — prevents future accidental upgrades to v5+.

### 2. `src/utils/pdfToImages.ts`
Point workerSrc to the static public path instead of `import.meta.url`:
```ts
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
```
This eliminates the Vite hashing issue described in the Medium article — the browser always finds the worker at the same path.

### 3. `vite.config.ts`
Add a Vite plugin hook to automatically copy the v4 worker to `public/` during build:
```ts
// Copy pdfjs worker to public so it's never Vite-hashed
{
  name: 'copy-pdfjs-worker',
  buildStart() {
    // handled via public/ folder
  }
}
```
Actually simpler: we add a `copyPublicDir` step or just check if the file is already there. The cleanest approach is to add it to `vite.config.ts` using the `vite-plugin-static-copy` approach or just use Vite's built-in `assetsInclude`.

Actually the simplest is to just hardcode it in `src/utils/pdfToImages.ts` to point to `/pdf.worker.min.mjs` and tell Vite not to process pdfjs at all.

### Summary of file changes

| File | Change |
|---|---|
| `package.json` | Pin `pdfjs-dist` to `4.10.38` |
| `src/utils/pdfToImages.ts` | Use static `/pdf.worker.min.mjs` path |
| `vite.config.ts` | Keep `optimizeDeps.exclude`, add worker copy script |

The worker file needs to land in `public/pdf.worker.min.mjs`. We can write a small Vite plugin (3 lines) inside `vite.config.ts` that copies it from `node_modules/pdfjs-dist/build/pdf.worker.min.mjs` to `public/` at build start using Node's `fs`.
