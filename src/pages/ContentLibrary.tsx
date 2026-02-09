import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { usePublishedVideos, type ContentVideo } from "@/hooks/useContentVideos";
import { VideoCardList } from "@/components/content/VideoCardList";
import { VideoDetail } from "@/components/content/VideoDetail";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ContentLibrary() {
  const { user } = useAuth();
  const { data: videos = [], isLoading } = usePublishedVideos();
  const [selectedVideo, setSelectedVideo] = useState<ContentVideo | null>(null);
  const isMobile = useIsMobile();
  const userName = user?.email ? user.email.split("@")[0] : "Lansa User";

  if (isLoading) {
    return (
      <DashboardLayout userName={userName} email={user?.email || ""}>
        <div className="p-6 flex justify-center items-center h-[calc(100vh-100px)]">
          <p className="text-xl text-muted-foreground">Loading content...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Mobile: show detail view or list
  if (isMobile) {
    if (selectedVideo) {
      return (
        <DashboardLayout userName={userName} email={user?.email || ""}>
          <div className="p-4">
            <Button
              variant="ghost"
              size="sm"
              className="mb-3 gap-1"
              onClick={() => setSelectedVideo(null)}
            >
              <ArrowLeft className="h-4 w-4" /> Back to videos
            </Button>
            <VideoDetail video={selectedVideo} />
          </div>
        </DashboardLayout>
      );
    }

    return (
      <DashboardLayout userName={userName} email={user?.email || ""}>
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-1">Content Library</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Watch and learn from curated video content
          </p>
          <VideoCardList
            videos={videos}
            selectedId={null}
            onSelect={(v) => setSelectedVideo(v)}
          />
        </div>
      </DashboardLayout>
    );
  }

  // Desktop: 2-column layout
  return (
    <DashboardLayout userName={userName} email={user?.email || ""}>
      <div className="p-6 h-[calc(100vh-80px)] flex flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Content Library</h1>
          <p className="text-sm text-muted-foreground">
            Watch and learn from curated video content
          </p>
        </div>

        <div className="flex-1 flex gap-6 min-h-0">
          {/* Left: Video list */}
          <div className="w-[340px] flex-shrink-0 overflow-y-auto pr-2">
            <VideoCardList
              videos={videos}
              selectedId={selectedVideo?.id || null}
              onSelect={(v) => setSelectedVideo(v)}
            />
          </div>

          {/* Right: Detail panel */}
          <div className="flex-1 overflow-y-auto">
            {selectedVideo ? (
              <VideoDetail video={selectedVideo} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <p className="text-lg font-medium">Select a video</p>
                <p className="text-sm mt-1">
                  Choose a video from the list to see its details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
