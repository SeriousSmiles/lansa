import { DEMO_CONFIG } from '@/config/demo';

// Safe logging utilities for demo
const silent = (..._args: any[]) => {};

// Filter sensitive data from objects
const filterSensitiveData = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sensitiveKeys = [
    'access_token', 'refresh_token', 'provider_token', 'session', 
    'password', 'email', 'phone', 'user_metadata', 'app_metadata',
    'user_id', 'id', 'recruiter_perspective', 'mirror_message', 'ai_interpretation',
    'skill', 'goalStatement', 'skillReframe', 'goal_statement', 'original_skill',
    'reframed_skill', 'coaching_nudge', 'key_strengths', 'employer_perspective',
    'score_breakdown', 'contradictions', 'analysis', 'mirror', 'response'
  ];
  
  if (Array.isArray(obj)) {
    return obj.map(filterSensitiveData);
  }
  
  const filtered: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive.toLowerCase()))) {
      filtered[key] = '[FILTERED]';
    } else if (typeof value === 'object' && value !== null) {
      filtered[key] = filterSensitiveData(value);
    } else {
      filtered[key] = value;
    }
  }
  return filtered;
};

// Safe console methods
export const log = DEMO_CONFIG.DEMO_QUIET ? silent : (...args: any[]) => {
  console.log(...args.map(filterSensitiveData));
};

export const info = DEMO_CONFIG.DEMO_QUIET ? silent : (...args: any[]) => {
  console.info(...args.map(filterSensitiveData));
};

export const debug = DEMO_CONFIG.DEMO_QUIET ? silent : (...args: any[]) => {
  console.debug(...args.map(filterSensitiveData));
};

export const warn = (...args: any[]) => {
  console.warn(...args.map(filterSensitiveData));
};

export const error = (...args: any[]) => {
  console.error(...args.map(filterSensitiveData));
};

// Safe user/session logging
export const logUserAction = (action: string, data?: any) => {
  if (DEMO_CONFIG.DEMO_QUIET) return;
  
  const safeData = data ? filterSensitiveData(data) : undefined;
  console.log(`Action: ${action}`, safeData);
};

// AI service logging (secure)
export const logAICall = (service: string, success: boolean, duration?: number) => {
  if (DEMO_CONFIG.DEMO_QUIET) return;
  console.log(`AI Service: ${service} - ${success ? 'SUCCESS' : 'FAILED'}${duration ? ` (${duration}ms)` : ''}`);
};

// Development-only detailed logging
export const devLog = (...args: any[]) => {
  if (import.meta.env.DEV && !DEMO_CONFIG.DEMO_QUIET) {
    console.log('[DEV]', ...args.map(filterSensitiveData));
  }
};