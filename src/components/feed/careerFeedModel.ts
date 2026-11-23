/** Pure rules for member-authored career posts. Mirrors the database trigger `prepare_career_post`. */
export const FEED_CATEGORIES = [
  { id: "update", label: "Updates" },
  { id: "work_sample", label: "Work samples" },
  { id: "milestone", label: "Milestones" },
  { id: "learning", label: "Learning" },
] as const;

export type FeedCategory = (typeof FEED_CATEGORIES)[number]["id"];
export type FeedFilter = "all" | "saved" | FeedCategory;

export const BODY_MAX = 600;
export const TITLE_MAX = 120;
export const URL_MAX = 500;

export interface PostDraft {
  category: FeedCategory;
  title?: string;
  body: string;
  work_url?: string;
}

const HTTPS_RE = /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/[^\s<>"]*)?$/i;

export function isSafeHttpsUrl(value: string): boolean {
  const v = value.trim();
  if (!v || v.length > URL_MAX || !HTTPS_RE.test(v)) return false;
  try {
    const u = new URL(v);
    return u.protocol === "https:" && !u.username && !u.password;
  } catch {
    return false;
  }
}

export function categoryLabel(id: string): string {
  const found = FEED_CATEGORIES.find((c) => c.id === id);
  if (!found) return "Update";
  return id === "work_sample" ? "Work sample" : found.label.replace(/s$/, "");
}

/** Returns a cleaned draft or a field-keyed error map. */
export function validatePost(d: PostDraft): { ok: true; value: PostDraft } | { ok: false; errors: Partial<Record<keyof PostDraft, string>> } {
  const errors: Partial<Record<keyof PostDraft, string>> = {};
  const body = (d.body || "").trim();
  const title = (d.title || "").trim();
  const url = (d.work_url || "").trim();
  if (!FEED_CATEGORIES.some((c) => c.id === d.category)) errors.category = "Choose a category.";
  if (!body) errors.body = "Write a short update.";
  else if (body.length > BODY_MAX) errors.body = `Keep it under ${BODY_MAX} characters.`;
  if (title.length > TITLE_MAX) errors.title = `Keep the title under ${TITLE_MAX} characters.`;
  if (d.category === "work_sample" && !title) errors.title = "Give your work sample a title.";
  if (url && !isSafeHttpsUrl(url)) errors.work_url = "Use a full link that starts with https://";
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { category: d.category, body, title: title || undefined, work_url: url || undefined } };
}

export function initials(name?: string | null): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "L";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function linkHost(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
}
