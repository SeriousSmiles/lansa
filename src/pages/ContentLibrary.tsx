
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { getUserAnswers } from "@/services/QuestionService";
import { useEffect, useState } from "react";
import { Video, Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContentLibrary() {
  const { user } = useAuth();
  const [userAnswers, setUserAnswers] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userName = user?.email ? user.email.split('@')[0] : "Lansa User";
  
  useEffect(() => {
    async function loadContent() {
      if (!user?.id) return;
      
      const answers = await getUserAnswers(user.id);
      if (answers) {
        setUserAnswers(answers);
      }
      
      setIsLoading(false);
    }
    
    loadContent();
  }, [user]);
  
  // Sample content library filtered by user interests
  // In a real app, this would be dynamically filtered based on the user's answers
  const contentItems = [
    {
      title: "Finding Your Professional Voice",
      type: "Video",
      duration: "18 min",
      category: "Communication",
      description: "Learn how to communicate your value clearly and confidently."
    },
    {
      title: "Building an Effective LinkedIn Profile",
      type: "Video",
      duration: "22 min",
      category: "Online Presence",
      description: "Step-by-step guide to create a LinkedIn profile that gets noticed."
    },
    {
      title: "Clarity Exercise: Vision Mapping",
      type: "Workshop",
      duration: "45 min",
      category: "Clarity",
      description: "Map out your professional goals and the path to achieve them."
    },
    {
      title: "Getting Noticed in a Crowded Market",
      type: "Video",
      duration: "26 min",
      category: "Visibility",
      description: "Strategies to stand out in your industry and get recognized for your work."
    }
  ];
  
  if (isLoading) {
    return (
      <DashboardLayout userName={userName} email={user?.email || ""}>
        <div className="p-6 flex justify-center items-center h-[calc(100vh-100px)]">
          <p className="text-xl">Loading content...</p>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout userName={userName} email={user?.email || ""}>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-2">Content Library</h1>
        <p className="text-gray-500 mb-6">Recommended content based on your interests</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contentItems.map((item, index) => (
            <Card key={index}>
              <div className="relative">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <Video className="h-12 w-12 text-gray-400" />
                </div>
                <div className="absolute bottom-3 right-3 bg-white rounded-md px-2 py-1 text-xs flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {item.duration}
                </div>
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </div>
                <CardDescription>{item.type} • {item.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{item.description}</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full flex items-center justify-center gap-2">
                  <Play className="h-4 w-4" /> Watch Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
