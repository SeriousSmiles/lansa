
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface ContentBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockType: string | null;
  editingBlock?: any;
  onSave: (data: any) => void;
}

export function ContentBlockModal({ isOpen, onClose, blockType, editingBlock, onSave }: ContentBlockModalProps) {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (editingBlock) {
      setFormData({
        title: editingBlock.title || '',
        ...editingBlock.content
      });
    } else {
      // Reset form for new block
      setFormData({});
    }
  }, [editingBlock, blockType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { title, ...content } = formData;
    onSave({
      title: title || getDefaultTitle(blockType),
      content
    });
  };

  const getDefaultTitle = (type: string | null) => {
    switch (type) {
      case 'about': return 'About Me';
      case 'experience': return 'Work Experience';
      case 'education': return 'Education';
      case 'skills': return 'Skills';
      case 'contact': return 'Contact Information';
      default: return 'Section';
    }
  };

  const addSkill = () => {
    const skills = formData.skills || [];
    setFormData({
      ...formData,
      skills: [...skills, '']
    });
  };

  const updateSkill = (index: number, value: string) => {
    const skills = [...(formData.skills || [])];
    skills[index] = value;
    setFormData({
      ...formData,
      skills
    });
  };

  const removeSkill = (index: number) => {
    const skills = [...(formData.skills || [])];
    skills.splice(index, 1);
    setFormData({
      ...formData,
      skills
    });
  };

  const renderFormFields = () => {
    switch (blockType) {
      case 'about':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">About Me</Label>
              <Textarea
                id="description"
                placeholder="Tell your story..."
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
              />
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                placeholder="Company name"
                value={formData.company || ''}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                placeholder="Job title"
                value={formData.position || ''}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="month"
                  value={formData.startDate || ''}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="month"
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  placeholder="Leave empty if current"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your role and achievements..."
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
          </div>
        );

      case 'education':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                placeholder="School or university name"
                value={formData.institution || ''}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="degree">Degree</Label>
              <Input
                id="degree"
                placeholder="Degree or certification"
                value={formData.degree || ''}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="field">Field of Study</Label>
              <Input
                id="field"
                placeholder="Major or field"
                value={formData.field || ''}
                onChange={(e) => setFormData({ ...formData, field: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startYear">Start Year</Label>
                <Input
                  id="startYear"
                  type="number"
                  placeholder="2020"
                  value={formData.startYear || ''}
                  onChange={(e) => setFormData({ ...formData, startYear: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endYear">End Year</Label>
                <Input
                  id="endYear"
                  type="number"
                  placeholder="2024"
                  value={formData.endYear || ''}
                  onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Skills</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSkill}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Skill
                </Button>
              </div>
              <div className="space-y-2">
                {(formData.skills || []).map((skill: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Skill name"
                      value={skill}
                      onChange={(e) => updateSkill(index, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeSkill(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(!formData.skills || formData.skills.length === 0) && (
                  <p className="text-gray-500 text-sm">Click "Add Skill" to get started</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://yourwebsite.com"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                placeholder="https://linkedin.com/in/yourprofile"
                value={formData.linkedin || ''}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingBlock ? 'Edit' : 'Add'} {getDefaultTitle(blockType)}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Section Title (Optional)</Label>
            <Input
              id="title"
              placeholder={`Default: ${getDefaultTitle(blockType)}`}
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {renderFormFields()}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#FF6B4A] hover:bg-[#E55A3A]">
              {editingBlock ? 'Update' : 'Add'} Section
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
