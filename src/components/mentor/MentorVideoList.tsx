import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMentorVideos, useDeleteMentorVideo } from "@/hooks/useMentorVideos";
import { useMentorSubscription, TIER_CONFIG } from "@/hooks/useMentorSubscription";
import { useMentorProfile } from "@/hooks/useMentorProfile";
import { formatDuration, extractYouTubeId, getYouTubeThumbnail } from "@/hooks/useContentVideos";
import { Youtube, Upload, Trash2, Edit, Plus, Loader2, Clock, ShieldAlert } from "lucide-react";
import { TierBadge } from "./TierBadge";
import { MentorVideoUpload } from "./MentorVideoUpload";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export function MentorVideoList() {
  const { data: videos = [], isLoading } = useMentorVideos();
  const { data: subscription } = useMentorSubscription();
  const { data: profile } = useMentorProfile();
  const deleteVideo = useDeleteMentorVideo();
  const [showUpload, setShowUpload] = useState(false);

  const tier = subscription?.tier || "free";
  const config = TIER_CONFIG[tier];
  const videoCount = videos.length;
  const canUpload = videoCount < config.maxVideos;
  const isApproved = profile?.approval_status === "approved";

  if (showUpload) {
    return <MentorVideoUpload onBack={() => setShowUpload(false)} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">My Videos</h2>
          <p className="text-sm text-muted-foreground">
            {videoCount} / {config.maxVideos === Infinity ? "∞" : config.maxVideos} videos used
            <TierBadge tier={tier} className="ml-2" />
          </p>
        </div>
        <Button onClick={() => setShowUpload(true)} disabled={!canUpload || !isApproved} className="gap-1">
          <Plus className="h-4 w-4" /> Add Video
        </Button>
      </div>

      {!isApproved && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="py-3 text-sm flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <span>Your account must be approved before you can upload or publish content.</span>
          </CardContent>
        </Card>
      )}

      {isApproved && !canUpload && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="py-3 text-sm">
            You've reached your video limit. Upgrade your tier to upload more videos.
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : videos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p className="text-lg font-medium">No videos yet</p>
            <p className="text-sm mt-1">Upload your first video to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {videos.map((video) => {
            let thumb = video.thumbnail_url;
            if (!thumb && video.source_type === "youtube" && video.youtube_url) {
              const ytId = extractYouTubeId(video.youtube_url);
              if (ytId) thumb = getYouTubeThumbnail(ytId);
            }

            return (
              <Card key={video.id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    <div className="relative flex-shrink-0 w-28 h-20 rounded-md overflow-hidden bg-muted">
                      {thumb ? (
                        <img src={thumb} alt={video.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {video.source_type === "youtube" ? <Youtube className="h-6 w-6 text-muted-foreground" /> : <Upload className="h-6 w-6 text-muted-foreground" />}
                        </div>
                      )}
                      {video.duration_seconds && (
                        <div className="absolute bottom-1 right-1 bg-black/75 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />{formatDuration(video.duration_seconds)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-1">{video.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={video.is_published ? "default" : "secondary"} className="text-[10px] h-5">
                          {video.is_published ? "Published" : "Draft"}
                        </Badge>
                        {video.source_type === "youtube" ? (
                          <Badge variant="secondary" className="text-[10px] h-5 gap-0.5"><Youtube className="h-2.5 w-2.5" /> YouTube</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] h-5 gap-0.5 text-green-700 border-green-300 bg-green-50"><Upload className="h-2.5 w-2.5" /> Uploaded</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete video?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteVideo.mutate(video.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
