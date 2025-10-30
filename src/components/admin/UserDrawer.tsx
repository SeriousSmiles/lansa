import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { LoadingSpinner } from '@/components/loading/LoadingSpinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ColorChip } from './ColorChip';
import { getEffectiveColor, UserColor, IntentStage, INTENT_CONFIG } from '@/utils/adminColors';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UserDrawerProps {
  userId: string;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function UserDrawer({ userId, open, onClose, onUpdate }: UserDrawerProps) {
  const { toast } = useToast();
  const [selectedColor, setSelectedColor] = useState<UserColor | null>(null);
  const [selectedIntent, setSelectedIntent] = useState<IntentStage>('none');
  const [newNote, setNewNote] = useState('');

  const { data: user, isLoading } = useQuery({
    queryKey: ['admin-user', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      setSelectedColor(data?.color_admin);
      setSelectedIntent(data?.intent || 'none');
      return data;
    },
    enabled: !!userId
  });

  const { data: notes } = useQuery({
    queryKey: ['admin-notes', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('admin_notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!userId
  });

  const updateUserMutation = useMutation({
    mutationFn: async (updates: { color_admin?: UserColor | null; intent?: IntentStage }) => {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId);

      if (error) throw error;

      // Log admin action
      await supabase.rpc('log_admin_action', {
        p_action: 'update_user_attributes',
        p_target_user_id: userId,
        p_metadata: updates
      });
    },
    onSuccess: () => {
      toast({ title: 'User updated successfully' });
      onUpdate();
    },
    onError: (error) => {
      toast({ title: 'Error updating user', description: error.message, variant: 'destructive' });
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: async (note: string) => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('admin_notes')
        .insert({
          user_id: userId,
          author_id: authUser.id,
          note
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setNewNote('');
      toast({ title: 'Note added successfully' });
      onUpdate();
    }
  });

  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="overflow-y-auto w-full sm:max-w-2xl">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!user) return null;

  const effectiveColor = getEffectiveColor(user.color_admin, user.color_auto);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>User Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* User Header */}
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.profile_image || undefined} />
              <AvatarFallback className="text-lg">
                {user.name?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{user.name || 'Unnamed User'}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="mt-2">
                {effectiveColor && <ColorChip color={effectiveColor} />}
              </div>
            </div>
          </div>

          {/* Manual Controls */}
          <div className="space-y-4 border rounded-lg p-4">
            <h4 className="font-semibold">Manual Controls</h4>
            
            {/* Set Color */}
            <div className="space-y-2">
              <Label>Set Color (Admin Override)</Label>
              <RadioGroup 
                value={selectedColor || 'none'} 
                onValueChange={(value) => setSelectedColor(value === 'none' ? null : value as UserColor)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="color-none" />
                  <Label htmlFor="color-none">None (Use Auto)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="purple" id="color-purple" />
                  <Label htmlFor="color-purple">🟣 Purple - Advocate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="green" id="color-green" />
                  <Label htmlFor="color-green">🟢 Green - Engaged</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="orange" id="color-orange" />
                  <Label htmlFor="color-orange">🟠 Orange - Underused</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="red" id="color-red" />
                  <Label htmlFor="color-red">🔴 Red - Drifting</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Set Intent */}
            <div className="space-y-2">
              <Label>Set Intent</Label>
              <RadioGroup value={selectedIntent} onValueChange={(value) => setSelectedIntent(value as IntentStage)}>
                {Object.entries(INTENT_CONFIG).map(([key, config]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <RadioGroupItem value={key} id={`intent-${key}`} />
                    <Label htmlFor={`intent-${key}`}>{config.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Button 
              onClick={() => updateUserMutation.mutate({ color_admin: selectedColor, intent: selectedIntent })}
              disabled={updateUserMutation.isPending}
            >
              Save Changes
            </Button>
          </div>

          {/* Overview */}
          <div className="space-y-2 border rounded-lg p-4">
            <h4 className="font-semibold">Overview</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Certified:</span>
                <span className="ml-2 font-medium">{user.certified ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Last Active:</span>
                <span className="ml-2 font-medium">
                  {user.last_active_at ? new Date(user.last_active_at).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4 border rounded-lg p-4">
            <h4 className="font-semibold">Admin Notes</h4>
            <div className="space-y-2">
              <Textarea
                placeholder="Add a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <Button 
                onClick={() => addNoteMutation.mutate(newNote)}
                disabled={!newNote.trim() || addNoteMutation.isPending}
                size="sm"
              >
                Add Note
              </Button>
            </div>
            <div className="space-y-2 mt-4">
              {notes?.map((note) => (
                <div key={note.id} className="bg-muted p-3 rounded text-sm">
                  <p>{note.note}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(note.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
