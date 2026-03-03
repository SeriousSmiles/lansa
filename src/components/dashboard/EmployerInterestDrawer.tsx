import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import {
  Heart,
  Zap,
  MapPin,
  Briefcase,
  MessageCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface InterestedEmployer {
  swipe_id: string;
  direction: string;
  created_at: string;
  employer_id: string;
  employer_name: string | null;
  employer_title: string | null;
  employer_image: string | null;
  employer_cover_color: string | null;
}

interface JobListing {
  id: string;
  title: string;
  job_type: string;
  location: string | null;
  is_remote: boolean | null;
  salary_range: string | null;
  category: string;
}

interface Props {
  employer: InterestedEmployer | null;
  open: boolean;
  onClose: () => void;
}

const getInitials = (name: string | null) => {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

export function EmployerInterestDrawer({ employer, open, onClose }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (open && employer) fetchEmployerJobs();
    else setJobs([]);
  }, [open, employer]);

  const fetchEmployerJobs = async () => {
    if (!employer) return;
    setJobsLoading(true);
    try {
      const { data } = await supabase
        .from("job_listings_v2")
        .select("id, title, job_type, location, is_remote, salary_range, category")
        .eq("created_by", employer.employer_id)
        .eq("is_active", true)
        .limit(5);
      setJobs(data ?? []);
    } catch (err) {
      console.error("[EmployerInterestDrawer] Failed to load jobs:", err);
    } finally {
      setJobsLoading(false);
    }
  };

  const handleOpenChat = async () => {
    if (!user || !employer) return;
    setChatLoading(true);
    try {
      // 1. Check if mutual match already exists
      const { data: existingMatch } = await supabase
        .from("matches")
        .select("id")
        .or(
          `and(user_a.eq.${user.id},user_b.eq.${employer.employer_id}),and(user_a.eq.${employer.employer_id},user_b.eq.${user.id})`
        )
        .maybeSingle();

      // 2. If no match, create candidate's right swipe to trigger DB match
      if (!existingMatch) {
        await supabase.from("swipes").insert({
          swiper_user_id: user.id,
          target_user_id: employer.employer_id,
          direction: "right" as const,
          context: "employee" as const,
        });
        // Give the DB trigger a moment to create the match + thread
        await new Promise((r) => setTimeout(r, 1500));
      }

      // 3. Find the chat thread
      const { data: threads } = await supabase
        .from("chat_threads")
        .select("id")
        .contains("participant_ids", [user.id, employer.employer_id])
        .limit(1);

      const threadId = threads?.[0]?.id;

      if (threadId) {
        // 4. Notify employer via email
        try {
          await supabase.functions.invoke("send-chat-email", {
            body: {
              user_id: employer.employer_id,
              thread_id: threadId,
              notification_type: "match_created",
            },
          });
        } catch (emailErr) {
          console.warn("[EmployerInterestDrawer] Email notification failed (non-critical):", emailErr);
        }

        onClose();
        navigate(`/chat/${threadId}`);
      } else {
        console.error("[EmployerInterestDrawer] Thread not found after match creation");
      }
    } catch (err) {
      console.error("[EmployerInterestDrawer] handleOpenChat error:", err);
    } finally {
      setChatLoading(false);
    }
  };

  if (!employer) return null;

  const isNudge = employer.direction === "nudge";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="h-[85vh] rounded-t-2xl p-0 overflow-hidden flex flex-col sm:h-[75vh]"
      >
        {/* Cover banner */}
        <div
          className="h-24 w-full flex-shrink-0"
          style={{
            background: employer.employer_cover_color
              ? `linear-gradient(135deg, ${employer.employer_cover_color}dd 0%, ${employer.employer_cover_color}88 100%)`
              : "hsl(var(--primary) / 0.2)",
          }}
        />

        {/* Profile header */}
        <div className="px-5 -mt-8 flex-shrink-0">
          <div className="flex items-end gap-3 mb-3">
            {employer.employer_image ? (
              <img
                src={employer.employer_image}
                alt={employer.employer_name ?? "Employer"}
                className="w-16 h-16 rounded-2xl border-4 border-background object-cover shadow-md"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-2xl border-4 border-background flex items-center justify-center text-white text-lg font-bold shadow-md"
                style={{
                  background: employer.employer_cover_color ?? "hsl(var(--primary))",
                }}
              >
                {getInitials(employer.employer_name)}
              </div>
            )}
            <div className="pb-1">
              <h2 className="font-bold text-foreground text-base leading-tight">
                {employer.employer_name ?? "An Employer"}
              </h2>
              {employer.employer_title && (
                <p className="text-sm text-muted-foreground">{employer.employer_title}</p>
              )}
            </div>
          </div>

          {/* Interest context banner */}
          <div
            className={`rounded-xl px-3 py-2.5 flex items-center gap-2 mb-1 ${
              isNudge
                ? "bg-amber-50 border border-amber-200"
                : "bg-green-50 border border-green-200"
            }`}
          >
            {isNudge ? (
              <Zap className="h-4 w-4 text-amber-600 flex-shrink-0" />
            ) : (
              <Heart className="h-4 w-4 text-green-600 flex-shrink-0" />
            )}
            <div>
              <p className={`text-xs font-semibold ${isNudge ? "text-amber-700" : "text-green-700"}`}>
                {isNudge ? "Super Interested in your profile" : "Liked your profile"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {formatDistanceToNow(new Date(employer.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable jobs section */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Open Positions {!jobsLoading && jobs.length > 0 && (
              <span className="text-muted-foreground font-normal">({jobs.length})</span>
            )}
          </h3>

          {jobsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-3">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading positions…</span>
            </div>
          ) : jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No active listings at the moment.</p>
          ) : (
            <div className="space-y-2">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-muted/40 border border-border rounded-xl px-3 py-2.5 space-y-1"
                >
                  <p className="text-sm font-medium text-foreground leading-tight">{job.title}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Briefcase className="h-3 w-3" />
                      {job.job_type?.replace("_", " ")}
                    </span>
                    {(job.location || job.is_remote) && (
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {job.is_remote ? "Remote" : job.location}
                      </span>
                    )}
                    {job.salary_range && (
                      <span className="text-[11px] text-muted-foreground">{job.salary_range}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-5 pb-6 pt-3 border-t border-border flex-shrink-0 bg-background">
          <Button
            className="w-full h-12 text-sm font-semibold gap-2"
            onClick={handleOpenChat}
            disabled={chatLoading}
          >
            {chatLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting…
              </>
            ) : (
              <>
                <MessageCircle className="h-4 w-4" />
                Open Chat & Connect
              </>
            )}
          </Button>
          <p className="text-[11px] text-muted-foreground text-center mt-2">
            This will notify {employer.employer_name ?? "the employer"} that you've connected.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
