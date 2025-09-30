import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Download,
  RotateCcw,
  Eye,
  Trash2
} from 'lucide-react';
import { CVDataService } from '@/services/cvDataService';
import { formatDistanceToNow } from 'date-fns';

interface CVUploadHistoryProps {
  userId?: string;
  onBack: () => void;
  onReuse: (data: any) => void;
}

interface UploadRecord {
  id: string;
  original_filename: string;
  processing_status: string;
  created_at: string;
  extracted_data: any;
  confidence_scores: any;
  sections_found: string[];
  file_size: number;
  error_message?: string;
}

export function CVUploadHistory({ userId, onBack, onReuse }: CVUploadHistoryProps) {
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUploadHistory();
  }, [userId]);

  const loadUploadHistory = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const history = await CVDataService.getUserResumes(userId);
      setUploads(history);
    } catch (err: any) {
      console.error('Error loading upload history:', err);
      setError(err.message || 'Failed to load upload history');
    } finally {
      setLoading(false);
    }
  };

  const handleReuseData = (upload: UploadRecord) => {
    if (!upload.extracted_data) {
      return;
    }

    // Transform the upload data back to the expected format
    const analysisData = {
      extractedData: upload.extracted_data,
      suggestions: {
        skillMatches: [],
        gapAnalysis: [],
        improvements: [],
        confidence: upload.confidence_scores?.overall || 75
      },
      metadata: {
        originalFileName: upload.original_filename,
        uploadedAt: upload.created_at,
        extractionConfidence: upload.confidence_scores?.extraction || 75,
        sectionsFound: upload.sections_found || []
      }
    };

    onReuse(analysisData);
  };

  const getStatusBadge = (status: string, hasError: boolean) => {
    if (hasError) {
      return <Badge variant="destructive" className="text-xs">Failed</Badge>;
    }
    
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800 text-xs">Completed</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="text-xs">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="text-xs">Failed</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getDataQuality = (upload: UploadRecord) => {
    if (!upload.extracted_data) return null;
    
    const skillsCount = upload.extracted_data.skills?.length || 0;
    const experienceCount = upload.extracted_data.experience?.length || 0;
    const educationCount = upload.extracted_data.education?.length || 0;
    
    return { skillsCount, experienceCount, educationCount };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Upload
          </Button>
          <h3 className="text-lg font-semibold">Upload History</h3>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Upload
          </Button>
          <h3 className="text-lg font-semibold">Upload History</h3>
        </div>
        
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Upload
          </Button>
          <div>
            <h3 className="text-lg font-semibold">Upload History</h3>
            <p className="text-sm text-muted-foreground">
              {uploads.length} CV{uploads.length !== 1 ? 's' : ''} uploaded
            </p>
          </div>
        </div>
      </div>

      {/* Upload List */}
      {uploads.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="text-lg font-medium mb-2">No uploads yet</h4>
            <p className="text-muted-foreground mb-4">
              Upload your first CV to get started building your profile
            </p>
            <Button onClick={onBack}>
              Upload Your First CV
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {uploads.map((upload) => {
            const dataQuality = getDataQuality(upload);
            const hasUsableData = upload.processing_status === 'completed' && dataQuality;
            const hasError = upload.error_message || upload.processing_status === 'failed';
            
            return (
              <Card key={upload.id} className="transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base flex items-center gap-2">
                          {upload.original_filename}
                          {getStatusBadge(upload.processing_status, hasError)}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDistanceToNow(new Date(upload.created_at), { addSuffix: true })}
                          </span>
                          <span>{formatFileSize(upload.file_size)}</span>
                          {upload.sections_found && Array.isArray(upload.sections_found) && upload.sections_found.length > 0 && (
                            <span>{upload.sections_found.length} sections found</span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {hasUsableData && (
                        <Button
                          size="sm"
                          onClick={() => handleReuseData(upload)}
                          className="text-xs"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Use This Data
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                {(hasUsableData || hasError) && (
                  <CardContent className="pt-0">
                    {hasError ? (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800 text-sm">
                          {upload.error_message || 'Processing failed'}
                        </AlertDescription>
                      </Alert>
                    ) : hasUsableData && dataQuality ? (
                      <div className="space-y-3">
                        {/* Data Summary */}
                        <div className="flex gap-4 text-sm">
                          {dataQuality.skillsCount > 0 && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span>{dataQuality.skillsCount} skills</span>
                            </div>
                          )}
                          {dataQuality.experienceCount > 0 && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span>{dataQuality.experienceCount} experiences</span>
                            </div>
                          )}
                          {dataQuality.educationCount > 0 && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span>{dataQuality.educationCount} education</span>
                            </div>
                          )}
                        </div>

                        {/* Confidence Score */}
                        {upload.confidence_scores?.overall && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Quality:</span>
                            <Badge variant="outline" className="text-xs">
                              {Math.round(upload.confidence_scores.overall)}% confidence
                            </Badge>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex justify-center pt-4 border-t">
        <Button variant="outline" onClick={onBack}>
          Upload New CV
        </Button>
      </div>
    </div>
  );
}