import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { VideoForm } from "@/components/admin/content/VideoForm";
import { VideoList } from "@/components/admin/content/VideoList";
import { useAllVideos, type ContentVideo } from "@/hooks/useContentVideos";

export default function AdminContent() {
  const { data: videos = [], isLoading } = useAllVideos();
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<ContentVideo | null>(null);

  function handleEdit(video: ContentVideo) {
    setEditingVideo(video);
    setShowForm(true);
  }

  function handleClose() {
    setShowForm(false);
    setEditingVideo(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">Manage video content for the Content Library</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Video
          </Button>
        )}
      </div>

      {showForm && (
        <VideoForm video={editingVideo} onClose={handleClose} />
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Loading videos...</p>
      ) : (
        <VideoList videos={videos} onEdit={handleEdit} />
      )}
    </div>
  );
}
