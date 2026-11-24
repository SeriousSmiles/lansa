/**
 * Rules for editing an existing vacancy. Only columns the edit form shows are
 * ever sent, and only when they changed, so legacy/unknown fields, status,
 * image, applications and analytics are never rewritten.
 */
export const JOB_CATEGORIES = ["Engineering", "Marketing", "Design", "Sales", "Product", "Operations", "Finance", "Human Resources", "Customer Success", "Data Science"];
export const JOB_TYPES: Array<[string, string]> = [["full_time", "Full-time"], ["part_time", "Part-time"], ["contract", "Contract"], ["internship", "Internship"]];

export interface EditableJob {
  id: string;
  title?: string | null;
  description?: string | null;
  location?: string | null;
  category?: string | null;
  job_type?: string | null;
  is_remote?: boolean | null;
  salary_range?: string | null;
  skills_required?: unknown;
  [k: string]: unknown;
}

export interface JobEditForm {
  title: string;
  description: string;
  location: string;
  category: string;
  job_type: string;
  is_remote: boolean;
  salary_range: string;
  skills: string[];
}

const skillsOf = (v: unknown): string[] => (Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : []);

export function toEditForm(job: EditableJob): JobEditForm {
  return {
    title: job.title ?? "",
    description: job.description ?? "",
    location: job.location ?? "",
    category: job.category ?? "",
    job_type: job.job_type ?? "",
    is_remote: !!job.is_remote,
    salary_range: job.salary_range ?? "",
    skills: skillsOf(job.skills_required),
  };
}

export function validateJobEdit(f: JobEditForm): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.title.trim()) e.title = "Add a job title";
  else if (f.title.trim().length > 150) e.title = "Keep the title under 150 characters";
  if (!f.description.trim()) e.description = "Add a description";
  if (!f.location.trim()) e.location = "Add a location";
  if (!f.category.trim()) e.category = "Choose a category";
  if (!JOB_TYPES.some(([v]) => v === f.job_type)) e.job_type = "Choose a job type";
  if (f.skills.length > 30) e.skills = "Use up to 30 skills";
  return e;
}

const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

/** Changed columns only. Empty object means nothing to save. */
export function buildJobPatch(job: EditableJob, f: JobEditForm): Record<string, unknown> {
  const before = toEditForm(job);
  const patch: Record<string, unknown> = {};
  const text = (k: "title" | "location" | "category", v: string) => { if (v.trim() !== before[k].trim()) patch[k] = v.trim(); };
  text("title", f.title);
  text("location", f.location);
  text("category", f.category);
  // Description keeps its exact formatting (legacy rich text included) unless edited.
  if (f.description !== before.description) patch.description = f.description;
  if (f.job_type !== before.job_type) patch.job_type = f.job_type;
  if (f.is_remote !== before.is_remote) patch.is_remote = f.is_remote;
  if (f.salary_range.trim() !== before.salary_range.trim()) patch.salary_range = f.salary_range.trim() || null;
  const skills = f.skills.map((s) => s.trim()).filter(Boolean);
  if (!sameList(skills, before.skills)) patch.skills_required = skills;
  return patch;
}
