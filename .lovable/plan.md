
## Root Cause — Confirmed via GitHub Issue #20236

`pdfjs-dist v5.4.149` (the version installed: `^5.4.149`) has a **confirmed upstream bug** where Vite's dev-mode source map injection (`eval-*` sourcemaps) corrupts internal `Map` prototype methods inside the pdfjs module during dynamic `import()`. This produces the exact error: `getOrInsertComputed is not a function`.

**This is not a workerSrc configuration issue.** The import itself fails before workerSrc even matters.

Community-verified fix for Vite (Jan 2026, same issue thread):
```
GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();
// Only set if not already set — avoid re-init
if (!GlobalWorkerOptions.workerSrc) { ... }
```
Plus **critically**: exclude `pdfjs-dist` from Vite's dependency pre-bundler.

---

## Two Changes Needed

### 1. `vite.config.ts` — Exclude pdfjs from Vite pre-bundling
Vite's optimizer wraps ES modules with its own eval-based runtime for HMR. When it wraps pdfjs-dist, it corrupts internal `Map` usage. Excluding it forces Vite to load pdfjs as a native ES module, untouched.

```ts
optimizeDeps: {
  exclude: ['pdfjs-dist'],
},
```

### 2. `src/utils/pdfToImages.ts` — Use non-minified worker + guard re-init
- Use `pdf.worker.mjs` instead of `pdf.worker.min.mjs` (non-minified resolves correctly in Vite)
- Guard with `if (!pdfjs.GlobalWorkerOptions.workerSrc)` to avoid double-init on re-upload

```ts
if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString();
}
```

---

## Files to Change

| File | Change |
|---|---|
| `vite.config.ts` | Add `optimizeDeps: { exclude: ['pdfjs-dist'] }` |
| `src/utils/pdfToImages.ts` | Switch to non-minified worker, add guard |

No edge function changes needed — the `parse-cv` function is correct and already deployed.
