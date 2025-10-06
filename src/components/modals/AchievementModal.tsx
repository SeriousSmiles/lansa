import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Trophy, Medal, Star, Briefcase, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { AchievementItem } from '@/hooks/profile/profileTypes';

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAchievement?: (achievement: AchievementItem) => Promise<void>;
  achievement?: AchievementItem;
  onEditAchievement?: (id: string, achievement: AchievementItem) => Promise<void>;
}

const achievementTypes = [
  { value: 'certification', label: 'Certification', icon: Medal, color: 'text-blue-500 bg-blue-500/10' },
  { value: 'award', label: 'Award', icon: Trophy, color: 'text-yellow-500 bg-yellow-500/10' },
  { value: 'project', label: 'Project Milestone', icon: Star, color: 'text-green-500 bg-green-500/10' },
  { value: 'skill', label: 'Skill Achievement', icon: Award, color: 'text-purple-500 bg-purple-500/10' },
  { value: 'work', label: 'Work Achievement', icon: Briefcase, color: 'text-orange-500 bg-orange-500/10' },
  { value: 'education', label: 'Educational Achievement', icon: GraduationCap, color: 'text-indigo-500 bg-indigo-500/10' }
];

export function AchievementModal({ isOpen, onClose, onAddAchievement, achievement: editAchievement, onEditAchievement }: AchievementModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!editAchievement;
  
  const [formData, setFormData] = useState({
    type: editAchievement?.type || '' as 'certification' | 'award' | 'project' | 'skill' | 'work' | 'education' | '',
    title: editAchievement?.title || '',
    description: editAchievement?.description || '',
    dateAchieved: editAchievement?.dateAchieved || '',
    organization: editAchievement?.organization || '',
    credentialId: editAchievement?.credentialId || '',
    credentialUrl: editAchievement?.credentialUrl || ''
  });

  // Reset form when modal opens with different data
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        type: editAchievement?.type || '' as 'certification' | 'award' | 'project' | 'skill' | 'work' | 'education' | '',
        title: editAchievement?.title || '',
        description: editAchievement?.description || '',
        dateAchieved: editAchievement?.dateAchieved || '',
        organization: editAchievement?.organization || '',
        credentialId: editAchievement?.credentialId || '',
        credentialUrl: editAchievement?.credentialUrl || ''
      });
    }
  }, [isOpen, editAchievement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type || !formData.title || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const achievementData: AchievementItem = {
        type: formData.type as 'certification' | 'award' | 'project' | 'skill' | 'work' | 'education',
        title: formData.title,
        description: formData.description,
        dateAchieved: formData.dateAchieved || undefined,
        organization: formData.organization || undefined,
        credentialId: formData.credentialId || undefined,
        credentialUrl: formData.credentialUrl || undefined,
        isFeatured: editAchievement?.isFeatured || false,
        displayOrder: editAchievement?.displayOrder || 0
      };

      if (isEditing && editAchievement?.id && onEditAchievement) {
        await onEditAchievement(editAchievement.id, achievementData);
        toast.success("Achievement updated successfully!");
      } else if (onAddAchievement) {
        await onAddAchievement(achievementData);
        toast.success("Achievement added to your profile!");
      }
      
      // Reset form
      setFormData({
        type: '' as 'certification' | 'award' | 'project' | 'skill' | 'work' | 'education' | '',
        title: '',
        description: '',
        dateAchieved: '',
        organization: '',
        credentialId: '',
        credentialUrl: ''
      });
      
      onClose();
    } catch (error) {
      console.error("Error saving achievement:", error);
      toast.error("Failed to save achievement. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = achievementTypes.find(type => type.value === formData.type);

  return (
    <>
      {isOpen &&
        createPortal(
          <AnimatePresence>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[209]"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[210] flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-card rounded-3xl p-6 w-full max-w-lg mx-auto shadow-xl max-h-[90vh] overflow-y-auto pointer-events-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl ${selectedType?.color || 'bg-yellow-500/10'} flex items-center justify-center`}>
                      {selectedType ? (
                        <selectedType.icon className="h-5 w-5" />
                      ) : (
                        <Award className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-lg font-urbanist font-semibold">
                        {isEditing ? 'Edit Achievement' : 'Add Achievement'}
                      </h2>
                      <p className="text-sm text-muted-foreground">Showcase your accomplishments</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="type">Achievement Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select achievement type" />
                      </SelectTrigger>
                      <SelectContent>
                        {achievementTypes.map((type) => {
                          const Icon = type.icon;
                          return (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {type.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="title">Achievement Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., AWS Certified Developer, Employee of the Month"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your achievement and its impact..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dateAchieved">Date Achieved</Label>
                      <Input
                        id="dateAchieved"
                        type="date"
                        value={formData.dateAchieved}
                        onChange={(e) => setFormData(prev => ({ ...prev, dateAchieved: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="organization">Organization</Label>
                      <Input
                        id="organization"
                        value={formData.organization || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                        placeholder="e.g., Amazon, Google, University"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="credentialId">Credential ID (Optional)</Label>
                    <Input
                      id="credentialId"
                      value={formData.credentialId || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, credentialId: e.target.value }))}
                      placeholder="Certificate or credential number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="credentialUrl">Credential URL (Optional)</Label>
                    <Input
                      id="credentialUrl"
                      value={formData.credentialUrl || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, credentialUrl: e.target.value }))}
                      placeholder="https://example.com/credential"
                      type="url"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      {isSubmitting ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Achievement' : 'Add Achievement')}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}