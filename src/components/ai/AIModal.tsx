import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: string;
  data: string;
  onEnhance: (suggestion: string) => void;
  aiResult: {
    suggested_rewrite: string;
    reasoning: string;
    score: {
      clarity: number;
      confidence: number;
      specificity: number;
      professional_impression: number;
    };
  } | null;
  isLoading?: boolean;
}

export function AIModal({ 
  isOpen, 
  onClose, 
  section, 
  data, 
  onEnhance, 
  aiResult,
  isLoading = false
}: AIModalProps) {
  const handleApply = () => {
    if (aiResult?.suggested_rewrite) {
      onEnhance(aiResult.suggested_rewrite);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl p-6 shadow-2xl border border-border"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">AI Enhancement: {section}</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Original Content */}
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2 text-muted-foreground">Current Content</h4>
              <div className="bg-muted p-4 rounded-lg text-sm max-h-32 overflow-y-auto">
                <p className="whitespace-pre-wrap">{data}</p>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                <Sparkles className="w-6 h-6 animate-pulse mx-auto mb-2" />
                Generating AI feedback...
              </div>
            ) : aiResult ? (
              <div className="space-y-4">
                {/* AI Reasoning */}
                <div>
                  <h4 className="text-sm font-medium mb-2">AI Analysis</h4>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    {aiResult.reasoning}
                  </p>
                </div>

                {/* AI Suggestion */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Suggested Improvement</h4>
                  <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-lg text-sm max-h-40 overflow-y-auto">
                    <p className="whitespace-pre-wrap">{aiResult.suggested_rewrite}</p>
                  </div>
                </div>

                {/* Score Visualization */}
                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-3">Quality Scores</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Clarity</span>
                        <span className="font-medium">{aiResult.score.clarity}/10</span>
                      </div>
                      <Progress 
                        value={aiResult.score.clarity * 10} 
                        className="h-2"
                        indicatorClassName="bg-blue-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Confidence</span>
                        <span className="font-medium">{aiResult.score.confidence}/10</span>
                      </div>
                      <Progress 
                        value={aiResult.score.confidence * 10} 
                        className="h-2"
                        indicatorClassName="bg-green-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Specificity</span>
                        <span className="font-medium">{aiResult.score.specificity}/10</span>
                      </div>
                      <Progress 
                        value={aiResult.score.specificity * 10} 
                        className="h-2"
                        indicatorClassName="bg-purple-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Professional Impact</span>
                        <span className="font-medium">{aiResult.score.professional_impression}/10</span>
                      </div>
                      <Progress 
                        value={aiResult.score.professional_impression * 10} 
                        className="h-2"
                        indicatorClassName="bg-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end mt-6 gap-2">
              <Button variant="outline" onClick={onClose}>Close</Button>
              {aiResult && (
                <Button onClick={handleApply} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Apply Suggestion
                </Button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
