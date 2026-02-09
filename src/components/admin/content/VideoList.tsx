import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Youtube, Upload } from "lucide-react";
import { type ContentVideo, useTogglePublish, useDeleteVideo, formatDuration } from "@/hooks/useContentVideos";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface VideoListProps {
  videos: ContentVideo[];
  onEdit: (video: ContentVideo) => void;
}

export function VideoList({ videos, onEdit }: VideoListProps) {
  const togglePublish = useTogglePublish();
  const deleteVideo = useDeleteVideo();

  if (videos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No videos yet. Add your first video above.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Published</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {videos.map((video) => (
            <TableRow key={video.id}>
              <TableCell className="font-medium max-w-[200px] truncate">{video.title}</TableCell>
              <TableCell>
                {video.source_type === "youtube" ? (
                  <Badge variant="secondary" className="gap-1">
                    <Youtube className="h-3 w-3" /> YouTube
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 text-green-700 border-green-300 bg-green-50">
                    <Upload className="h-3 w-3" /> Uploaded
                  </Badge>
                )}
              </TableCell>
              <TableCell>{video.category || "—"}</TableCell>
              <TableCell>{formatDuration(video.duration_seconds)}</TableCell>
              <TableCell>
                <Switch
                  checked={video.is_published}
                  onCheckedChange={(checked) =>
                    togglePublish.mutate({ id: video.id, is_published: checked })
                  }
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(video)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete "{video.title}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteVideo.mutate(video.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
