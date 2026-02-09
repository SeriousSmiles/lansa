import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/loading/LoadingSpinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Video,
  User,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

interface MentorWithStats {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  mentor_type: string;
  external_url: string | null;
  profile_image: string | null;
  approval_status: string;
  rejected_reason: string | null;
  approved_at: string | null;
  created_at: string;
  video_count: number;
  tier: string;
}

const STATUS_CONFIG = {
  pending: { label: "Pending", icon: Clock, variant: "secondary" as const, color: "text-amber-600" },
  approved: { label: "Approved", icon: CheckCircle, variant: "default" as const, color: "text-green-600" },
  rejected: { label: "Rejected", icon: XCircle, variant: "destructive" as const, color: "text-red-600" },
};

export default function AdminMentors() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pending");
  const [approveId, setApproveId] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: mentors = [], isLoading } = useQuery({
    queryKey: ["admin-mentors"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("mentor_profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Get video counts and subscription tiers
      const userIds = (profiles || []).map((p: any) => p.user_id);
      
      const [videosRes, subsRes] = await Promise.all([
        supabase.from("content_videos").select("mentor_id").in("mentor_id", userIds),
        supabase.from("mentor_subscriptions").select("user_id, tier").in("user_id", userIds).eq("is_active", true),
      ]);

      const videoCounts: Record<string, number> = {};
      (videosRes.data || []).forEach((v: any) => {
        videoCounts[v.mentor_id] = (videoCounts[v.mentor_id] || 0) + 1;
      });

      const tierMap: Record<string, string> = {};
      (subsRes.data || []).forEach((s: any) => {
        tierMap[s.user_id] = s.tier;
      });

      return (profiles || []).map((p: any) => ({
        ...p,
        video_count: videoCounts[p.user_id] || 0,
        tier: tierMap[p.user_id] || "free",
      })) as MentorWithStats[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (mentorUserId: string) => {
      const { error } = await supabase
        .from("mentor_profiles")
        .update({
          approval_status: "approved",
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
          rejected_reason: null,
        })
        .eq("user_id", mentorUserId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-mentors"] });
      toast.success("Mentor approved successfully");
      setApproveId(null);
    },
    onError: (e: Error) => toast.error("Failed to approve: " + e.message),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const { error } = await supabase
        .from("mentor_profiles")
        .update({
          approval_status: "rejected",
          rejected_reason: reason,
          approved_at: null,
          approved_by: null,
        })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-mentors"] });
      toast.success("Mentor rejected");
      setRejectDialog(null);
      setRejectReason("");
    },
    onError: (e: Error) => toast.error("Failed to reject: " + e.message),
  });

  const filteredMentors = mentors.filter((m) => m.approval_status === activeTab);
  const counts = {
    pending: mentors.filter((m) => m.approval_status === "pending").length,
    approved: mentors.filter((m) => m.approval_status === "approved").length,
    rejected: mentors.filter((m) => m.approval_status === "rejected").length,
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mentor Approval</h1>
        <p className="text-sm text-muted-foreground">
          Review and approve mentor accounts before they can publish content.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {(["pending", "approved", "rejected"] as const).map((status) => {
          const cfg = STATUS_CONFIG[status];
          const Icon = cfg.icon;
          return (
            <Card key={status} className="cursor-pointer" onClick={() => setActiveTab(status)}>
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className={`h-5 w-5 ${cfg.color}`} />
                <div>
                  <p className="text-2xl font-bold">{counts[status]}</p>
                  <p className="text-xs text-muted-foreground">{cfg.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-1">
            <Clock className="h-3.5 w-3.5" /> Pending ({counts.pending})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-1">
            <CheckCircle className="h-3.5 w-3.5" /> Approved ({counts.approved})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-1">
            <XCircle className="h-3.5 w-3.5" /> Rejected ({counts.rejected})
          </TabsTrigger>
        </TabsList>

        {(["pending", "approved", "rejected"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            {filteredMentors.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No {tab} mentors
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredMentors.map((mentor) => (
                  <MentorCard
                    key={mentor.id}
                    mentor={mentor}
                    onApprove={() => setApproveId(mentor.user_id)}
                    onReject={() => setRejectDialog({ id: mentor.user_id, name: mentor.display_name })}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Approve confirmation */}
      <AlertDialog open={!!approveId} onOpenChange={() => setApproveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve this mentor?</AlertDialogTitle>
            <AlertDialogDescription>
              They will be able to upload and publish content immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => approveId && approveMutation.mutate(approveId)}
              disabled={approveMutation.isPending}
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject dialog with reason */}
      <Dialog open={!!rejectDialog} onOpenChange={() => { setRejectDialog(null); setRejectReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {rejectDialog?.name}?</DialogTitle>
            <DialogDescription>
              Provide a reason so the mentor knows what to improve.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection (optional but recommended)..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectDialog(null); setRejectReason(""); }}>
              Cancel
            </Button>
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => rejectDialog && rejectMutation.mutate({ userId: rejectDialog.id, reason: rejectReason })}
              disabled={rejectMutation.isPending}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MentorCard({
  mentor,
  onApprove,
  onReject,
}: {
  mentor: MentorWithStats;
  onApprove: () => void;
  onReject: () => void;
}) {
  const cfg = STATUS_CONFIG[mentor.approval_status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={mentor.profile_image || undefined} />
            <AvatarFallback>
              <GraduationCap className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold">{mentor.display_name}</h3>
              <Badge variant={cfg.variant} className="gap-1 text-xs">
                <Icon className="h-3 w-3" /> {cfg.label}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">{mentor.mentor_type}</Badge>
              <Badge variant="secondary" className="text-xs uppercase">{mentor.tier}</Badge>
            </div>

            {mentor.bio && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{mentor.bio}</p>
            )}

            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Video className="h-3 w-3" /> {mentor.video_count} videos
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" /> Joined {new Date(mentor.created_at).toLocaleDateString()}
              </span>
              {mentor.external_url && (
                <a
                  href={mentor.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> Website
                </a>
              )}
            </div>

            {mentor.rejected_reason && mentor.approval_status === "rejected" && (
              <div className="mt-2 p-2 rounded bg-destructive/10 text-sm text-destructive">
                <strong>Rejection reason:</strong> {mentor.rejected_reason}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 flex-shrink-0">
            {mentor.approval_status !== "approved" && (
              <Button size="sm" onClick={onApprove} className="gap-1">
                <CheckCircle className="h-3.5 w-3.5" /> Approve
              </Button>
            )}
            {mentor.approval_status !== "rejected" && (
            <Button size="sm" variant="outline" onClick={onReject} className="gap-1 text-destructive hover:text-destructive">
                <XCircle className="h-3.5 w-3.5" /> Reject
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
