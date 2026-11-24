import type { ReactNode } from "react";
import { ArrowLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { Illustration, type IllustrationName } from "@/components/common/Illustration";

/** Shared employer-environment primitives (styles live in index.css under .ee-*). */
export function EmployerHeader({ title, onBack, backLabel = "Back", actions }: { title: string; onBack?: () => void; backLabel?: string; actions?: ReactNode }) {
  return (
    <header className={`ee-header ${onBack ? "has-back" : ""}`}>
      {onBack && (
        <button type="button" className="ee-icon-btn" aria-label={backLabel} onClick={onBack}>
          <ArrowLeft size={22} />
        </button>
      )}
      <h1>{title}</h1>
      {actions}
    </header>
  );
}

export function EmployerGroup({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <section aria-label={label}>
      {label && <h2 className="ee-section-label">{label}</h2>}
      <div className="ee-group">{children}</div>
    </section>
  );
}

export function EmployerRow({ icon: Icon, label, detail, trail, onClick, danger, disabled }: { icon?: LucideIcon; label: string; detail?: ReactNode; trail?: ReactNode; onClick?: () => void; danger?: boolean; disabled?: boolean }) {
  return (
    <button type="button" className={`ee-row ${danger ? "is-danger" : ""}`} onClick={onClick} disabled={disabled}>
      {Icon && <span className="ee-row-icon"><Icon size={18} aria-hidden="true" /></span>}
      <span className="ee-row-text">
        <span className="ee-row-label">{label}</span>
        {detail && <span className="ee-row-detail">{detail}</span>}
      </span>
      <span className="ee-row-trail">{trail}{onClick && !danger && <ChevronRight size={18} aria-hidden="true" />}</span>
    </button>
  );
}

export function EmployerEmpty({ icon: Icon, title, body, action, art }: { icon?: LucideIcon; title: string; body?: string; action?: ReactNode; art?: IllustrationName }) {
  return (
    <div className="ee-empty ee-fade">
      {art ? <Illustration name={art} size={140} /> : Icon && <span className="ee-row-icon" style={{ width: 48, height: 48 }}><Icon size={22} aria-hidden="true" /></span>}
      <h3>{title}</h3>
      {body && <p>{body}</p>}
      {action}
    </div>
  );
}

const JOB_STATUS = { true: ["Open", "is-open"], false: ["Closed", "is-closed"] } as const;
export function JobStatus({ active }: { active: boolean }) {
  const [label, cls] = JOB_STATUS[String(active) as "true" | "false"];
  return <span className={`ee-status ${cls}`}>{label}</span>;
}

export const APPLICATION_STATUS_LABEL: Record<string, string> = {
  pending: "New",
  accepted: "Accepted",
  declined: "Declined",
  withdrawn: "Withdrawn",
};
export function ApplicationStatus({ status }: { status: string }) {
  return <span className={`ee-status is-${status}`}>{APPLICATION_STATUS_LABEL[status] ?? status}</span>;
}

export const JOB_TYPE_LABEL: Record<string, string> = { full_time: "Full-time", part_time: "Part-time", contract: "Contract", internship: "Internship" };
