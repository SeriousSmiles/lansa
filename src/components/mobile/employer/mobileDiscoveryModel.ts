import type { DiscoveryProfile } from '@/services/discoveryService';
import type { SwipeDirection } from '@/services/swipeService';

export interface DeckState {
  profiles: DiscoveryProfile[];
  excluded: Set<string>;
  undo: { profile: DiscoveryProfile; swipeId: string } | null;
}

export const initialDeck = (): DeckState => ({ profiles: [], excluded: new Set(), undo: null });
export function receiveProfiles(state: DeckState, profiles: DiscoveryProfile[]): DeckState {
  const seen = new Set<string>();
  return { ...state, profiles: profiles.filter(p => {
    if (seen.has(p.user_id) || state.excluded.has(p.user_id)) return false;
    seen.add(p.user_id);
    return true;
  }) };
}
export function commitDecision(state: DeckState, profile: DiscoveryProfile, direction: SwipeDirection, swipeId: string): DeckState {
  return {
    profiles: state.profiles.filter(p => p.user_id !== profile.user_id),
    excluded: new Set([...state.excluded, profile.user_id]),
    undo: direction === 'left' ? { profile, swipeId } : null,
  };
}
export function restorePassed(state: DeckState): DeckState {
  if (!state.undo) return state;
  const excluded = new Set(state.excluded);
  excluded.delete(state.undo.profile.user_id);
  return { profiles: [state.undo.profile, ...state.profiles.filter(p => p.user_id !== state.undo?.profile.user_id)], excluded, undo: null };
}
/** Synchronous gate spans persistence AND dismissal, so the next card cannot receive the same gesture. */
export class ActionGate {
  busy = false;
  async run(task: () => Promise<void>): Promise<boolean> {
    if (this.busy) return false;
    this.busy = true;
    try { await task(); return true; }
    finally { this.busy = false; }
  }
}
export function skillNames(profile: DiscoveryProfile): string[] {
  return profile.skills.filter((skill): skill is string => typeof skill === 'string' && Boolean(skill.trim()));
}
export function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase();
}
