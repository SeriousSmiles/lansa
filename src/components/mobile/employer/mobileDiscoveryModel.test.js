import { describe, test, expect } from 'bun:test';
import { ActionGate, initialDeck, receiveProfiles, commitDecision, restorePassed } from './mobileDiscoveryModel';
const a = { user_id: 'a', name: 'A', title: 'Engineer', skills: [] };
const b = { user_id: 'b', name: 'B', title: 'Designer', skills: [] };
describe('mobile discovery decisions', () => {
  test('one gesture removes only its candidate and shows the real next candidate', () => {
    const state = commitDecision(receiveProfiles(initialDeck(), [a, b]), a, 'right', 's1');
    expect(state.profiles.map(p => p.user_id)).toEqual(['b']);
    expect(receiveProfiles(state, [a, b, b]).profiles.map(p => p.user_id)).toEqual(['b']);
  });
  test('Undo restores exactly the last passed candidate once, even on the final card', () => {
    const state = commitDecision(receiveProfiles(initialDeck(), [a]), a, 'left', 's1');
    expect(state.undo?.swipeId).toBe('s1');
    const restored = restorePassed(state);
    expect(restored.profiles.map(p => p.user_id)).toEqual(['a']);
    expect(restorePassed(restored).profiles.map(p => p.user_id)).toEqual(['a']);
    expect(restored.excluded.has('a')).toBe(false);
  });
  test('interest and nudge cannot be undone as a pass', () => {
    for (const direction of ['right', 'nudge']) {
      expect(commitDecision(receiveProfiles(initialDeck(), [a]), a, direction, 's1').undo).toBeNull();
    }
  });
  test('rapid taps and gestures persist one action during settling', async () => {
    const gate = new ActionGate();
    let calls = 0;
    let finish;
    const first = gate.run(async () => { calls++; await new Promise(resolve => { finish = resolve; }); });
    expect(await gate.run(async () => { calls++; })).toBe(false);
    finish?.();
    await first;
    expect(calls).toBe(1);
    expect(gate.busy).toBe(false);
  });
  test('a refused write leaves the candidate recoverable and unlocks retry', async () => {
    const gate = new ActionGate();
    let state = receiveProfiles(initialDeck(), [a, b]);
    await expect(gate.run(async () => { throw new Error('refused'); })).rejects.toThrow('refused');
    expect(state.profiles[0].user_id).toBe('a');
    expect(gate.busy).toBe(false);
    await gate.run(async () => { state = commitDecision(state, a, 'left', 's1'); });
    expect(state.profiles[0].user_id).toBe('b');
  });
});
