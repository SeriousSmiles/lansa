import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateMentorVideo } from "@/hooks/useMentorVideos";
import { extractYouTubeId, getYouTubeThumbnail } from "@/hooks/useContentVideos";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2, Youtube, Upload } from "lucide-react";
import { toast } from "sonner";

interface MentorVideoUploadProps {
  onBack: () => void;
}

export function MentorVideoUpload({ onBack }: MentorVideoUploadProps) {
  const createVideo = useCreateMentorVideo();
  const [sourceType, setSourceType] = useState<"youtube" | "native">("youtube");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [educationType, setEducationType] = useState("");
  const [transformationPromise, setTransformationPromise] = useState("");
  const [category, setCategory] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [storagePath, setStoragePath] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      toast.error("File too large. Maximum 100MB.");
      return;
    }
    setUploading(true);
    try {
      const path = `mentor/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("content-videos").upload(path, file);
      if (error) throw error;
      setStoragePath(path);
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
      toast.success("File uploaded");
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let thumbnailUrl: string | null = null;
    if (sourceType === "youtube" && youtubeUrl) {
      const ytId = extractYouTubeId(youtubeUrl);
      if (!ytId) {
        toast.error("Invalid YouTube URL");
        return;
      }
      thumbnailUrl = getYouTubeThumbnail(ytId);
    }

    createVideo.mutate(
      {
        title,
        description: description || null,
        source_type: sourceType,
        youtube_url: sourceType === "youtube" ? youtubeUrl : null,
        storage_path: sourceType === "native" ? storagePath : null,
        thumbnail_url: thumbnailUrl,
        duration_seconds: duration ? parseInt(duration) * 60 : null,
        education_type: educationType || null,
        transformation_promise: transformationPromise || null,
        category: category || null,
        is_published: isPublished,
        created_by: null,
      },
      {
        onSuccess: () => onBack(),
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>Upload Video</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={sourceType} onValueChange={(v) => setSourceType(v as any)}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="youtube" className="gap-1"><Youtube className="h-3.5 w-3.5" /> YouTube</TabsTrigger>
              <TabsTrigger value="native" className="gap-1"><Upload className="h-3.5 w-3.5" /> Upload</TabsTrigger>
            </TabsList>
            <TabsContent value="youtube" className="mt-3">
              <Label>YouTube URL</Label>
              <Input
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                required={sourceType === "youtube"}
              />
            </TabsContent>
            <TabsContent value="native" className="mt-3">
              <Label>Video File (max 100MB)</Label>
              <Input type="file" accept="video/*" onChange={handleFileUpload} disabled={uploading} />
              {uploading && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Loader2 className="h-3 w-3 animate-spin" /> Uploading...</p>}
              {storagePath && <p className="text-xs text-green-600 mt-1">✓ File uploaded</p>}
            </TabsContent>
          </Tabs>

          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Duration (minutes)</Label>
              <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} min="1" />
            </div>
            <div>
              <Label>Category</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Interview Skills" />
            </div>
          </div>
          <div>
            <Label>Education Type</Label>
            <Input value={educationType} onChange={(e) => setEducationType(e.target.value)} placeholder="e.g., Career Development" />
          </div>
          <div>
            <Label>Transformation Promise</Label>
            <Textarea value={transformationPromise} onChange={(e) => setTransformationPromise(e.target.value)} placeholder="What will learners gain from this video?" rows={2} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            <Label>Publish immediately</Label>
          </div>
          <Button type="submit" className="w-full" disabled={createVideo.isPending || (sourceType === "native" && !storagePath)}>
            {createVideo.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Add Video
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
