/**
 * Update Form Dialog Component
 * Form for creating and editing product updates
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { adminProductUpdatesService, CreateUpdateData } from '@/services/adminProductUpdatesService';
import { ProductUpdate } from '@/services/productUpdatesService';
import { IconPicker } from './IconPicker';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X } from 'lucide-react';

const updateFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  category: z.enum(['feature', 'improvement', 'bugfix', 'announcement']),
  version: z.string().optional(),
  link_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  published_at: z.string().min(1, 'Publish date is required'),
  icon_name: z.string().optional(),
  badge_text: z.string().optional(),
  badge_color: z.string().optional(),
});

type UpdateFormData = z.infer<typeof updateFormSchema>;

interface UpdateFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  update?: ProductUpdate;
}

export function UpdateFormDialog({ open, onClose, onSuccess, update }: UpdateFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>(update?.image_url);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const form = useForm<UpdateFormData>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: {
      title: update?.title || '',
      description: update?.description || '',
      category: update?.category || 'feature',
      version: update?.version || '',
      link_url: update?.link_url || '',
      published_at: update?.published_at
        ? new Date(update.published_at).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      icon_name: update?.icon_name || 'rocket',
      badge_text: update?.badge_text || '',
      badge_color: update?.badge_color || '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(undefined);
  };

  const onSubmit = async (data: UpdateFormData) => {
    setIsSubmitting(true);
    try {
      let imageUrl = imagePreview;

      // Upload image if new file selected
      if (imageFile) {
        setIsUploadingImage(true);
        imageUrl = await adminProductUpdatesService.uploadImage(imageFile);
        setIsUploadingImage(false);
      }

      const updateData = {
        ...data,
        image_url: imageUrl,
        published_at: new Date(data.published_at).toISOString(),
      } as CreateUpdateData & { image_url?: string };

      if (update) {
        await adminProductUpdatesService.updateUpdate(update.id, updateData);
        toast({ title: 'Update edited successfully' });
      } else {
        await adminProductUpdatesService.createUpdate(updateData);
        toast({ title: 'Update created successfully' });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving update:', error);
      toast({
        title: 'Error saving update',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{update ? 'Edit Update' : 'Create New Update'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="What's new?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the update..." rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="feature">New Feature</SelectItem>
                        <SelectItem value="improvement">Improvement</SelectItem>
                        <SelectItem value="bugfix">Bug Fix</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <IconPicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="1.0.0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="published_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publish Date & Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="link_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Image (Optional)</FormLabel>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="h-24 w-24 object-cover rounded" />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent">
                      <Upload className="h-4 w-4" />
                      <span>Upload Image</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isUploadingImage}>
                {isSubmitting || isUploadingImage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isUploadingImage ? 'Uploading...' : 'Saving...'}
                  </>
                ) : update ? (
                  'Save Changes'
                ) : (
                  'Create Update'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
