
export const getNextStage = (currentStage: string): string | null => {
  const stages = ['identity_setup', 'clarity_positioning', 'external_visibility', 'personal_growth_loop'];
  const currentIndex = stages.indexOf(currentStage);
  return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
};

export const getStageDisplayName = (stage: string): string => {
  const stageNames: Record<string, string> = {
    'identity_setup': 'Identity Setup',
    'clarity_positioning': 'Clarity & Positioning',
    'external_visibility': 'External Visibility',
    'personal_growth_loop': 'Personal Growth Loop'
  };
  return stageNames[stage] || stage;
};
