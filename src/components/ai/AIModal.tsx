import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  return createPortal(
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
            <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4">
              <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="pointer-events-auto w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl p-6 shadow-2xl border border-border"
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

                    {/* Quality Indicator */}
                    <div className="pt-2">
                      <div className="flex items-center gap-2 text-sm bg-muted/30 rounded-lg p-3">
                        {(() => {
                          const avgScore = (
                            aiResult.score.clarity +
                            aiResult.score.confidence +
                            aiResult.score.specificity +
                            aiResult.score.professional_impression
                          ) / 4;

                          if (avgScore >= 8) {
                            return (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span className="text-muted-foreground">Strong improvement - Ready to apply</span>
                              </>
                            );
                          } else if (avgScore >= 6) {
                            return (
                              <>
                                <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                <span className="text-muted-foreground">Good enhancement suggested</span>
                              </>
                            );
                          } else {
                            return (
                              <>
                                <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                <span className="text-muted-foreground">Consider these improvements</span>
                              </>
                            );
                          }
                        })()}
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
            </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
