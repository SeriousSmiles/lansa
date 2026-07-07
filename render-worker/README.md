# Lansa Resume Render Worker

Vector-first, deterministic Chromium worker for the Lansa Resume Editor.
Renders the exact `<ResumeDocument>` React component the editor uses,
then emits **PDF**, **PDF/A-1b**, **DOCX**, **PNG**, or **JPEG**.

Called by the `export-resume` Supabase Edge Function. Not for public use.

---

## Quick deploy (Fly.io)

```bash
brew install flyctl        # or: curl -L https://fly.io/install.sh | sh
fly auth login

cd render-worker
fly launch --no-deploy --copy-config --name lansa-render-worker
# choose region: ams (closest to Curaçao) or fra

# Take the value from Lovable → Project Settings → Secrets
fly secrets set RENDER_SHARED_SECRET=<value>

fly deploy
```

After deploy, take the printed URL and save it as a Supabase Edge Function
secret in Lovable:

```
RENDER_WORKER_URL=https://lansa-render-worker.fly.dev
```

## Local dev

```bash
cd render-worker
npm install
RENDER_SHARED_SECRET=devsecret npm run dev
# POST http://localhost:8080/render
```

## API

`POST /render`

Headers:
- `Content-Type: application/json`
- `X-Render-Secret: <RENDER_SHARED_SECRET>`

Body:
```json
{
  "url": "https://lansa.online/resume/print/<token>",
  "format": "pdf" | "pdf-a" | "docx" | "png" | "jpeg",
  "paper": "A4" | "Letter",
  "payload": { "data": {...}, "tokens": {...} }
}
```

- PDF / PDF-A / PNG / JPEG: worker navigates Chromium to `url`, waits for
  `window.__RESUME_READY__ === true`, captures the page.
- DOCX: worker ignores `url` and generates the document from `payload`
  using the `docx` library and the same DesignTokens.
- PDF-A: PDF is post-processed through Ghostscript with `PDFA=1`.

`GET /health` — liveness probe.

## Why

The old `html2canvas + jsPDF` pipeline produced raster PDFs — large files,
no selectable text, not ATS-parseable, blurry when zoomed. This worker
uses `page.pdf({ preferCSSPageSize: true })` so text stays vector and the
PDF matches the editor exactly, on any device.
