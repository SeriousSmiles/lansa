import { Illustration } from "@/components/common/Illustration";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Briefcase, BookOpen, PenLine, RefreshCw, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageShell } from "@/components/dashboard/portal/PortalPageShell";
import { EmployerHeader } from "@/components/mobile/employer/employerUi";
import { FeedPostCard } from "@/components/feed/FeedPostCard";
import { ComposePostSheet } from "@/components/feed/ComposePostSheet";
import { FEED_CATEGORIES, type FeedFilter } from "@/components/feed/careerFeedModel";
import { careerFeedService, type CareerPost } from "@/services/careerFeedService";
import { learningJobFeedService, type LearningJobListing } from "@/services/learningJobFeedService";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { SEOHead } from "@/components/SEOHead";
import { toast } from "sonner";

const FILTERS: { id: FeedFilter; label: string }[] = [{ id: "all", label: "All" }, ...FEED_CATEGORIES.map((c) => ({ id: c.id as FeedFilter, label: c.label })), { id: "saved", label: "Saved" }];

export default function Feed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { postId } = useParams();
  const [params, setParams] = useSearchParams();
  const filter = (FILTERS.find((f) => f.id === params.get("filter"))?.id ?? "all") as FeedFilter;
  const [posts, setPosts] = useState<CareerPost[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [detail, setDetail] = useState<CareerPost | null>(null);
  const [detailState, setDetailState] = useState<"idle" | "loading" | "missing">("idle");
  const [busy, setBusy] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(params.get("compose") === "1");
  const [confirmDelete, setConfirmDelete] = useState<CareerPost | null>(null);
  const [jobs, setJobs] = useState<LearningJobListing[]>([]);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setState("loading");
    try {
      const [list, ids] = await Promise.all([careerFeedService.list(filter, user.id), careerFeedService.savedIds(user.id)]);
      setPosts(list); setSaved(ids); setState("ready");
    } catch { setState("error"); }
  }, [filter, user?.id]);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let alive = true;
    learningJobFeedService.fetchJobs({ limit: 3 }).then((r) => alive && setJobs((r?.jobs || []).slice(0, 3))).catch(() => alive && setJobs([]));
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (params.get("compose") === "1") { const p = new URLSearchParams(params); p.delete("compose"); setParams(p, { replace: true }); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!postId) { setDetail(null); setDetailState("idle"); return; }
    const local = posts.find((p) => p.id === postId);
    if (local) { setDetail(local); setDetailState("idle"); return; }
    setDetailState("loading");
    careerFeedService.get(postId).then((p) => { setDetail(p); setDetailState(p ? "idle" : "missing"); }).catch(() => setDetailState("missing"));
  }, [postId, posts]);

  const setFilter = (f: FeedFilter) => { const p = new URLSearchParams(params); f === "all" ? p.delete("filter") : p.set("filter", f); setParams(p, { replace: true }); };
  const openPost = (id: string) => navigate({ pathname: `/feed/${id}`, search: params.toString() ? `?${params}` : "" });
  const closePost = () => navigate({ pathname: "/feed", search: params.toString() ? `?${params}` : "" });

  const toggleSave = async (post: CareerPost) => {
    if (!user?.id) return;
    const next = !saved.has(post.id);
    setBusy(post.id);
    try {
      await careerFeedService.setSaved(user.id, post.id, next);
      setSaved((s) => { const n = new Set(s); next ? n.add(post.id) : n.delete(post.id); return n; });
      if (!next && filter === "saved") setPosts((ps) => ps.filter((p) => p.id !== post.id));
    } catch { toast.error("Couldn't update your saved posts. Try again."); }
    finally { setBusy(null); }
  };

  const doDelete = async () => {
    const post = confirmDelete; if (!post) return;
    setBusy(post.id);
    try {
      await careerFeedService.remove(post.id);
      setPosts((ps) => ps.filter((p) => p.id !== post.id));
      if (postId === post.id) closePost();
      toast.success("Your update was deleted.");
    } catch { toast.error("Couldn't delete this update. Try again."); }
    finally { setBusy(null); setConfirmDelete(null); }
  };

  const card = (p: CareerPost, expanded = false) => (
    <FeedPostCard key={p.id} post={p} saved={saved.has(p.id)} isOwner={p.author_id === user?.id} busy={busy === p.id} expanded={expanded} selected={!expanded && p.id === postId}
      onOpen={() => openPost(p.id)} onToggleSave={() => toggleSave(p)} onDelete={() => setConfirmDelete(p)} />
  );

  const emptyCopy = useMemo(() => filter === "saved"
    ? { t: "Nothing saved yet", d: "Save updates and work samples to find them here later." }
    : filter === "all" ? { t: "Your network is just getting started", d: "No members have shared updates yet. Be the first to share what you're working on." }
    : { t: `No ${FILTERS.find((f) => f.id === filter)?.label.toLowerCase()} yet`, d: "Try another category or share your own." }, [filter]);

  const list = (
    <div className="flex flex-col gap-3" aria-live="polite" aria-busy={state === "loading"}>
      {state === "loading" && [0, 1, 2].map((i) => <div key={i} className="ee-skeleton h-40" />)}
      {state === "error" && (
        <div className="ee-empty"><h3>Feed didn't load</h3><p>Check your connection and try again.</p><button className="ee-secondary mt-2" onClick={load}><RefreshCw size={16} />Retry</button></div>
      )}
      {state === "ready" && posts.length === 0 && (
        <div className="ee-empty"><Illustration name={filter === "saved" ? "jobs" : "feed"} size={150} /><h3>{emptyCopy.t}</h3><p>{emptyCopy.d}</p>{filter !== "saved" && <button className="ee-primary mt-2" onClick={() => setComposeOpen(true)}><PenLine size={18} />Share an update</button>}</div>
      )}
      {state === "ready" && posts.map((p) => card(p))}
    </div>
  );

  const fromLansa = filter === "all" && (
    <section aria-label="On LANSA now">
      <h2 className="ee-section-label">On LANSA now</h2>
      <div className="ee-group">
        {jobs.map((j) => (
          <button key={j.id} className="ee-row" onClick={() => navigate(`/jobs?job=${j.id}`)}>
            <span className="ee-row-icon"><Briefcase size={18} /></span>
            <span className="ee-row-text"><span className="ee-row-label">{j.title}</span><span className="ee-row-detail">{[j.organizations?.name || j.companies?.name, j.location].filter(Boolean).join(" · ") || "Open role"}</span></span>
            <span className="ee-row-trail"><ChevronRight size={18} /></span>
          </button>
        ))}
        <button className="ee-row" onClick={() => navigate("/resources")}>
          <span className="ee-row-icon"><BookOpen size={18} /></span>
          <span className="ee-row-text"><span className="ee-row-label">Resources & learning</span><span className="ee-row-detail">Guides, videos and certification prep</span></span>
          <span className="ee-row-trail"><ChevronRight size={18} /></span>
        </button>
      </div>
    </section>
  );

  const detailPane = postId && (
    detailState === "loading" ? <div className="ee-skeleton h-60" /> :
    detailState === "missing" || !detail ? <div className="ee-empty"><h3>This update isn't available</h3><p>It may have been deleted by its author.</p><button className="ee-secondary mt-2" onClick={closePost}>Back to feed</button></div> :
    card(detail, true)
  );

  return (
    <PortalPageShell fullBleed>
      <SEOHead title="Feed | Lansa" description="Career updates and work samples from LANSA members." canonical="https://lansa.online/feed" />
      <div className="seeker-theme ee-screen sk-page">
        <div className={`sk-feed-layout ${postId ? "has-detail" : ""}`}>
          <div className="sk-feed-list">
            <EmployerHeader title="Feed" actions={<button className="ee-icon-btn" aria-label="Refresh feed" onClick={load}><RefreshCw size={20} /></button>} />
            <div className="ee-body">
              <div className="ee-chips" role="toolbar" aria-label="Filter feed">
                {FILTERS.map((f) => <button key={f.id} className="ee-chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</button>)}
              </div>
              {list}
              {fromLansa}
            </div>
          </div>
          {postId && (
            <div className="sk-feed-detail">
              <EmployerHeader title="Update" onBack={closePost} backLabel="Back to feed" />
              <div className="ee-body">{detailPane}</div>
            </div>
          )}
        </div>
        {!composeOpen && <button className="sk-fab" onClick={() => setComposeOpen(true)} aria-label="Share an update"><PenLine size={22} /><span>Share</span></button>}
      </div>

      <ComposePostSheet open={composeOpen} onOpenChange={setComposeOpen} defaultCategory={filter !== "all" && filter !== "saved" ? filter : "update"}
        onCreated={(p) => { toast.success("Your update is live for LANSA members."); if (filter === "all" || filter === p.category) setPosts((ps) => [p, ...ps]); }} />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete this update?</AlertDialogTitle><AlertDialogDescription>It will be removed from the feed and from anyone's saved list. This can't be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Keep it</AlertDialogCancel><AlertDialogAction onClick={doDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PortalPageShell>
  );
}
