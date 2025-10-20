-- Add 8 more Office questions to complete the 20-question bank

-- Additional Performance Habits Questions (2 more = 4 total)
INSERT INTO public.cert_questions (sector, category, scenario, choices, mirror_role, mirror_context, randomize_order) VALUES
(
  'office',
  'performance_habits',
  'You notice a process that wastes time every week.',
  '[
    {"id":"a","text":"I''d document the issue and propose a solution to my manager.","points":10},
    {"id":"b","text":"I''d mention it casually to see if anyone else notices.","points":6},
    {"id":"c","text":"I''d work around it myself but not make it official.","points":5},
    {"id":"d","text":"I''d wait for someone else to bring it up—it''s been this way forever.","points":2}
  ]'::jsonb,
  'Manager',
  'Shows improvement mindset and initiative',
  true
),
(
  'office',
  'performance_habits',
  'Your manager asks for a status update but you''re behind schedule.',
  '[
    {"id":"a","text":"I''d be honest about where I am and explain what I need to get back on track.","points":10},
    {"id":"b","text":"I''d say I''m almost done to avoid looking bad.","points":3},
    {"id":"c","text":"I''d list what I''ve finished so far to show progress.","points":7},
    {"id":"d","text":"I''d blame delays on things outside my control.","points":2}
  ]'::jsonb,
  'Manager',
  'Tests transparency and accountability',
  true
);

-- Additional Applied Thinking Questions (2 more = 4 total)
INSERT INTO public.cert_questions (sector, category, scenario, choices, mirror_role, mirror_context, randomize_order) VALUES
(
  'office',
  'applied_thinking',
  'Your team disagrees on how to approach a project.',
  '[
    {"id":"a","text":"I''d suggest we list pros and cons of each approach before deciding.","points":10},
    {"id":"b","text":"I''d push for the approach I think is best.","points":5},
    {"id":"c","text":"I''d stay quiet and go with whatever the majority wants.","points":4},
    {"id":"d","text":"I''d let the manager decide—it''s their call anyway.","points":6}
  ]'::jsonb,
  'Team',
  'Shows collaborative problem-solving',
  true
),
(
  'office',
  'applied_thinking',
  'You''re asked to train someone but you''re already overloaded.',
  '[
    {"id":"a","text":"I''d explain my workload and ask which tasks I should deprioritize.","points":10},
    {"id":"b","text":"I''d agree and figure it out somehow.","points":6},
    {"id":"c","text":"I''d do a quick handoff instead of proper training.","points":4},
    {"id":"d","text":"I''d say I don''t have time—someone else should do it.","points":3}
  ]'::jsonb,
  'Manager',
  'Tests boundary-setting and resource management',
  true
);

-- Additional Mindset Questions (2 more = 6 total)
INSERT INTO public.cert_questions (sector, category, scenario, choices, mirror_role, mirror_context, randomize_order) VALUES
(
  'office',
  'mindset',
  'You made a mistake that cost the company money.',
  '[
    {"id":"a","text":"I''d report it immediately and propose how to prevent it in the future.","points":10},
    {"id":"b","text":"I''d try to fix it quietly before anyone notices.","points":5},
    {"id":"c","text":"I''d mention it only if asked directly.","points":3},
    {"id":"d","text":"I''d explain that I was following the process I was taught.","points":4}
  ]'::jsonb,
  'Manager',
  'Shows integrity under pressure',
  true
),
(
  'office',
  'mindset',
  'Your coworker gets promoted over you.',
  '[
    {"id":"a","text":"I''d congratulate them and ask my manager for feedback on my growth areas.","points":10},
    {"id":"b","text":"I''d congratulate them but feel frustrated internally.","points":7},
    {"id":"c","text":"I''d start looking for opportunities elsewhere.","points":4},
    {"id":"d","text":"I''d distance myself from the promoted coworker.","points":2}
  ]'::jsonb,
  'Manager',
  'Shows maturity and growth mindset',
  true
);

-- Additional Workplace Intelligence Questions (2 more = 6 total)
INSERT INTO public.cert_questions (sector, category, scenario, choices, mirror_role, mirror_context, randomize_order) VALUES
(
  'office',
  'workplace_intelligence',
  'Your manager seems frustrated but hasn''t said why.',
  '[
    {"id":"a","text":"I''d ask if everything is okay and if there''s anything I can help with.","points":9},
    {"id":"b","text":"I''d give them space—they''ll say something when ready.","points":7},
    {"id":"c","text":"I''d assume it''s about me and try to fix whatever I might have done.","points":4},
    {"id":"d","text":"I''d ignore it—everyone has bad days.","points":3}
  ]'::jsonb,
  'Manager',
  'Shows emotional intelligence and initiative',
  true
),
(
  'office',
  'workplace_intelligence',
  'A senior colleague gives you advice that contradicts your manager''s instructions.',
  '[
    {"id":"a","text":"I''d thank them and clarify with my manager which approach to use.","points":10},
    {"id":"b","text":"I''d follow my manager''s instructions since they''re my direct supervisor.","points":8},
    {"id":"c","text":"I''d use the senior colleague''s advice since they have more experience.","points":5},
    {"id":"d","text":"I''d blend both approaches to keep everyone happy.","points":6}
  ]'::jsonb,
  'Manager',
  'Tests navigation of workplace hierarchy',
  true
);