import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, BookOpen, Heart, Target, Zap, Sparkles, Copy, Save } from 'lucide-react';
import { useStoryBuilder, type StoryResponses, type StoryGenerationOptions } from '@/hooks/useStoryBuilder';
import { useToast } from '@/hooks/use-toast';
import { trackUserAction } from '@/services/actionTracking';

interface StoryStep {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  prompt: string;
  placeholder: string;
}

const storySteps: StoryStep[] = [
  {
    id: 'origin',
    title: 'Your Origin',
    icon: BookOpen,
    description: 'Where did your professional journey begin?',
    prompt: 'Tell us about the moment or experience that first sparked your interest in your field. What drew you in?',
    placeholder: 'I first became interested in... when I...'
  },
  {
    id: 'motivation',
    title: 'Deep Motivation',
    icon: Heart,
    description: 'What truly drives you?',
    prompt: 'Beyond the surface, what deeply motivates you in your work? What impact do you want to make?',
    placeholder: 'What really drives me is...'
  },
  {
    id: 'pivotal',
    title: 'Pivotal Moment',
    icon: Zap,
    description: 'When did you realize you wanted more?',
    prompt: 'Describe a specific moment when you realized you wanted to push further, achieve more, or make a bigger impact.',
    placeholder: 'The moment I realized I wanted more was...'
  },
  {
    id: 'vision',
    title: 'Your Vision',
    icon: Target,
    description: 'Where are you heading?',
    prompt: 'Paint a picture of the professional future you\'re working toward. What does success look like for you?',
    placeholder: 'My vision for the future is...'
  }
];

export function StoryBuilderFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [generatedStory, setGeneratedStory] = useState<string>('');
  const [formatType, setFormatType] = useState<'origin' | 'elevator_pitch' | 'bio' | 'interview'>('origin');
  const [tone, setTone] = useState<'professional' | 'conversational' | 'creative'>('professional');
  
  const { generateStory, isGenerating, stories, fetchStories } = useStoryBuilder();
  const { toast } = useToast();

  const handleResponseChange = (stepId: string, value: string) => {
    setResponses(prev => ({ ...prev, [stepId]: value }));
  };

  const nextStep = () => {
    if (currentStep < storySteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleGenerateStory = async () => {
    try {
      const storyResponses: StoryResponses = {
        origin: responses.origin,
        motivation: responses.motivation,
        pivotal: responses.pivotal,
        vision: responses.vision
      };

      const options: StoryGenerationOptions = {
        formatType,
        tone
      };

      const result = await generateStory(storyResponses, options);
      setGeneratedStory(result.story);
    } catch (error) {
      console.error('Failed to generate story:', error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedStory);
      toast({
        title: "Copied to Clipboard",
        description: "Your story has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed", 
        description: "Unable to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const currentStepData = storySteps[currentStep];
  const progress = ((currentStep + 1) / storySteps.length) * 100;
  const isComplete = Object.keys(responses).length === storySteps.length;

  if (generatedStory) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Your AI-Crafted Story
              <Badge variant="secondary" className="ml-2">
                by Maya
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Format: {formatType.replace('_', ' ').toUpperCase()}</span>
              <span>•</span>
              <span>Tone: {tone.charAt(0).toUpperCase() + tone.slice(1)}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-br from-background to-muted/30 p-6 rounded-lg border">
              <p className="whitespace-pre-line text-foreground leading-relaxed text-base">
                {generatedStory}
              </p>
            </div>
            
            {/* Story Format Options */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Generate in different formats:</h4>
              <div className="flex gap-2 flex-wrap">
                {['origin', 'elevator_pitch', 'bio', 'interview'].map((format) => (
                  <Button
                    key={format}
                    variant={formatType === format ? "primary" : "outline"}
                    size="sm"
                    onClick={() => {
                      setFormatType(format as any);
                      // Auto-regenerate in new format
                      handleGenerateStory();
                    }}
                    disabled={isGenerating}
                  >
                    {format.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button 
                onClick={() => {
                  setGeneratedStory('');
                  setCurrentStep(0);
                  setResponses({});
                }}
                variant="outline"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Start Over
              </Button>
              <Button onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Story
              </Button>
              <Button variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save to Profile
              </Button>
            </div>

            {/* Coach Note */}
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
              <p className="text-sm text-primary/80">
                <strong>Maya's Note:</strong> This story has been crafted to highlight your authentic journey and professional growth. 
                Feel free to adjust the tone or format to match different contexts and audiences.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with AI Coach Branding */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              AI Story Builder
            </h2>
            <p className="text-muted-foreground mt-1">
              Craft your authentic professional story with Maya, your personal branding coach
            </p>
          </div>
          <Badge variant="outline" className="text-primary border-primary/20">
            Step {currentStep + 1} of {storySteps.length}
          </Badge>
        </div>
        
        {/* Story Format & Tone Selection */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Story Format</label>
            <Select value={formatType} onValueChange={(value: any) => setFormatType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="origin">Origin Story (Full narrative)</SelectItem>
                <SelectItem value="elevator_pitch">Elevator Pitch (30 seconds)</SelectItem>
                <SelectItem value="bio">Professional Bio (LinkedIn/Resume)</SelectItem>
                <SelectItem value="interview">Interview Story (Tell me about yourself)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Tone</label>
            <Select value={tone} onValueChange={(value: any) => setTone(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="conversational">Conversational</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Progress value={progress} className="h-2" />
      </div>

      {/* Current Step */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <currentStepData.icon className="h-6 w-6 text-primary" />
            </div>
            {currentStepData.title}
          </CardTitle>
          <p className="text-muted-foreground">{currentStepData.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {currentStepData.prompt}
            </label>
            <Textarea
              placeholder={currentStepData.placeholder}
              value={responses[currentStepData.id] || ''}
              onChange={(e) => handleResponseChange(currentStepData.id, e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {storySteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index <= currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {currentStep === storySteps.length - 1 ? (
          <Button 
            onClick={handleGenerateStory}
            disabled={!isComplete || isGenerating}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin" />
                Maya is crafting your story...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate AI Story
              </>
            )}
          </Button>
        ) : (
          <Button 
            onClick={nextStep}
            disabled={!responses[currentStepData.id]?.trim()}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Progress Overview */}
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Your Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {storySteps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = responses[step.id]?.trim();
            const isCurrent = index === currentStep;
            
            return (
              <Card 
                key={step.id}
                className={`transition-all cursor-pointer ${
                  isCurrent ? 'ring-2 ring-primary' : ''
                } ${isCompleted ? 'bg-primary/5' : ''}`}
                onClick={() => setCurrentStep(index)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-sm">{step.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isCompleted ? '✓ Complete' : 'Pending'}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}