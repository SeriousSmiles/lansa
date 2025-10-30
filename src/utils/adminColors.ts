export type UserColor = 'purple' | 'green' | 'orange' | 'red';
export type IntentStage = 'upgrade_ready' | 'downgrade_risk' | 'cancel_risk' | 'none';

export const COLOR_CONFIG: Record<UserColor, {
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  description: string;
  pattern: string;
}> = {
  purple: {
    label: 'Advocate',
    bgClass: 'bg-purple-100 dark:bg-purple-900/20',
    textClass: 'text-purple-700 dark:text-purple-300',
    borderClass: 'border-purple-300 dark:border-purple-700',
    description: 'Promoter, referrer, testimonial-giver',
    pattern: '⬤'
  },
  green: {
    label: 'Engaged',
    bgClass: 'bg-green-100 dark:bg-green-900/20',
    textClass: 'text-green-700 dark:text-green-300',
    borderClass: 'border-green-300 dark:border-green-700',
    description: 'Active, gets value, quiet',
    pattern: '▲'
  },
  orange: {
    label: 'Underused',
    bgClass: 'bg-orange-100 dark:bg-orange-900/20',
    textClass: 'text-orange-700 dark:text-orange-300',
    borderClass: 'border-orange-300 dark:border-orange-700',
    description: '1-2 features, not full potential, at risk',
    pattern: '■'
  },
  red: {
    label: 'Drifting',
    bgClass: 'bg-red-100 dark:bg-red-900/20',
    textClass: 'text-red-700 dark:text-red-300',
    borderClass: 'border-red-300 dark:border-red-700',
    description: 'Barely logs in, cancellation risk',
    pattern: '◆'
  }
};

export const INTENT_CONFIG: Record<IntentStage, {
  label: string;
  color: string;
}> = {
  upgrade_ready: { label: 'Upgrade Ready', color: 'text-blue-600' },
  downgrade_risk: { label: 'Downgrade Risk', color: 'text-orange-600' },
  cancel_risk: { label: 'Cancel Risk', color: 'text-red-600' },
  none: { label: 'None', color: 'text-muted-foreground' }
};

export function getEffectiveColor(colorAdmin: UserColor | null, colorAuto: UserColor | null): UserColor | null {
  return colorAdmin || colorAuto;
}
