import { EyeOff, MapPin } from "lucide-react";
import type { ProfileDataReturn } from "@/hooks/profile/profileTypes";
import { initials } from "@/components/feed/careerFeedModel";
import { ProofOfWork } from "./ProofOfWork";
import type { ProofItem } from "./profileProofModel";
import type { VisibilityState } from "./ProfileVisibilityGroup";

const years = (a?: number, b?: number | null) => (a ? `${a} – ${b === null || b === undefined ? "Present" : b}` : "");

/** Read-only employer view of the seeker's own profile, built from the same saved data as the editor. */
export function SeekerProfilePreview({ profile, proof, visibility }: { profile: ProfileDataReturn; proof: ProofItem[]; visibility: VisibilityState | null }) {
  const hidden = visibility && !visibility.visibleToEmployers && !visibility.isPublic;
  const sections: { title: string; body: React.ReactNode; show: boolean }[] = [
    { title: "About", show: !!profile.aboutText, body: <p className="text-[15px] leading-relaxed whitespace-pre-line">{profile.aboutText}</p> },
    { title: "Experience", show: profile.experiences.length > 0, body: profile.experiences.map((e, i) => <div key={e.id ?? i}><p className="font-bold">{e.title}</p><p className="text-sm text-muted-foreground">{years(e.startYear, e.endYear)}</p>{e.description && <p className="text-sm mt-1 whitespace-pre-line">{e.description}</p>}</div>) },
    { title: "Education", show: profile.educationItems.length > 0, body: profile.educationItems.map((e, i) => <div key={e.id ?? i}><p className="font-bold">{e.title}</p><p className="text-sm text-muted-foreground">{years(e.startYear, e.endYear)}</p></div>) },
    { title: "Skills", show: profile.userSkills.length > 0, body: <div className="sk-tags">{profile.userSkills.map((s) => <span key={s} className="sk-tag">{s}</span>)}</div> },
    { title: "Languages", show: profile.userLanguages.length > 0, body: <div className="sk-tags">{profile.userLanguages.map((l, i) => <span key={l.id ?? i} className="sk-tag">{l.name}</span>)}</div> },
    { title: "Achievements", show: profile.userAchievements.length > 0, body: profile.userAchievements.map((a, i) => <div key={a.id ?? i}><p className="font-bold">{a.title}</p>{a.organization && <p className="text-sm text-muted-foreground">{a.organization}</p>}</div>) },
    { title: "Certifications", show: profile.userCertifications.length > 0, body: profile.userCertifications.map((c: any, i) => <p key={c.id ?? i} className="font-bold">{c.title || c.name}</p>) },
  ];
  const shown = sections.filter((s) => s.show);
  return (
    <div className="flex flex-col gap-3 ee-fade" aria-label="Profile preview">
      {visibility && (
        <p className={`text-sm rounded-2xl px-4 py-3 ${hidden ? "bg-card text-muted-foreground" : "bg-primary/10 text-primary"}`} role="status">
          {hidden ? <><EyeOff size={15} className="inline mr-1.5 -mt-0.5" />Only you can see this. Employer discovery and your share link are off.</>
            : `Visible ${[visibility.visibleToEmployers && "to employers (when certified and verified)", visibility.isPublic && "through your share link"].filter(Boolean).join(" and ")}.`}
        </p>
      )}
      <div className="ee-identity !pb-2">
        <div className="sk-portrait">{profile.profileImage ? <img src={profile.profileImage} alt="" /> : initials(profile.userName)}</div>
        <h2>{profile.userName || "Your name"}</h2>
        {profile.userTitle && <p className="font-semibold">{profile.userTitle}</p>}
        {profile.location && <p className="text-sm text-muted-foreground inline-flex items-center gap-1"><MapPin size={14} />{profile.location}</p>}
      </div>
      {shown.map((s) => <section key={s.title} className="sk-preview-section"><h3>{s.title}</h3>{s.body}</section>)}
      {proof.length > 0 && <ProofOfWork items={proof} />}
      {shown.length === 0 && <div className="ee-empty"><h3>Nothing to preview yet</h3><p>Add an about, experience or skills in Edit to see how employers will read your profile.</p></div>}
    </div>
  );
}
