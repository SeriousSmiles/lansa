import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, CheckCircle, AlertCircle, Info, ChevronDown, ChevronUp, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  disabled?: boolean;
}

export function AIModal({
  isOpen,
  onClose,
  section,
  data,
  onEnhance,
  aiResult,
  isLoading = false,
  disabled = false
}: AIModalProps) {
  const [isReasoningOpen, setIsReasoningOpen] = useState(false);
  const handleApply = () => {
    if (aiResult?.suggested_rewrite && !disabled) {
      onEnhance(aiResult.suggested_rewrite);
      onClose();
    }
  };

  // Parse the original and suggested data for skills to find differences
  const parseChanges = () => {
    if (!aiResult || section !== 'Skills') return null;
    const original = data.split(',').map(s => s.trim()).filter(s => s);
    const suggested = aiResult.suggested_rewrite.split(',').map(s => s.trim()).filter(s => s);
    const removed = original.filter(skill => !suggested.includes(skill));
    const added = suggested.filter(skill => !original.includes(skill));
    const kept = original.filter(skill => suggested.includes(skill));
    return {
      removed,
      added,
      kept
    };
  };
  const changes = parseChanges();
  return createPortal(<AnimatePresence>
      {isOpen && <>
          {/* Backdrop */}
          <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4">
              <motion.div initial={{
          y: 80,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} exit={{
          y: 80,
          opacity: 0
        }} transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300
        }} className="pointer-events-auto w-full max-w-5xl max-h-[90vh] overflow-hidden bg-background rounded-2xl shadow-2xl border border-border flex flex-col">
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

                  {isLoading ? <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Sparkles className="w-8 h-8 animate-pulse mb-3 text-primary" />
                      <p className="text-sm font-medium">Analyzing and optimizing...</p>
                    </div> : aiResult ? <>
                      {/* Quality Badge */}
                      <div className="flex items-center justify-start">
                        {(() => {
                  const avgScore = (aiResult.score.clarity + aiResult.score.confidence + aiResult.score.specificity + aiResult.score.professional_impression) / 4;
                  if (avgScore >= 8) {
                    return <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-xs font-medium text-green-700">Strong Enhancement</span>
                              </div>;
                  } else if (avgScore >= 6) {
                    return <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                                <Info className="w-4 h-4 text-blue-600" />
                                <span className="text-xs font-medium text-blue-700">Good Improvement</span>
                              </div>;
                  } else {
                    return <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                                <AlertCircle className="w-4 h-4 text-orange-600" />
                                <span className="text-xs font-medium text-orange-700">Review Suggested</span>
                              </div>;
                  }
                })()}
                      </div>

                      {/* Suggested Rewrite for non-Skills sections */}
                      {section !== 'Skills' && aiResult.suggested_rewrite && (
                        <div className="bg-green-500/5 rounded-xl p-4 border border-green-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-medium text-green-700 uppercase tracking-wide">Suggested</span>
                          </div>
                          <p className="text-sm leading-relaxed text-foreground">{aiResult.suggested_rewrite}</p>
                        </div>
                      )}

                      {/* Action Blocks - Show what changed (Skills only) */}
                      {changes && <div className="space-y-3">
                          <h4 className="text-sm font-semibold">Changes Made</h4>
                          
                          {changes.removed.length > 0 && <div className="bg-red-500/5 rounded-lg p-3 border border-red-500/20">
                              <div className="flex items-center gap-2 mb-2">
                                <Minus className="w-4 h-4 text-red-600" />
                                <span className="text-xs font-medium text-red-700 uppercase tracking-wide">Removed</span>
                              </div>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {changes.removed.map((skill, idx) => <Badge key={idx} variant="outline" className="bg-red-50 border-red-200 text-red-700">
                                    {skill}
                                  </Badge>)}
                              </div>
                              <p className="text-xs text-red-600/80">Too generic or not optimized for ATS (Applicant Tracking Systems used by recruiters)</p>
                            </div>}

                          {changes.added.length > 0 && <div className="bg-green-500/5 rounded-lg p-3 border border-green-500/20">
                              <div className="flex items-center gap-2 mb-2">
                                <Plus className="w-4 h-4 text-green-600" />
                                <span className="text-xs font-medium text-green-700 uppercase tracking-wide">Enhanced/Added</span>
                              </div>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {changes.added.map((skill, idx) => <Badge key={idx} variant="outline" className="bg-green-50 border-green-200 text-green-700">
                                    {skill}
                                  </Badge>)}
                              </div>
                              <p className="text-xs text-green-600/80">More specific and easier for recruiters to match with job requirements</p>
                            </div>}
                        </div>}

                      {/* Expandable Reasoning */}
                      <Collapsible open={isReasoningOpen} onOpenChange={setIsReasoningOpen}>
                        <CollapsibleTrigger asChild>
                          <button className="w-full flex items-center justify-between p-3 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors border border-border">
                            <div className="flex items-center gap-2">
                              <Info className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium">Why This Helps</span>
                            </div>
                            {isReasoningOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="mt-2 p-4 rounded-lg bg-accent/20 border border-border">
                            <p className="text-sm text-foreground/80 leading-relaxed">
                              {aiResult.reasoning}
                            </p>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </> : null}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
                  <Button variant="outline" onClick={onClose}>Cancel</Button>
                  {aiResult && <Button 
                    onClick={handleApply} 
                    className="gap-2"
                    disabled={disabled}
                    title={disabled ? "Edit your content to use AI enhancement again" : undefined}
                  >
                      <Sparkles className="w-4 h-4" />
                      Apply Enhancement
                    </Button>}
                </div>
              </motion.div>
            </div>
        </>}
    </AnimatePresence>, document.body);
}
