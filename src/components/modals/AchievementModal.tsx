import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Trophy, Medal, Star, Briefcase, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface AchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Achievement {
  type: string;
  title: string;
  description: string;
  dateAchieved: string;
  organization?: string;
  credentialId?: string;
}

const achievementTypes = [
  { value: 'certification', label: 'Certification', icon: Medal, color: 'text-blue-500 bg-blue-500/10' },
  { value: 'award', label: 'Award', icon: Trophy, color: 'text-yellow-500 bg-yellow-500/10' },
  { value: 'project', label: 'Project Milestone', icon: Star, color: 'text-green-500 bg-green-500/10' },
  { value: 'skill', label: 'Skill Achievement', icon: Award, color: 'text-purple-500 bg-purple-500/10' },
  { value: 'work', label: 'Work Achievement', icon: Briefcase, color: 'text-orange-500 bg-orange-500/10' },
  { value: 'education', label: 'Educational Achievement', icon: GraduationCap, color: 'text-indigo-500 bg-indigo-500/10' }
];

export function AchievementModal({ isOpen, onClose }: AchievementModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [achievement, setAchievement] = useState<Achievement>({
    type: '',
    title: '',
    description: '',
    dateAchieved: '',
    organization: '',
    credentialId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!achievement.type || !achievement.title || !achievement.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Here you would save the achievement to the user's profile
      // For now, we'll just simulate a successful save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Achievement added to your profile!",
      });
      
      // Reset form
      setAchievement({
        type: '',
        title: '',
        description: '',
        dateAchieved: '',
        organization: '',
        credentialId: ''
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add achievement",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = achievementTypes.find(type => type.value === achievement.type);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-modal"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-modal flex items-center justify-center p-4"
          >
            <div className="bg-card rounded-3xl p-6 w-full max-w-lg mx-auto shadow-xl max-h-[90vh] overflow-y-auto">
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
                    <h2 className="text-lg font-urbanist font-semibold">Add Achievement</h2>
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
                  <Select value={achievement.type} onValueChange={(value) => setAchievement(prev => ({ ...prev, type: value }))}>
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
                    value={achievement.title}
                    onChange={(e) => setAchievement(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., AWS Certified Developer, Employee of the Month"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={achievement.description}
                    onChange={(e) => setAchievement(prev => ({ ...prev, description: e.target.value }))}
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
                      value={achievement.dateAchieved}
                      onChange={(e) => setAchievement(prev => ({ ...prev, dateAchieved: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="organization">Organization</Label>
                    <Input
                      id="organization"
                      value={achievement.organization}
                      onChange={(e) => setAchievement(prev => ({ ...prev, organization: e.target.value }))}
                      placeholder="e.g., Amazon, Google, University"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="credentialId">Credential ID (Optional)</Label>
                  <Input
                    id="credentialId"
                    value={achievement.credentialId}
                    onChange={(e) => setAchievement(prev => ({ ...prev, credentialId: e.target.value }))}
                    placeholder="Certificate or credential number"
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
                    {isSubmitting ? 'Adding...' : 'Add Achievement'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}