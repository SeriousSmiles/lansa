import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Bookmark, BookOpen, Briefcase, Building2, ChevronRight, CreditCard, FileText, LayoutGrid, MessageCircle, PenLine, ShieldCheck, UserRound, Video } from "lucide-react";
import { EmployerGroup, EmployerRow } from "@/components/mobile/employer/employerUi";
import { ActivityStream } from "./activity/ActivityStream";
import { careerFeedService, type CareerPost } from "@/services/careerFeedService";
import { categoryLabel, initials } from "@/components/feed/careerFeedModel";
import { useUIStore } from "@/stores/uiStore";

interface Props {
  userId?: string;
  firstName: string;
  score: number | null;
  loading: boolean;
  next: { title: string; description: string; action: string; route: string };
}

/** Phone home for seekers: next step, feed preview and grouped real destinations. */
export function SeekerMobileHome({ userId, firstName, score, loading, next }: Props) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<CareerPost[] | null>(null);
  const [feedError, setFeedError] = useState(false);
  useEffect(() => {
    if (!userId) return;
    let alive = true;
    careerFeedService.list("all", userId, 2).then((p) => alive && setPosts(p)).catch(() => alive && setFeedError(true));
    return () => { alive = false; };
  }, [userId]);

  return (
    <div className="seeker-theme ee-screen sk-page">
      <header className="ee-header">
        <h1>Hi, {firstName}</h1>
        <button className="ee-icon-btn" aria-label="Notifications" onClick={() => navigate("/notifications")}><Bell size={21} /></button>
        <button className="ee-icon-btn" aria-label="Quick actions" onClick={() => useUIStore.getState().setQuickActionsOpen(true)}><LayoutGrid size={21} /></button>
      </header>
      <div className="ee-body">
        <section className="sk-next" aria-label="Your next step">
          <span className="text-[13px] font-semibold opacity-80">Your next step{score !== null ? ` · Profile ${score}%` : ""}</span>
          <h2 className="text-[22px] font-extrabold leading-tight">{loading ? "Getting your workspace ready" : next.title}</h2>
          {!loading && <p className="text-sm opacity-85">{next.description}</p>}
          {score !== null && <div className="sk-progress" aria-hidden><span style={{ width: `${score}%` }} /></div>}
          {!loading && <button className="sk-next-btn" onClick={() => navigate(next.route)}>{next.action}<ChevronRight size={16} /></button>}
        </section>

        <section aria-label="Professional feed">
          <div className="flex items-center justify-between"><h2 className="ee-section-label">From your network</h2><button className="text-sm font-bold text-primary px-2 min-h-[44px]" onClick={() => navigate("/feed")}>Open feed</button></div>
          <div className="ee-group">
            {posts === null && !feedError && <div className="ee-skeleton h-24 m-3" />}
            {feedError && <EmployerRow icon={PenLine} label="Feed didn't load" detail="Open the feed to try again" onClick={() => navigate("/feed")} />}
            {posts?.length === 0 && <EmployerRow icon={PenLine} label="Share the first update" detail="No members have posted yet" onClick={() => navigate("/feed?compose=1")} />}
            {posts?.map((p) => (
              <button key={p.id} className="ee-row" onClick={() => navigate(`/feed/${p.id}`)}>
                <span className="sk-avatar !w-9 !h-9 !rounded-xl !text-sm" aria-hidden>{initials(p.author_name)}</span>
                <span className="ee-row-text"><span className="ee-row-label">{p.title || p.body.slice(0, 70)}</span><span className="ee-row-detail">{p.author_name || "LANSA member"} · {categoryLabel(p.category)}</span></span>
                <span className="ee-row-trail"><ChevronRight size={18} /></span>
              </button>
            ))}
          </div>
        </section>

        <EmployerGroup label="Find work">
          <EmployerRow icon={Briefcase} label="Explore jobs" detail="Pass, save or open details to apply" onClick={() => navigate("/jobs")} />
          <EmployerRow icon={Bookmark} label="Saved & applied" detail="Jobs you kept and your applications" onClick={() => navigate("/jobs?tab=saved")} />
          <EmployerRow icon={Building2} label="Companies" detail="Organisations hiring on LANSA" onClick={() => navigate("/discovery")} />
        </EmployerGroup>

        <EmployerGroup label="Show your work">
          <EmployerRow icon={UserRound} label="My profile" detail="Edit and preview what employers see" onClick={() => navigate("/profile")} />
          <EmployerRow icon={FileText} label="Resume" detail="Design and export your CV" onClick={() => navigate("/profile/resume-editor")} />
          <EmployerRow icon={CreditCard} label="Digital card" detail="Share your QR card" onClick={() => navigate("/card")} />
        </EmployerGroup>

        <EmployerGroup label="Grow">
          <EmployerRow icon={ShieldCheck} label="Certification" detail="Sector exams employers look for" onClick={() => navigate("/certification")} />
          <EmployerRow icon={BookOpen} label="Resources" detail="Guides and career learning" onClick={() => navigate("/resources")} />
          <EmployerRow icon={Video} label="Content library" detail="Videos from mentors" onClick={() => navigate("/content")} />
        </EmployerGroup>

        <section aria-label="Recent activity">
          <div className="flex items-center justify-between"><h2 className="ee-section-label">Recent activity</h2><button className="text-sm font-bold text-primary px-2 min-h-[44px]" onClick={() => navigate("/notifications")}>View all</button></div>
          <div className="ee-group p-3"><ActivityStream limit={3} /></div>
        </section>
        <EmployerGroup label="Messages">
          <EmployerRow icon={MessageCircle} label="Inbox" detail="Conversations with employers" onClick={() => navigate("/chat")} />
        </EmployerGroup>
      </div>
    </div>
  );
}
