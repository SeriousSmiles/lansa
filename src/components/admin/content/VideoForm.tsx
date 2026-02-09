import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Youtube, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateVideo, useUpdateVideo, extractYouTubeId, getYouTubeThumbnail, type ContentVideo, type ContentVideoInsert } from "@/hooks/useContentVideos";
import { toast } from "sonner";

interface VideoFormProps {
  video?: ContentVideo | null;
  onClose: () => void;
}

const EDUCATION_TYPES = [
  "Career Development",
  "Interview Skills",
  "Leadership",
  "Communication",
  "Technical Skills",
  "Personal Branding",
  "Networking",
  "Productivity",
  "Mindset",
  "Other",
];

const CATEGORIES = [
  "Getting Started",
  "Professional Growth",
  "Job Search",
  "Skills Building",
  "Industry Insights",
  "Motivation",
];

export function VideoForm({ video, onClose }: VideoFormProps) {
  const { user } = useAuth();
  const createVideo = useCreateVideo();
  const updateVideo = useUpdateVideo();
  const isEditing = !!video;

  const [sourceType, setSourceType] = useState<"youtube" | "native">(video?.source_type || "youtube");
  const [title, setTitle] = useState(video?.title || "");
  const [description, setDescription] = useState(video?.description || "");
  const [youtubeUrl, setYoutubeUrl] = useState(video?.youtube_url || "");
  const [durationSeconds, setDurationSeconds] = useState<number>(video?.duration_seconds || 0);
  const [educationType, setEducationType] = useState(video?.education_type || "");
  const [transformationPromise, setTransformationPromise] = useState(video?.transformation_promise || "");
  const [category, setCategory] = useState(video?.category || "");
  const [isPublished, setIsPublished] = useState(video?.is_published || false);
  const [thumbnailUrl, setThumbnailUrl] = useState(video?.thumbnail_url || "");
  const [uploading, setUploading] = useState(false);
  const [storagePath, setStoragePath] = useState(video?.storage_path || "");
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const durationMinutes = Math.floor(durationSeconds / 60);

  async function handleVideoUpload(file: File) {
    if (file.size > 100 * 1024 * 1024) {
      toast.error("File size must be under 100MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `videos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("content-videos").upload(path, file);
    if (error) {
      toast.error("Upload failed: " + error.message);
      setUploading(false);
      return;
    }
    setStoragePath(path);
    setUploading(false);
    toast.success("Video uploaded");
  }

  async function handleThumbnailUpload(file: File) {
    const ext = file.name.split(".").pop();
    const path = `thumbnails/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("content-videos").upload(path, file);
    if (error) {
      toast.error("Thumbnail upload failed");
      return;
    }
    const { data } = supabase.storage.from("content-videos").getPublicUrl(path);
    setThumbnailUrl(data.publicUrl);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    let finalThumbnail = thumbnailUrl;
    if (sourceType === "youtube" && youtubeUrl && !thumbnailUrl) {
      const videoId = extractYouTubeId(youtubeUrl);
      if (videoId) finalThumbnail = getYouTubeThumbnail(videoId);
    }

    const payload: any = {
      title: title.trim(),
      description: description.trim() || null,
      source_type: sourceType,
      youtube_url: sourceType === "youtube" ? youtubeUrl : null,
      storage_path: sourceType === "native" ? storagePath : null,
      thumbnail_url: finalThumbnail || null,
      duration_seconds: durationSeconds || null,
      education_type: educationType || null,
      transformation_promise: transformationPromise.trim() || null,
      category: category || null,
      is_published: isPublished,
    };

    if (isEditing) {
      updateVideo.mutate({ id: video!.id, ...payload }, { onSuccess: onClose });
    } else {
      payload.created_by = user?.id || null;
      createVideo.mutate(payload as ContentVideoInsert, { onSuccess: onClose });
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{isEditing ? "Edit Video" : "Add Video"}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing && (
            <Tabs value={sourceType} onValueChange={(v) => setSourceType(v as "youtube" | "native")}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="youtube" className="flex items-center gap-2">
                  <Youtube className="h-4 w-4" /> YouTube
                </TabsTrigger>
                <TabsTrigger value="native" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" /> Upload
                </TabsTrigger>
              </TabsList>
              <TabsContent value="youtube">
                <div className="space-y-2">
                  <Label>YouTube URL</Label>
                  <Input
                    placeholder="https://youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                  />
                </div>
              </TabsContent>
              <TabsContent value="native">
                <div className="space-y-2">
                  <Label>Video File (max 100MB)</Label>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setVideoFile(f);
                        handleVideoUpload(f);
                      }
                    }}
                  />
                  {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
                  {storagePath && !uploading && <p className="text-sm text-green-600">✓ Uploaded</p>}
                </div>
              </TabsContent>
            </Tabs>
          )}

          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Video title" />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this video about?" rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input type="number" min={0} value={durationMinutes} onChange={(e) => setDurationSeconds(parseInt(e.target.value || "0") * 60)} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Great for (Education Type)</Label>
            <Select value={educationType} onValueChange={setEducationType}>
              <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {EDUCATION_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Transformation Promise</Label>
            <Textarea
              value={transformationPromise}
              onChange={(e) => setTransformationPromise(e.target.value)}
              placeholder="What will the user gain from watching this video?"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Custom Thumbnail</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleThumbnailUpload(f);
              }}
            />
            {thumbnailUrl && (
              <img src={thumbnailUrl} alt="Thumbnail" className="w-32 h-20 object-cover rounded mt-1" />
            )}
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            <Label>Publish immediately</Label>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={uploading || createVideo.isPending || updateVideo.isPending}>
              {isEditing ? "Save Changes" : "Add Video"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
