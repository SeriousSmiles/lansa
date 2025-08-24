import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, BookOpen, Heart, Target, Zap } from 'lucide-react';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState<string>('');

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

  const generateStory = async () => {
    setIsGenerating(true);
    // TODO: Implement AI story generation
    setTimeout(() => {
      setGeneratedStory(`Based on your responses, here's your authentic origin story:

Your journey began ${responses.origin || '[when you first discovered your passion]'}, sparked by ${responses.motivation || '[what truly drives you]'}. 

The pivotal moment came ${responses.pivotal || '[when you realized you wanted more]'}, which shaped your determination to ${responses.vision || '[achieve your vision]'}.

This story reflects your authentic professional identity and the unique path that brought you to where you are today.`);
      setIsGenerating(false);
    }, 2000);
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
              <BookOpen className="h-5 w-5 text-primary" />
              Your Authentic Origin Story
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/30 p-6 rounded-lg">
              <p className="whitespace-pre-line text-foreground leading-relaxed">
                {generatedStory}
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  setGeneratedStory('');
                  setCurrentStep(0);
                  setResponses({});
                }}
                variant="outline"
              >
                Start Over
              </Button>
              <Button onClick={() => navigator.clipboard.writeText(generatedStory)}>
                Copy Story
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Story Builder</h2>
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {storySteps.length}
          </span>
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
            onClick={generateStory}
            disabled={!isComplete || isGenerating}
            className="flex items-center gap-2"
          >
            {isGenerating ? 'Generating...' : 'Generate Story'}
            <BookOpen className="h-4 w-4" />
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