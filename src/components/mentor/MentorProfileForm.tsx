import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMentorProfile, useUpdateMentorProfile } from "@/hooks/useMentorProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export function MentorProfileForm() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useMentorProfile();
  const updateProfile = useUpdateMentorProfile();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [mentorType, setMentorType] = useState<"teacher" | "coach" | "organization">("teacher");
  const [externalUrl, setExternalUrl] = useState("");

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setBio(profile.bio || "");
      setMentorType(profile.mentor_type);
      setExternalUrl(profile.external_url || "");
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    updateProfile.mutate({
      userId: user.id,
      display_name: displayName,
      bio: bio || null,
      mentor_type: mentorType,
      external_url: externalUrl || null,
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mentor Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your public name"
              required
            />
          </div>

          <div>
            <Label htmlFor="mentorType">Mentor Type</Label>
            <Select value={mentorType} onValueChange={(v) => setMentorType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="coach">Coach</SelectItem>
                <SelectItem value="organization">Organization</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell learners about yourself..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="externalUrl">External Platform Link</Label>
            <Input
              id="externalUrl"
              type="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://your-courses.com"
            />
            <p className="text-xs text-muted-foreground mt-1">Link to your courses or platform (Starter/Pro tiers only)</p>
          </div>

          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
