import { isSafeHttpsUrl } from "@/components/feed/careerFeedModel";

export interface ProofItem { id: string; title: string; detail?: string; url: string; source: "post" | "project" | "achievement" }

/** Collects titled, linkable proof of work. Only safe https links are surfaced. */
export function collectProof(input: {
  posts?: { id: string; title: string | null; body: string; work_url: string | null }[];
  projects?: { id?: string; title: string; description?: string; url?: string }[];
  achievements?: { id?: string; title: string; organization?: string; credentialUrl?: string }[];
}): ProofItem[] {
  const out: ProofItem[] = [];
  const seen = new Set<string>();
  const push = (p: ProofItem) => { if (!isSafeHttpsUrl(p.url) || seen.has(p.url)) return; seen.add(p.url); out.push(p); };
  for (const p of input.posts || []) if (p.work_url) push({ id: `post-${p.id}`, title: p.title || "Work sample", detail: p.body.slice(0, 90), url: p.work_url, source: "post" });
  for (const p of input.projects || []) if (p.url) push({ id: `project-${p.id ?? p.title}`, title: p.title, detail: p.description, url: p.url, source: "project" });
  for (const a of input.achievements || []) if (a.credentialUrl) push({ id: `ach-${a.id ?? a.title}`, title: a.title, detail: a.organization, url: a.credentialUrl, source: "achievement" });
  return out;
}

export interface CompletionStepLike { key: string; label: string; cta_route: string }
/** The route that opens the editor for the next missing section, or null when complete. */
export function nextEditorRoute(steps: CompletionStepLike[]): string | null {
  const s = steps[0];
  if (!s) return null;
  return s.cta_route || `/profile?action=${encodeURIComponent(s.key)}`;
}
