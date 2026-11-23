import { ReactNode, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight, CreditCard, Eye, FileText, PenLine, Upload } from "lucide-react";
import { EmployerGroup, EmployerHeader, EmployerRow } from "@/components/mobile/employer/employerUi";
import { CVUploadModal } from "@/components/onboarding/cv/CVUploadModal";
import { useProfileCompletion } from "@/hooks/useProfileCompletion";
import { careerFeedService, type CareerPost } from "@/services/careerFeedService";
import type { ProfileDataReturn } from "@/hooks/profile/profileTypes";
import { collectProof, nextEditorRoute } from "./profileProofModel";
import { ProofOfWork } from "./ProofOfWork";
import { ProfileVisibilityGroup, type VisibilityState } from "./ProfileVisibilityGroup";
import { SeekerProfilePreview } from "./SeekerProfilePreview";

/** Phone/tablet profile builder: identity, Edit/Preview, next missing section, the existing editors, proof and visibility. */
export function NativeProfileLayout({ profile, userId, headerActions, children }: { profile: ProfileDataReturn; userId?: string; headerActions?: ReactNode; children: ReactNode }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const view = params.get("view") === "preview" ? "preview" : "edit";
  const completion = useProfileCompletion(userId);
  const [posts, setPosts] = useState<CareerPost[]>([]);
  const [visibility, setVisibility] = useState<VisibilityState | null>(null);
  const [cvOpen, setCvOpen] = useState(false);

  useEffect(() => { if (userId) careerFeedService.byAuthor(userId).then(setPosts).catch(() => setPosts([])); }, [userId]);
  // An editor deep link (?action=) always lands in Edit so the editor can open.
  useEffect(() => { if (params.get("action") && view === "preview") { const p = new URLSearchParams(params); p.delete("view"); setParams(p, { replace: true }); } }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  const proof = useMemo(() => collectProof({ posts, projects: profile.userProjects, achievements: profile.userAchievements }), [posts, profile.userProjects, profile.userAchievements]);
  const setView = (v: "edit" | "preview") => { const p = new URLSearchParams(params); v === "preview" ? p.set("view", "preview") : p.delete("view"); setParams(p, { replace: true }); window.scrollTo({ top: 0 }); };
  const nextRoute = nextEditorRoute(completion.missing_steps);
  const next = completion.missing_steps[0];

  return (
    <div className="seeker-theme ee-screen sk-page">
      <EmployerHeader title="Profile" actions={<div className="shrink-0 [&>div]:w-auto">{headerActions}</div>} />
      <div className="ee-body">
        {/* Edit shows the existing photo/name/title editors below; Preview renders the read-only identity. */}

        <div className="sk-seg" role="tablist" aria-label="Profile mode">
          <button role="tab" aria-selected={view === "edit"} onClick={() => setView("edit")}><PenLine size={16} />Edit</button>
          <button role="tab" aria-selected={view === "preview"} onClick={() => setView("preview")}><Eye size={16} />Preview</button>
        </div>

        {view === "preview" ? (
          <SeekerProfilePreview profile={profile} proof={proof} visibility={visibility} />
        ) : (
          <>
            {!completion.loading && next && nextRoute && (
              <section className="sk-next" aria-label="Profile completion">
                <span className="text-[13px] font-semibold opacity-80">Profile {completion.score}% complete</span>
                <div className="sk-progress" aria-hidden><span style={{ width: `${completion.score}%` }} /></div>
                <h2 className="text-lg font-extrabold leading-tight">Next: {next.label}</h2>
                <button className="sk-next-btn" onClick={() => navigate(nextRoute)}>Add it now<ChevronRight size={16} /></button>
              </section>
            )}
            <main className="grid grid-cols-1 gap-4 min-w-0 sk-profile-editors">{children}</main>
            <ProofOfWork items={proof} onAdd={() => navigate("/feed?compose=1")} />
            <ProfileVisibilityGroup userId={userId} onChange={setVisibility} />
            <EmployerGroup label="Import & documents">
              <EmployerRow icon={Upload} label="Import from CV" detail="Fill your profile from a PDF resume" onClick={() => setCvOpen(true)} />
              <EmployerRow icon={FileText} label="Resume" detail="Design, print and export" onClick={() => navigate("/profile/resume-editor")} />
              <EmployerRow icon={CreditCard} label="Digital card" detail="Your QR card for sharing" onClick={() => navigate("/card")} />
            </EmployerGroup>
          </>
        )}
      </div>
      {/* Keep the visibility state known in Preview even before Edit was opened. */}
      {view === "preview" && !visibility && <div hidden><ProfileVisibilityGroup userId={userId} onChange={setVisibility} /></div>}
      <CVUploadModal open={cvOpen} onOpenChange={setCvOpen} onComplete={() => { setCvOpen(false); window.location.reload(); }} />
    </div>
  );
}
