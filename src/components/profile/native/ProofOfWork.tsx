import { ExternalLink, PenLine } from "lucide-react";
import { linkHost } from "@/components/feed/careerFeedModel";
import type { ProofItem } from "./profileProofModel";

const SOURCE: Record<ProofItem["source"], string> = { post: "Work sample · members", project: "Project", achievement: "Credential" };

export function ProofOfWork({ items, onAdd }: { items: ProofItem[]; onAdd?: () => void }) {
  return (
    <section aria-label="Proof of work" className="flex flex-col gap-2">
      <h2 className="ee-section-label">Proof of work</h2>
      {items.length === 0 ? (
        <div className="ee-empty"><h3>Show what you've made</h3><p>Share a work sample with a link, or add a link to a project or credential.</p>{onAdd && <button className="ee-secondary mt-2" onClick={onAdd}><PenLine size={16} />Add a work sample</button>}</div>
      ) : items.map((p) => (
        <a key={p.id} href={p.url} target="_blank" rel="noopener noreferrer nofollow" className="sk-work !bg-card">
          <span className="sk-work-icon" aria-hidden><ExternalLink size={18} /></span>
          <span className="min-w-0 flex-1"><span className="sk-work-title">{p.title}</span><span className="sk-work-host">{SOURCE[p.source]} · {linkHost(p.url)}</span></span>
        </a>
      ))}
    </section>
  );
}
