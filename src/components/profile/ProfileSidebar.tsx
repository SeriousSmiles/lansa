
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Phone, Star, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ProfileSidebarProps {
  userName: string;
  role: string;
  email: string;
  skills: string[];
  goal: string;
  onUpdate?: (field: string, value: string) => Promise<void>;
  onUpdateUserName?: (name: string) => Promise<void>;
}

export function ProfileSidebar({ 
  userName, 
  role, 
  email, 
  skills, 
  goal,
  onUpdate,
  onUpdateUserName
}: ProfileSidebarProps) {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editedGoal, setEditedGoal] = useState(goal);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(userName);
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

  return (
    <div className="lg:col-span-4 space-y-8">
      <Card className="overflow-hidden">
        <div className="bg-[#FF6B4A] h-24"></div>
        <div className="p-6 pt-0 -mt-12 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-[#FF6B4A] border-4 border-white flex items-center justify-center text-white text-4xl font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          
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
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-[#FF6B4A] mr-3" />
              <span>Available on request</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Skills */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-bold flex items-center mb-4">
            <Star className="h-5 w-5 text-[#FF6B4A] mr-2" />
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <div key={index} className="bg-[#FFF4EE] text-[#FF6B4A] px-3 py-1 rounded-full">
                {skill}
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
