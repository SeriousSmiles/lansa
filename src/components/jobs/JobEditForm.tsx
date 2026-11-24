import { useMemo, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import { jobPostingService, type JobListing } from "@/services/jobPostingService";
import { JOB_CATEGORIES, JOB_TYPES, buildJobPatch, toEditForm, validateJobEdit, type EditableJob } from "./jobEditModel";

interface Props {
  job: EditableJob;
  organizationId: string;
  canEdit: boolean;
  onSaved: (job: JobListing) => void;
  onCancel: () => void;
}

/** Focused edit of an existing vacancy; creating stays in JobPostingWizard. */
export function JobEditForm({ job, organizationId, canEdit, onSaved, onCancel }: Props) {
  const [f, setF] = useState(() => toEditForm(job));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [skill, setSkill] = useState("");
  const lock = useRef(false);
  const patch = useMemo(() => buildJobPatch(job, f), [job, f]);
  const dirty = Object.keys(patch).length > 0;
  const categories = f.category && !JOB_CATEGORIES.includes(f.category) ? [f.category, ...JOB_CATEGORIES] : JOB_CATEGORIES;
  const otherOrg = typeof job.organization_id === "string" && job.organization_id !== organizationId;
  const readOnly = !canEdit || otherOrg;

  const save = async () => {
    if (lock.current || readOnly) return;
    const e = validateJobEdit(f);
    setErrors(e);
    if (Object.keys(e).length) return;
    if (!dirty) { onCancel(); return; }
    lock.current = true; setSaving(true); setSaveError(null);
    try {
      const updated = await jobPostingService.saveJobEdits(job.id, organizationId, patch as Partial<JobListing>);
      onSaved(updated);
    } catch (err: any) {
      setSaveError(`${err?.message || "Your changes weren't saved."} Your edits are still here — try again.`);
    } finally {
      lock.current = false; setSaving(false);
    }
  };

  const set = (k: keyof typeof f, v: any) => setF((x) => ({ ...x, [k]: v }));
  const addSkill = () => {
    const s = skill.trim();
    if (s && !f.skills.some((x) => x.toLowerCase() === s.toLowerCase())) set("skills", [...f.skills, s]);
    setSkill("");
  };
  const input = "w-full min-h-[48px] rounded-2xl border border-input bg-card px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60";
  const err = (k: string) => errors[k] ? <p id={`je-${k}-err`} role="alert" className="text-sm font-semibold text-destructive">{errors[k]}</p> : null;

  if (readOnly) {
    return (
      <div className="flex flex-col gap-4 p-1">
        <p role="alert" className="text-sm">{otherOrg ? "This job belongs to another company, so it can't be edited here." : "Your role can view this job but not edit it."}</p>
        <button type="button" className="ee-secondary" onClick={onCancel}>Close</button>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-4" noValidate onSubmit={(e) => { e.preventDefault(); save(); }} aria-busy={saving}>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="je-title" className="text-sm font-bold">Job title</label>
        <input id="je-title" className={input} value={f.title} maxLength={150} aria-invalid={!!errors.title} onChange={(e) => set("title", e.target.value)} disabled={saving} />
        {err("title")}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="je-cat" className="text-sm font-bold">Category</label>
          <select id="je-cat" className={input} value={f.category} aria-invalid={!!errors.category} onChange={(e) => set("category", e.target.value)} disabled={saving}>
            <option value="">Choose…</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {err("category")}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="je-type" className="text-sm font-bold">Job type</label>
          <select id="je-type" className={input} value={f.job_type} aria-invalid={!!errors.job_type} onChange={(e) => set("job_type", e.target.value)} disabled={saving}>
            <option value="">Choose…</option>
            {JOB_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          {err("job_type")}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="je-loc" className="text-sm font-bold">Location</label>
        <input id="je-loc" className={input} value={f.location} aria-invalid={!!errors.location} onChange={(e) => set("location", e.target.value)} disabled={saving} />
        {err("location")}
      </div>
      <label className="flex items-center gap-3 min-h-[44px] text-sm font-semibold">
        <input type="checkbox" className="h-5 w-5 accent-[hsl(var(--primary))]" checked={f.is_remote} onChange={(e) => set("is_remote", e.target.checked)} disabled={saving} /> Remote work possible
      </label>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="je-sal" className="text-sm font-bold">Compensation (optional)</label>
        <input id="je-sal" className={input} placeholder="XCG 1500 - 2000" value={f.salary_range} onChange={(e) => set("salary_range", e.target.value)} disabled={saving} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="je-desc" className="text-sm font-bold">Description</label>
        <textarea id="je-desc" className={`${input} min-h-[180px] leading-relaxed`} value={f.description} aria-invalid={!!errors.description} onChange={(e) => set("description", e.target.value)} disabled={saving} />
        {err("description")}
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="je-skill" className="text-sm font-bold">Skills</label>
        {f.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {f.skills.map((s) => (
              <button key={s} type="button" className="ee-chip" aria-selected="true" aria-label={`Remove ${s}`} onClick={() => set("skills", f.skills.filter((x) => x !== s))} disabled={saving}>{s} <X size={14} /></button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input id="je-skill" className={input} value={skill} placeholder="Add a skill" onChange={(e) => setSkill(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} disabled={saving} />
          <button type="button" className="ee-secondary shrink-0" onClick={addSkill} disabled={saving || !skill.trim()}>Add</button>
        </div>
        {err("skills")}
      </div>
      <div className="sticky bottom-0 flex flex-wrap gap-3 bg-background pt-2 pb-[env(safe-area-inset-bottom)]">
        {saveError && <p role="alert" className="w-full rounded-2xl bg-destructive/10 px-3 py-2.5 text-sm font-semibold text-destructive">{saveError}</p>}
        <button type="button" className="ee-secondary flex-1" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="ee-primary flex-1" disabled={saving || !dirty}>
          {saving && <Loader2 size={16} className="animate-spin" />}{saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
