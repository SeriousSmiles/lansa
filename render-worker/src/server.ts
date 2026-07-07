/**
 * Lansa Resume Render Worker
 *
 * POST /render — protected by X-Render-Secret. Returns a binary body.
 * GET  /health — liveness probe.
 */

import Fastify from 'fastify';
import puppeteer, { type Browser } from 'puppeteer';
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildDocx } from './docx.js';

const PORT = Number(process.env.PORT ?? 8080);
const SECRET = process.env.RENDER_SHARED_SECRET;
if (!SECRET) {
  // eslint-disable-next-line no-console
  console.error('RENDER_SHARED_SECRET is required');
  process.exit(1);
}

const app = Fastify({ logger: true, bodyLimit: 10 * 1024 * 1024 });

let browser: Browser | null = null;
let rendersSinceLaunch = 0;
const RECYCLE_AFTER = 40;

async function getBrowser(): Promise<Browser> {
  if (browser && rendersSinceLaunch < RECYCLE_AFTER) return browser;
  if (browser) { try { await browser.close(); } catch {} }
  browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--font-render-hinting=none',
    ],
  });
  rendersSinceLaunch = 0;
  return browser;
}

app.get('/health', async () => ({ ok: true }));

app.post('/render', async (req, reply) => {
  if ((req.headers['x-render-secret'] ?? '') !== SECRET) {
    return reply.code(401).send({ error: 'unauthorized' });
  }

  const body = req.body as {
    url?: string;
    format: 'pdf' | 'pdf-a' | 'docx' | 'png' | 'jpeg';
    paper?: 'A4' | 'Letter';
    payload?: { data: unknown; tokens: unknown };
  };

  if (!body?.format) return reply.code(400).send({ error: 'format required' });

  try {
    if (body.format === 'docx') {
      if (!body.payload?.data || !body.payload?.tokens) {
        return reply.code(400).send({ error: 'payload required for docx' });
      }
      const buf = await buildDocx(body.payload.data as any, body.payload.tokens as any);
      reply
        .header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        .send(buf);
      return;
    }

    if (!body.url) return reply.code(400).send({ error: 'url required' });

    const b = await getBrowser();
    const page = await b.newPage();
    try {
      await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });
      await page.goto(body.url, { waitUntil: 'networkidle0', timeout: 30_000 });
      await page.waitForFunction('window.__RESUME_READY__ === true', { timeout: 15_000 }).catch(() => {});

      if (body.format === 'pdf' || body.format === 'pdf-a') {
        const pdf = await page.pdf({
          printBackground: true,
          preferCSSPageSize: true,
          format: (body.paper ?? 'A4').toLowerCase() as 'a4' | 'letter',
          margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
        });
        rendersSinceLaunch++;
        if (body.format === 'pdf-a') {
          const out = await ghostscriptPdfA(Buffer.from(pdf));
          reply.header('Content-Type', 'application/pdf').send(out);
          return;
        }
        reply.header('Content-Type', 'application/pdf').send(Buffer.from(pdf));
        return;
      }

      const type = body.format === 'jpeg' ? 'jpeg' : 'png';
      const buf = await page.screenshot({
        type,
        fullPage: true,
        quality: type === 'jpeg' ? 92 : undefined,
      });
      rendersSinceLaunch++;
      reply.header('Content-Type', type === 'jpeg' ? 'image/jpeg' : 'image/png').send(Buffer.from(buf));
    } finally {
      await page.close().catch(() => {});
    }
  } catch (e) {
    req.log.error({ err: e }, 'render failed');
    reply.code(500).send({ error: (e as Error).message });
  }
});

async function ghostscriptPdfA(input: Buffer): Promise<Buffer> {
  const dir = mkdtempSync(join(tmpdir(), 'pdfa-'));
  const src = join(dir, 'in.pdf');
  const dst = join(dir, 'out.pdf');
  writeFileSync(src, input);
  try {
    await new Promise<void>((resolve, reject) => {
      const gs = spawn('gs', [
        '-dPDFA=1', '-dBATCH', '-dNOPAUSE', '-dNOOUTERSAVE',
        '-sProcessColorModel=DeviceRGB', '-sDEVICE=pdfwrite',
        '-sPDFACompatibilityPolicy=1', `-sOutputFile=${dst}`, src,
      ]);
      gs.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`gs exited ${code}`))));
      gs.on('error', reject);
    });
    return readFileSync(dst);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

app.listen({ port: PORT, host: '0.0.0.0' }).then((addr) => {
  app.log.info(`render worker listening on ${addr}`);
});
