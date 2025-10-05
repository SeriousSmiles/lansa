import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PrivacySettingsProps {
  userId?: string;
  highlightColor?: string;
}

interface PrivacyPreferences {
  show_email: boolean;
  show_phone: boolean;
}

export function PrivacySettings({ userId, highlightColor = "#FF6B4A" }: PrivacySettingsProps) {
  const [settings, setSettings] = useState<PrivacyPreferences>({
    show_email: false,
    show_phone: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load current privacy settings
  useEffect(() => {
    if (!userId) return;
    
    const loadSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('privacy_settings')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data?.privacy_settings) {
          const prefs = data.privacy_settings as any;
          setSettings({
            show_email: prefs.show_email || false,
            show_phone: prefs.show_phone || false,
          });
        }
      } catch (error) {
        console.error('Error loading privacy settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [userId]);

  const handleSave = async () => {
    if (!userId) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ privacy_settings: settings as any })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      toast({
        title: "Privacy settings updated",
        description: "Your contact information visibility has been updated.",
      });
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: "Error updating settings",
        description: "There was an error updating your privacy settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading privacy settings...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" style={{ color: highlightColor }} />
          <CardTitle>Privacy Settings</CardTitle>
        </div>
        <CardDescription>
          Control what contact information is visible on your public profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Visibility */}
        <div className="flex items-center justify-between space-x-4 p-4 border rounded-lg">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              {settings.show_email ? (
                <Eye className="h-4 w-4" style={{ color: highlightColor }} />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              <Label htmlFor="show-email" className="font-medium">
                Show Email on Public Profile
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              When enabled, your email will be visible to anyone viewing your public profile
            </p>
          </div>
          <Switch
            id="show-email"
            checked={settings.show_email}
            onCheckedChange={(checked) => 
              setSettings(prev => ({ ...prev, show_email: checked }))
            }
            style={{
              backgroundColor: settings.show_email ? highlightColor : undefined
            }}
          />
        </div>

        {/* Phone Visibility */}
        <div className="flex items-center justify-between space-x-4 p-4 border rounded-lg">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              {settings.show_phone ? (
                <Eye className="h-4 w-4" style={{ color: highlightColor }} />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              <Label htmlFor="show-phone" className="font-medium">
                Show Phone Number on Public Profile
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              When enabled, your phone number will be visible to anyone viewing your public profile
            </p>
          </div>
          <Switch
            id="show-phone"
            checked={settings.show_phone}
            onCheckedChange={(checked) => 
              setSettings(prev => ({ ...prev, show_phone: checked }))
            }
            style={{
              backgroundColor: settings.show_phone ? highlightColor : undefined
            }}
          />
        </div>

        {/* Preview */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Preview</h4>
          <p className="text-sm text-muted-foreground">
            {settings.show_email || settings.show_phone ? (
              <>
                Visitors will see: {' '}
                {settings.show_email && 'Email'}
                {settings.show_email && settings.show_phone && ' and '}
                {settings.show_phone && 'Phone Number'}
              </>
            ) : (
              'No contact information will be displayed on your public profile'
            )}
          </p>
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full"
          style={{ backgroundColor: highlightColor }}
        >
          {isSaving ? 'Saving...' : 'Save Privacy Settings'}
        </Button>
      </CardContent>
    </Card>
  );
}
