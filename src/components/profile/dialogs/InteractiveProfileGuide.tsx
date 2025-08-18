import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send, Sparkles, User, Bot, CheckCircle, XCircle } from "lucide-react";
import type { ExperienceItem, EducationItem } from "@/hooks/profile/profileTypes";

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: {
    title?: string;
    about?: string;
    skills?: string[];
    experiences?: Array<{title: string; description: string; startYear?: number; endYear?: number | null}>;
    education?: Array<{title: string; description: string; startYear?: number; endYear?: number | null}>;
  };
  reasoning?: string;
  nextSteps?: string[];
}

interface InteractiveProfileGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userAnswers?: Record<string, any> | null;
  existingSkills: string[];
  initialTitle?: string;
  initialAbout?: string;
  // Apply handlers
  updateUserTitle: (title: string) => Promise<void>;
  updateAboutText: (text: string) => Promise<void>;
  addSkill: (skill: string) => Promise<void>;
  addExperience: (exp: ExperienceItem) => Promise<void>;
  addEducation: (edu: EducationItem) => Promise<void>;
}

export function InteractiveProfileGuide({
  open,
  onOpenChange,
  userId,
  userAnswers,
  existingSkills,
  initialTitle,
  initialAbout,
  updateUserTitle,
  updateAboutText,
  addSkill,
  addExperience,
  addEducation,
}: InteractiveProfileGuideProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !isInitialized) {
      initializeConversation();
    }
  }, [open, isInitialized]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const initializeConversation = async () => {
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('generate-interactive-profile-guidance', {
        body: {
          userId,
          conversationHistory: [],
          requestType: 'initial',
          userMessage: "Hi! I'd like help completing my professional profile. Can you analyze my current situation and guide me through improving it?"
        }
      });

      if (response.error) throw response.error;

      const { guidance } = response.data;
      const assistantMessage: ConversationMessage = {
        role: 'assistant',
        content: guidance.message,
        timestamp: new Date(),
        suggestions: guidance.suggestions,
        reasoning: guidance.reasoning,
        nextSteps: guidance.nextSteps
      };

      setMessages([assistantMessage]);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
      setMessages([{
        role: 'assistant',
        content: "Hi! I'm your AI profile guide. I'll help you create a compelling professional profile based on your background and goals. What would you like to work on first - your headline, about section, skills, or experience?",
        timestamp: new Date(),
        nextSteps: ["Choose a section to improve", "Tell me about your current situation"]
      }]);
      setIsInitialized(true);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || currentMessage.trim();
    if (!content || isLoading) return;

    const userMessage: ConversationMessage = {
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await supabase.functions.invoke('generate-interactive-profile-guidance', {
        body: {
          userId,
          conversationHistory,
          requestType: 'refine',
          userMessage: content
        }
      });

      if (response.error) throw response.error;

      const { guidance } = response.data;
      const assistantMessage: ConversationMessage = {
        role: 'assistant',
        content: guidance.message,
        timestamp: new Date(),
        suggestions: guidance.suggestions,
        reasoning: guidance.reasoning,
        nextSteps: guidance.nextSteps
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: ConversationMessage = {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Could you try rephrasing your request?",
        timestamp: new Date(),
        nextSteps: ["Try again", "Check your connection"]
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const applySuggestion = async (type: string, content: any) => {
    try {
      switch (type) {
        case 'title':
          await updateUserTitle(content);
          toast({ title: "Headline updated successfully!" });
          break;
        case 'about':
          await updateAboutText(content);
          toast({ title: "About section updated successfully!" });
          break;
        case 'skills':
          const newSkills = content.filter((skill: string) => !existingSkills.includes(skill));
          for (const skill of newSkills) {
            await addSkill(skill);
          }
          toast({ title: `Added ${newSkills.length} new skills!` });
          break;
        case 'experience':
          for (const exp of content) {
            await addExperience({
              title: exp.title,
              description: exp.description,
              startYear: exp.startYear,
              endYear: exp.endYear ?? null,
            });
          }
          toast({ title: `Added ${content.length} experience entries!` });
          break;
        case 'education':
          for (const edu of content) {
            await addEducation({
              title: edu.title,
              description: edu.description,
              startYear: edu.startYear,
              endYear: edu.endYear ?? null,
            });
          }
          toast({ title: `Added ${content.length} education entries!` });
          break;
      }
      
      // Send confirmation message
      await sendMessage(`I applied the ${type} suggestion. What's next?`);
    } catch (error) {
      console.error('Failed to apply suggestion:', error);
      toast({ title: "Failed to apply suggestion", variant: "destructive" });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    "Help me write a better headline",
    "Improve my about section", 
    "Suggest relevant skills",
    "I need alternatives to this suggestion",
    "What should I focus on next?"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">AI Profile Guide</DialogTitle>
              <p className="text-sm text-muted-foreground">Interactive assistance for your professional profile</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
                    <Card className={`${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/50'}`}>
                      <CardContent className="p-3">
                        <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                        
                        {message.suggestions && (
                          <div className="mt-4 space-y-3">
                            {message.suggestions.title && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-xs uppercase tracking-wide opacity-75">Headline Suggestion</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => applySuggestion('title', message.suggestions?.title)}
                                    className="h-6 px-2 text-xs"
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Apply
                                  </Button>
                                </div>
                                <div className="p-2 bg-background/50 rounded text-sm">
                                  {message.suggestions.title}
                                </div>
                              </div>
                            )}

                            {message.suggestions.about && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-xs uppercase tracking-wide opacity-75">About Section</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => applySuggestion('about', message.suggestions?.about)}
                                    className="h-6 px-2 text-xs"
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Apply
                                  </Button>
                                </div>
                                <div className="p-2 bg-background/50 rounded text-sm">
                                  {message.suggestions.about}
                                </div>
                              </div>
                            )}

                            {message.suggestions.skills && message.suggestions.skills.length > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-xs uppercase tracking-wide opacity-75">Skills</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => applySuggestion('skills', message.suggestions?.skills)}
                                    className="h-6 px-2 text-xs"
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Add All
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {message.suggestions.skills.map((skill, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {message.reasoning && (
                          <div className="mt-3 p-2 bg-background/30 rounded border-l-2 border-primary/30">
                            <p className="text-xs text-muted-foreground">{message.reasoning}</p>
                          </div>
                        )}

                        {message.nextSteps && message.nextSteps.length > 0 && (
                          <div className="mt-3 space-y-1">
                            <span className="text-xs font-medium opacity-75">Next Steps:</span>
                            {message.nextSteps.map((step, i) => (
                              <div key={i} className="text-xs opacity-75">• {step}</div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <Card className="bg-muted/50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.1s]" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="text-sm text-muted-foreground ml-2">AI is thinking...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>

          <Separator />

          <div className="p-4 space-y-3">
            {messages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant="outline"
                    onClick={() => sendMessage(action)}
                    disabled={isLoading}
                    className="text-xs h-7"
                  >
                    {action}
                  </Button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your profile..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={() => sendMessage()}
                disabled={isLoading || !currentMessage.trim()}
                size="sm"
                className="px-3"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}