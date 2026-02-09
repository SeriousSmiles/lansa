import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, GraduationCap, Sparkles, Youtube, Upload } from "lucide-react";
import { type ContentVideo, formatDuration, extractYouTubeId } from "@/hooks/useContentVideos";
import { supabase } from "@/integrations/supabase/client";

interface VideoDetailProps {
  video: ContentVideo;
}

export function VideoDetail({ video }: VideoDetailProps) {
  const ytId = video.source_type === "youtube" && video.youtube_url
    ? extractYouTubeId(video.youtube_url)
    : null;

  const nativeUrl = video.source_type === "native" && video.storage_path
    ? supabase.storage.from("content-videos").getPublicUrl(video.storage_path).data.publicUrl
    : null;

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
        {ytId ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            title={video.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : nativeUrl ? (
          <video
            src={nativeUrl}
            controls
            className="w-full h-full"
            preload="metadata"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <p>Video not available</p>
          </div>
        )}
      </div>

      {/* Title + Source Badge */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold leading-tight">{video.title}</h2>
          {video.source_type === "youtube" ? (
            <Badge variant="secondary" className="flex-shrink-0 gap-1">
              <Youtube className="h-3 w-3" /> YouTube
            </Badge>
          ) : (
            <Badge variant="outline" className="flex-shrink-0 gap-1 text-green-700 border-green-300 bg-green-50">
              <Upload className="h-3 w-3" /> Uploaded
            </Badge>
          )}
        </div>
        {video.category && (
          <p className="text-sm text-muted-foreground mt-1">{video.category}</p>
        )}
      </div>

      <Separator />

      {/* Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {video.duration_seconds && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-medium">{formatDuration(video.duration_seconds)}</span>
          </div>
        )}
        {video.education_type && (
          <div className="flex items-center gap-2 text-sm">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Great for:</span>
            <span className="font-medium">{video.education_type}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {video.description && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Description</h3>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{video.description}</p>
        </div>
      )}

      {/* Transformation Promise */}
      {video.transformation_promise && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">What You'll Get From This</h3>
          </div>
          <p className="text-sm leading-relaxed">{video.transformation_promise}</p>
        </div>
      )}
    </div>
  );
}
