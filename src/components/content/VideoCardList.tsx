import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Youtube, Upload, Clock, GraduationCap, Star } from "lucide-react";
import { type ContentVideo, formatDuration, extractYouTubeId, getYouTubeThumbnail } from "@/hooks/useContentVideos";
import { cn } from "@/lib/utils";

interface VideoCardListProps {
  videos: ContentVideo[];
  selectedId: string | null;
  onSelect: (video: ContentVideo) => void;
}

export function VideoCardList({ videos, selectedId, onSelect }: VideoCardListProps) {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <p className="text-lg font-medium">No content available yet</p>
        <p className="text-sm mt-1">Check back soon for new videos</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {videos.map((video) => {
        const isSelected = video.id === selectedId;
        let thumb = video.thumbnail_url;
        if (!thumb && video.source_type === "youtube" && video.youtube_url) {
          const ytId = extractYouTubeId(video.youtube_url);
          if (ytId) thumb = getYouTubeThumbnail(ytId);
        }

        return (
          <Card
            key={video.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md overflow-hidden",
              isSelected && "ring-2 ring-primary shadow-md"
            )}
            onClick={() => onSelect(video)}
          >
            <div className="flex gap-3 p-3">
              {/* Thumbnail */}
              <div className="relative flex-shrink-0 w-28 h-20 rounded-md overflow-hidden bg-muted">
                {thumb ? (
                  <img src={thumb} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {video.source_type === "youtube" ? (
                      <Youtube className="h-8 w-8 text-muted-foreground" />
                    ) : (
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                )}
                {video.duration_seconds && (
                  <div className="absolute bottom-1 right-1 bg-black/75 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    {formatDuration(video.duration_seconds)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm leading-tight line-clamp-2">{video.title}</h3>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {(video as any).mentor_id ? (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 gap-0.5 text-emerald-700 border-emerald-300 bg-emerald-50">
                      <GraduationCap className="h-2.5 w-2.5" /> Mentor
                    </Badge>
                  ) : video.source_type === "youtube" ? (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 gap-0.5">
                      <Youtube className="h-2.5 w-2.5" /> YouTube
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 gap-0.5 text-green-700 border-green-300 bg-green-50">
                      <Upload className="h-2.5 w-2.5" /> Uploaded
                    </Badge>
                  )}
                  {(video as any).is_promoted && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 gap-0.5 text-amber-700 border-amber-300 bg-amber-50">
                      <Star className="h-2.5 w-2.5" /> Featured
                    </Badge>
                  )}
                  {video.category && (
                    <span className="text-[11px] text-muted-foreground">{video.category}</span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
