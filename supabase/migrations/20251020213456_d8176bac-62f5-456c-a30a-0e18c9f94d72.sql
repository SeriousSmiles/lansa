-- Import Office Sector Question Bank for Lansa Certification Exam
-- This adds 12 ready-to-use questions across all 4 categories

-- Mindset Questions (4)
INSERT INTO public.cert_questions (sector, category, scenario, choices, mirror_role, mirror_context, randomize_order) VALUES
(
  'office',
  'mindset',
  'You realize you sent a report with outdated figures, but no one has mentioned it yet.',
  '[
    {"id":"a","text":"I''ll message my manager to let them know and suggest sending an updated version.","points":10},
    {"id":"b","text":"I''ll quietly update the file and send it again in the next report cycle.","points":6},
    {"id":"c","text":"I''ll note it down for next time—it''s too late to fix now.","points":4},
    {"id":"d","text":"I''ll mention it only if someone brings it up.","points":2}
  ]'::jsonb,
  'Manager',
  'Shows ownership versus avoidance',
  true
),
(
  'office',
  'mindset',
  'A teammate misses a deadline that causes your team to look bad.',
  '[
    {"id":"a","text":"I''ll calmly tell my manager what happened and how we can avoid it next time.","points":9},
    {"id":"b","text":"I''ll talk to the teammate privately to understand before saying anything.","points":8},
    {"id":"c","text":"I''ll focus on my part—everyone is responsible for their own tasks.","points":5},
    {"id":"d","text":"I''ll let management handle it; it''s not my job to fix others'' mistakes.","points":2}
  ]'::jsonb,
  'Manager',
  'Reveals team accountability sense',
  true
),
(
  'office',
  'mindset',
  'You were late to a morning briefing, again.',
  '[
    {"id":"a","text":"I''ll own it, apologize, and mention what I''ll change next time.","points":10},
    {"id":"b","text":"I''ll say traffic was rough but I still managed to make it.","points":6},
    {"id":"c","text":"I''ll just sign in quietly and not interrupt.","points":4},
    {"id":"d","text":"I''ll explain that the timing isn''t realistic for everyone.","points":3}
  ]'::jsonb,
  'Manager',
  'Tests reliability and improvement mindset',
  true
),
(
  'office',
  'mindset',
  'Your manager points out a small mistake in front of others.',
  '[
    {"id":"a","text":"I''ll say thanks for catching it, fix it, and move on.","points":9},
    {"id":"b","text":"I''ll explain my reasoning so they know I tried my best.","points":6},
    {"id":"c","text":"I''ll keep quiet—no use arguing in front of people.","points":4},
    {"id":"d","text":"I''ll talk to them after to explain why it wasn''t entirely my fault.","points":3}
  ]'::jsonb,
  'Manager',
  'Shows maturity under public correction',
  true
);

