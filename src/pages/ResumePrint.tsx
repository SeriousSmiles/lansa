/**
 * /resume/print/:token — the page the Puppeteer render worker navigates to.
 *
 * The token is a short-lived, HMAC-signed id issued by the `export-resume`
 * edge function. This page exchanges the token for a payload via the
 * `resume-print-fetch` edge function, then renders <ResumeDocument> at
 * exactly the paper size so `page.pdf({ preferCSSPageSize: true })` in the
 * worker produces a pixel-perfect vector PDF.
 *
 * This route is intentionally NOT wrapped in <Guard> — the token itself is
 * the credential. It refuses to render without a valid, unexpired token.
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ResumeDocument } from '@/components/resume/ResumeDocument';
import { DEFAULT_TOKENS, DesignTokens } from '@/types/designTokens';
import { PDFResumeData } from '@/types/pdf';

interface PrintPayload {
  data: PDFResumeData;
  tokens: DesignTokens;
}

export default function ResumePrint() {
  const { token } = useParams<{ token: string }>();
  const [payload, setPayload] = useState<PrintPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Missing token');
      return;
    }
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resume-print-fetch`;
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (r) => {
        if (!r.ok) {
          const t = await r.text();
          throw new Error(`Print token rejected [${r.status}]: ${t}`);
        }
        return r.json();
      })
      .then((p: PrintPayload) => {
        // fill in defaults if the caller supplied a partial tokens object
        const merged: DesignTokens = { ...DEFAULT_TOKENS, ...(p.tokens ?? {}) } as DesignTokens;
        setPayload({ data: p.data, tokens: merged });
        // signal to Puppeteer that render is ready
        requestAnimationFrame(() => {
          document.title = 'resume-ready';
          (window as any).__RESUME_READY__ = true;
        });
      })
      .catch((e) => setError(e?.message ?? String(e)));
  }, [token]);

  if (error) {
    return (
      <div style={{ padding: 40, fontFamily: 'system-ui', color: '#B00020' }}>
        Could not load resume: {error}
      </div>
    );
  }
  if (!payload) {
    return <div style={{ padding: 40, fontFamily: 'system-ui' }}>Preparing resume…</div>;
  }

  return (
    <div style={{ background: '#fff', margin: 0, padding: 0 }}>
      <ResumeDocument data={payload.data} tokens={payload.tokens} />
    </div>
  );
}