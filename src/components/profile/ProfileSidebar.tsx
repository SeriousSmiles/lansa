
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Phone, Star, Pencil, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface ProfileSidebarProps {
  userName: string;
  role: string;
  email: string;
  skills: string[];
  goal: string;
  phoneNumber?: string;
  coverColor?: string;
  profileImage?: string;
  onUpdate?: (field: string, value: string) => Promise<void>;
  onUpdateUserName?: (name: string) => Promise<void>;
  onUpdatePhoneNumber?: (phone: string) => Promise<void>;
  onAddSkill?: (skill: string) => Promise<void>;
  onRemoveSkill?: (skill: string) => Promise<void>;
  onUploadProfileImage?: (file: File) => Promise<string>;
}

export function ProfileSidebar({ 
  userName, 
  role, 
  email, 
  skills, 
  goal,
  phoneNumber,
  coverColor,
  profileImage,
  onUpdate,
  onUpdateUserName,
  onUpdatePhoneNumber,
  onAddSkill,
  onRemoveSkill,
  onUploadProfileImage,
}: ProfileSidebarProps) {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editedGoal, setEditedGoal] = useState(goal);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(userName);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [editedPhone, setEditedPhone] = useState(phoneNumber || "");
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { toast } = useToast();

  const handleSaveGoal = async () => {
    if (onUpdate) {
      try {
        await onUpdate("question3", editedGoal);
        toast({
          title: "Changes saved",
          description: "Your professional goal has been updated.",
        });
        setIsEditingGoal(false);
      } catch (error) {
        toast({
          title: "Error saving changes",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveName = async () => {
    if (onUpdateUserName) {
      try {
        await onUpdateUserName(editedName);
        toast({
          title: "Changes saved",
          description: "Your name has been updated.",
        });
        setIsEditingName(false);
      } catch (error) {
        toast({
          title: "Error saving changes",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSavePhone = async () => {
    if (onUpdatePhoneNumber) {
      try {
        await onUpdatePhoneNumber(editedPhone);
        toast({
          title: "Changes saved",
          description: "Your phone number has been updated.",
        });
        setIsEditingPhone(false);
      } catch (error) {
        toast({
          title: "Error saving changes",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddSkill = async () => {
    if (onAddSkill && newSkill.trim()) {
      try {
        await onAddSkill(newSkill.trim());
        setNewSkill("");
        setIsAddingSkill(false);
        toast({
          title: "Skill added",
          description: "Your new skill has been added to your profile.",
        });
      } catch (error) {
        toast({
          title: "Error adding skill",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    }
  };

  const handleRemoveSkill = async (skill: string) => {
    if (onRemoveSkill) {
      try {
        await onRemoveSkill(skill);
        toast({
          title: "Skill removed",
          description: "The skill has been removed from your profile.",
        });
      } catch (error) {
        toast({
          title: "Error removing skill",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    }
  };

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onUploadProfileImage && event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      try {
        await onUploadProfileImage(file);
        toast({
          title: "Image uploaded",
          description: "Your profile image has been updated.",
        });
        setIsUploadingImage(false);
      } catch (error) {
        toast({
          title: "Error uploading image",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="lg:col-span-4 space-y-8">
      <Card className="overflow-hidden">
        <div 
          className="h-24" 
          style={{ backgroundColor: coverColor || "#FF6B4A" }}
        ></div>
        <div className="p-6 pt-0 -mt-12 flex flex-col items-center">
          <div className="relative group">
            {profileImage ? (
              <Avatar className="w-24 h-24 border-4 border-white">
                <AvatarImage src={profileImage} alt={userName} />
                <AvatarFallback className="bg-[#FF6B4A] text-white text-4xl font-bold">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#FF6B4A] border-4 border-white flex items-center justify-center text-white text-4xl font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            
            {onUploadProfileImage && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute bottom-0 right-0 h-8 w-8 p-0 bg-white shadow rounded-full" 
                onClick={() => setIsUploadingImage(true)}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Change profile image</span>
              </Button>
            )}
          </div>
          
          <Dialog open={isUploadingImage} onOpenChange={setIsUploadingImage}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Profile Image</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="picture">Choose a profile picture</Label>
                  <Input
                    id="picture"
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadingImage(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {isEditingName && onUpdateUserName ? (
            <div className="mt-4 w-full">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Your name"
                className="text-center"
              />
              <div className="flex space-x-2 mt-2 justify-center">
                <Button onClick={handleSaveName} size="sm" className="w-20">Save</Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setEditedName(userName);
                    setIsEditingName(false);
                  }}
                  className="w-20"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative mt-4 group">
              <h1 className="text-2xl font-bold text-center">{userName}</h1>
              {onUpdateUserName && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute -right-8 top-0 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity" 
                  onClick={() => setIsEditingName(true)}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit name</span>
                </Button>
              )}
            </div>
          )}
          
          <p className="text-[#FF6B4A] font-medium text-center">{role}</p>
          
          <div className="w-full mt-6 space-y-4">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-[#FF6B4A] mr-3" />
              <span>{email || 'email@example.com'}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-[#FF6B4A] mr-3" />
              <span>Remote / Worldwide</span>
            </div>
            <div className="flex items-center group relative">
              <Phone className="h-5 w-5 text-[#FF6B4A] mr-3" />
              {isEditingPhone ? (
                <div className="flex-1">
                  <Input
                    value={editedPhone}
                    onChange={(e) => setEditedPhone(e.target.value)}
                    placeholder="Your phone number"
                    className="text-sm h-8"
                  />
                  <div className="flex space-x-2 mt-2">
                    <Button onClick={handleSavePhone} size="sm" className="h-7 text-xs">Save</Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setEditedPhone(phoneNumber || "");
                        setIsEditingPhone(false);
                      }}
                      className="h-7 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <span>{phoneNumber || 'Add your phone number'}</span>
                  {onUpdatePhoneNumber && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" 
                      onClick={() => setIsEditingPhone(true)}
                    >
                      <Pencil className="h-3 w-3" />
                      <span className="sr-only">Edit phone</span>
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Skills */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <Star className="h-5 w-5 text-[#FF6B4A] mr-2" />
              Skills
            </h2>
            {onAddSkill && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => setIsAddingSkill(true)}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add skill</span>
              </Button>
            )}
          </div>

          {isAddingSkill && (
            <div className="mb-4">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Enter a skill"
                className="mb-2"
              />
              <div className="flex space-x-2">
                <Button onClick={handleAddSkill} size="sm">Add</Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setNewSkill("");
                    setIsAddingSkill(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <div 
                key={index} 
                className="bg-[#FFF4EE] text-[#FF6B4A] px-3 py-1 rounded-full flex items-center group"
              >
                {skill}
                {onRemoveSkill && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveSkill(skill)}
                  >
                    <Trash className="h-3 w-3" />
                    <span className="sr-only">Remove {skill}</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Goals */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <Star className="h-5 w-5 text-[#FF6B4A] mr-2" />
              Professional Goal
            </h2>
            {onUpdate && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => setIsEditingGoal(!isEditingGoal)}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
            )}
          </div>
          
          {isEditingGoal ? (
            <div className="space-y-4">
              <Input 
                value={editedGoal} 
                onChange={(e) => setEditedGoal(e.target.value)}
                placeholder="Your professional goal..."
              />
              <div className="flex space-x-2">
                <Button onClick={handleSaveGoal} size="sm">Save</Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setEditedGoal(goal);
                    setIsEditingGoal(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-lg">{goal}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
