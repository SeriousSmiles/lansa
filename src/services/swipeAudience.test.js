import { test, expect, mock } from 'bun:test';
let reads = 0;
mock.module('../integrations/supabase/client', () => ({ supabase: { from() { reads++; throw new Error('Unexpected database access'); } } }));
mock.module('sonner', () => ({ toast: { error() {} } }));
const { swipeService } = await import('./swipeService');
test('self-interest never writes a swipe or presents a mutual match', async () => {
  reads = 0;
  await expect(swipeService.recordSwipe({ swiper_user_id: 'owner', target_user_id: 'owner', direction: 'right', context: 'employee' })).rejects.toThrow('own profile');
  expect(await swipeService.checkForMatch('owner', 'owner', 'employee')).toBeNull();
  expect(reads).toBe(0);
});