-- Workplace Intelligence Questions (4)
INSERT INTO public.cert_questions (sector, category, scenario, choices, mirror_role, mirror_context, randomize_order) VALUES
(
  'office',
  'workplace_intelligence',
  'Your boss says your presentation ''wasn''t clear enough.''',
  '[
    {"id":"a","text":"I''ll ask which parts were unclear and how I can make them stronger.","points":10},
    {"id":"b","text":"I''ll recheck my slides and try to simplify them next time.","points":8},
    {"id":"c","text":"I''ll explain that the audience didn''t follow because they weren''t paying attention.","points":3},
    {"id":"d","text":"I''ll accept it and move on—no need to overthink feedback.","points":5}
  ]'::jsonb,
  'Manager',
  'Evaluates openness to feedback',
  true
),
(
  'office',
  'workplace_intelligence',
  'A coworker constantly interrupts you during meetings.',
  '[
    {"id":"a","text":"I''d let them finish, then say ''I''d like to complete my thought.''","points":9},
    {"id":"b","text":"I''d talk to them after the meeting to explain it''s affecting my focus.","points":8},
    {"id":"c","text":"I''d match their energy next time so they see how it feels.","points":3},
    {"id":"d","text":"I''d ignore it—they''re probably just passionate.","points":5}
  ]'::jsonb,
  'Team',
  'Tests assertiveness and diplomacy',
  true
),
(
  'office',
  'workplace_intelligence',
  'Your manager gives you feedback that you feel is unfair.',
  '[
    {"id":"a","text":"I''d ask for examples so I can understand what led to that impression.","points":10},
    {"id":"b","text":"I''d take it quietly and not argue—feedback is feedback.","points":7},
    {"id":"c","text":"I''d explain my side to clear up the misunderstanding.","points":8},
    {"id":"d","text":"I''d tell them I don''t agree because I worked hard on it.","points":4}
  ]'::jsonb,
  'Manager',
  'Shows coachability under critique',
  true
),
(
  'office',
  'workplace_intelligence',
  'Your coworker talks over you when clients are around.',
  '[
    {"id":"a","text":"I''d bring it up respectfully after, explaining how it looks to clients.","points":9},
    {"id":"b","text":"I''d let it slide—maybe they just want to help.","points":6},
    {"id":"c","text":"I''d joke about it in front of them so it''s clear.","points":5},
    {"id":"d","text":"I''d complain to my manager right away.","points":3}
  ]'::jsonb,
  'Team',
  'Measures professional confrontation skills',
  true
);

-- Performance Habits Questions (2)
INSERT INTO public.cert_questions (sector, category, scenario, choices, mirror_role, mirror_context, randomize_order) VALUES
(
  'office',
  'performance_habits',
  'You finish your assigned work early.',
  '[
    {"id":"a","text":"I''ll ask if there''s another priority task I can help with.","points":9},
    {"id":"b","text":"I''ll use the time to review my past work and plan for next week.","points":8},
    {"id":"c","text":"I''ll take a short break and wait for new instructions.","points":5},
    {"id":"d","text":"I''ll start a new task I think is useful without asking.","points":6}
  ]'::jsonb,
  'Manager',
  'Shows initiative vs alignment',
  true
),
(
  'office',
  'performance_habits',
  'You''re handling two urgent requests that overlap.',
  '[
    {"id":"a","text":"I''d clarify priority with my manager before continuing.","points":10},
    {"id":"b","text":"I''d try to finish both by multitasking.","points":6},
    {"id":"c","text":"I''d complete whichever is more visible first.","points":4},
    {"id":"d","text":"I''d do the one I prefer and the other later.","points":3}
  ]'::jsonb,
  'Manager',
  'Tests prioritization and communication',
  true
);

-- Applied Thinking Questions (2)
INSERT INTO public.cert_questions (sector, category, scenario, choices, mirror_role, mirror_context, randomize_order) VALUES
(
  'office',
  'applied_thinking',
  'Your project keeps falling behind because tasks aren''t clear.',
  '[
    {"id":"a","text":"I''d draft a short task list for the team and confirm it with management.","points":10},
    {"id":"b","text":"I''d bring it to management so the project plan can be fixed.","points":6},
    {"id":"c","text":"I''d keep doing my part until the plan changes.","points":4},
    {"id":"d","text":"I''d wait—unclear projects always slow down anyway.","points":2}
  ]'::jsonb,
  'Manager',
  'Shows initiative vs dependence',
  true
),
(
  'office',
  'applied_thinking',
  'A client adds new work after you''ve already finalized the deliverable.',
  '[
    {"id":"a","text":"I''d explain timeline impact and propose realistic next steps.","points":10},
    {"id":"b","text":"I''d agree and try to squeeze it in—can''t lose goodwill.","points":6},
    {"id":"c","text":"I''d pass it to my manager to decide.","points":5},
    {"id":"d","text":"I''d do part of it so it seems handled.","points":3}
  ]'::jsonb,
  'Manager',
  'Tests realism and expectation control',
  true
);