import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Loader2, X } from "lucide-react";
import { BODY_MAX, FEED_CATEGORIES, type FeedCategory, type PostDraft, validatePost } from "./careerFeedModel";
import { careerFeedService, type CareerPost } from "@/services/careerFeedService";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (post: CareerPost) => void;
  defaultCategory?: FeedCategory;
}

export function ComposePostSheet({ open, onOpenChange, onCreated, defaultCategory = "update" }: Props) {
  const [draft, setDraft] = useState<PostDraft>({ category: defaultCategory, body: "", title: "", work_url: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof PostDraft, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) { setDraft({ category: defaultCategory, body: "", title: "", work_url: "" }); setErrors({}); setServerError(null); } }, [open, defaultCategory]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = validatePost(draft);
    if (r.ok === false) { setErrors(r.errors); return; }
    setErrors({}); setServerError(null); setSaving(true);
    try {
      const post = await careerFeedService.create(r.value);
      onCreated(post);
      onOpenChange(false);
    } catch (err: any) {
      setServerError(err?.message?.includes("https") ? "That link was not accepted. Use a full https:// address." : "Your post could not be published. Check your connection and try again.");
    } finally { setSaving(false); }
  };

  const field = (k: keyof PostDraft) => (errors[k] ? { "aria-invalid": true, "aria-describedby": `compose-${k}-err` } : {});

  return (
    <Sheet open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <SheetContent side="bottom" className="seeker-theme ee-sheet z-[130] max-h-[92dvh] overflow-y-auto p-0 [&>button]:hidden">
        <form onSubmit={submit} className="flex flex-col" noValidate>
          <div className="ee-header">
            <button type="button" className="ee-icon-btn" aria-label="Close" onClick={() => onOpenChange(false)}><X size={22} /></button>
            <SheetTitle asChild><h1>Share an update</h1></SheetTitle>
            <button type="submit" className="ee-primary !min-h-[44px] !px-5 mr-2" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}</button>
          </div>
          <div className="ee-body">
            <SheetDescription className="text-sm text-muted-foreground -mt-1">Visible to signed-in LANSA members. Only what you write here is shared.</SheetDescription>
            <fieldset>
              <legend className="ee-section-label">Category</legend>
              <div className="ee-chips" role="radiogroup" aria-label="Category">
                {FEED_CATEGORIES.map((c) => (
                  <button key={c.id} type="button" role="radio" aria-checked={draft.category === c.id} aria-pressed={draft.category === c.id} className="ee-chip" onClick={() => setDraft((d) => ({ ...d, category: c.id }))}>{c.id === "work_sample" ? "Work sample" : c.label.replace(/s$/, "")}</button>
                ))}
              </div>
            </fieldset>
            <label className="sk-field">
              <span>Title {draft.category === "work_sample" ? "" : <em>(optional)</em>}</span>
              <input value={draft.title} maxLength={140} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} {...field("title")} placeholder={draft.category === "work_sample" ? "e.g. Event menu design" : "Add a headline"} />
              {errors.title && <small id="compose-title-err" role="alert">{errors.title}</small>}
            </label>
            <label className="sk-field">
              <span>What would you like to share?</span>
              <textarea rows={5} value={draft.body} onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))} {...field("body")} placeholder="A short career update, something you learned or work you're proud of." />
              <small className={draft.body.trim().length > BODY_MAX ? "text-destructive" : ""}>{draft.body.trim().length}/{BODY_MAX}</small>
              {errors.body && <small id="compose-body-err" role="alert">{errors.body}</small>}
            </label>
            <label className="sk-field">
              <span>Work link <em>(optional)</em></span>
              <input inputMode="url" type="url" value={draft.work_url} onChange={(e) => setDraft((d) => ({ ...d, work_url: e.target.value }))} {...field("work_url")} placeholder="https://" />
              {errors.work_url && <small id="compose-work_url-err" role="alert">{errors.work_url}</small>}
            </label>
            {serverError && <p role="alert" className="text-sm text-destructive">{serverError}</p>}
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
