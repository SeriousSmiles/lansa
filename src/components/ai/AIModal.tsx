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
                className="pointer-events-auto w-full max-w-3xl max-h-[90vh] overflow-hidden bg-background rounded-2xl shadow-2xl border border-border flex flex-col"
              >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">AI Enhancement</h3>
                      <p className="text-xs text-muted-foreground">{section}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {/* Original Content - Compact */}
                  <div className="bg-muted/20 rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Current</span>
                    </div>
                    <p className="text-sm leading-relaxed">{data}</p>
                  </div>

                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Sparkles className="w-8 h-8 animate-pulse mb-3 text-primary" />
                      <p className="text-sm font-medium">Analyzing and optimizing...</p>
                    </div>
                  ) : aiResult ? (
                    <>
                      {/* Quality Badge */}
                      <div className="flex items-center justify-center">
                        {(() => {
                          const avgScore = (
                            aiResult.score.clarity +
                            aiResult.score.confidence +
                            aiResult.score.specificity +
                            aiResult.score.professional_impression
                          ) / 4;

                          if (avgScore >= 8) {
                            return (
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-xs font-medium text-green-700">Strong Enhancement</span>
                              </div>
                            );
                          } else if (avgScore >= 6) {
                            return (
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                                <Info className="w-4 h-4 text-blue-600" />
                                <span className="text-xs font-medium text-blue-700">Good Improvement</span>
                              </div>
                            );
                          } else {
                            return (
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                                <AlertCircle className="w-4 h-4 text-orange-600" />
                                <span className="text-xs font-medium text-orange-700">Review Suggested</span>
                              </div>
                            );
                          }
                        })()}
                      </div>

                      {/* AI Analysis - Compact Card */}
                      <div className="bg-accent/30 rounded-xl p-4 border border-border">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold mb-1.5">Why This Helps</h4>
                            <p className="text-sm text-foreground/80 leading-relaxed">
                              {aiResult.reasoning}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Suggestion - Highlighted */}
                      <div className="bg-primary/10 rounded-xl p-4 border-2 border-primary/30">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-medium text-primary uppercase tracking-wide">Enhanced Version</span>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                          {aiResult.suggested_rewrite}
                        </p>
                      </div>
                    </>
                  ) : null}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
                  <Button variant="outline" onClick={onClose}>Cancel</Button>
                  {aiResult && (
                    <Button onClick={handleApply} className="gap-2">
                      <Sparkles className="w-4 h-4" />
                      Apply Enhancement
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
