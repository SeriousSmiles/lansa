import React from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { BaseCard } from './BaseCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface UploadCardProps {
  title: string;
  description: string;
  onUpload: () => void;
  state?: 'idle' | 'uploading' | 'parsing' | 'success' | 'error';
  progress?: number;
  fileName?: string;
  errorMessage?: string;
}

export function UploadCard({
  title,
  description,
  onUpload,
  state = 'idle',
  progress = 0,
  fileName,
  errorMessage
}: UploadCardProps) {
  const getStateIcon = () => {
    switch (state) {
      case 'uploading':
      case 'parsing':
        return <Loader2 className="h-6 w-6 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-success" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-destructive" />;
      default:
        return <Upload className="h-6 w-6 text-primary" />;
    }
  };

  const getStateMessage = () => {
    switch (state) {
      case 'uploading':
        return 'Uploading file...';
      case 'parsing':
        return 'Parsing with AI...';
      case 'success':
        return 'Successfully uploaded!';
      case 'error':
        return errorMessage || 'Upload failed';
      default:
        return description;
    }
  };

  const isDisabled = state === 'uploading' || state === 'parsing';

  return (
    <BaseCard 
      variant={state === 'success' ? 'highlighted' : 'default'}
      className="text-center"
    >
      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          {getStateIcon()}
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="font-urbanist font-semibold text-base text-foreground mb-2">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {getStateMessage()}
        </p>
      </div>

      {/* Progress */}
      {(state === 'uploading' || state === 'parsing') && (
        <div className="mb-4">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {fileName && `${fileName} - `}{Math.round(progress)}%
          </p>
        </div>
      )}

      {/* CTA */}
      {state === 'idle' || state === 'error' ? (
        <Button 
          onClick={onUpload}
          disabled={isDisabled}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          size="sm"
        >
          <Upload className="h-4 w-4 mr-2" />
          {state === 'error' ? 'Try Again' : 'Upload File'}
        </Button>
      ) : state === 'success' ? (
        <Button 
          variant="outline"
          className="w-full"
          size="sm"
          onClick={() => console.log('View results')}
        >
          View Results
        </Button>
      ) : null}
    </BaseCard>
  );
}