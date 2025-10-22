-- Insert Service Sector Questions (Customer-Facing Roles)

INSERT INTO public.cert_questions (sector, category, scenario, choices, mirror_role, mirror_context, randomize_order) VALUES
('service', 'mindset', 'A customer raises their voice and blames you for something that wasn''t your fault.', 
'[{"id":"a","text":"I''d stay calm, listen fully, and apologize for their experience while explaining what I can do to help.","points":10},{"id":"b","text":"I''d politely tell them it wasn''t my fault but I''ll try to fix it.","points":7},{"id":"c","text":"I''d call my supervisor right away so they handle it.","points":5},{"id":"d","text":"I''d explain the policy so they understand why it''s not possible.","points":4}]'::jsonb,
'Customer', 'Shows empathy versus defensiveness', true),

('service', 'mindset', 'You''re having a tough personal day but must stay pleasant with guests all shift.',
'[{"id":"a","text":"I''d focus on giving good service and take short breathing moments when I can.","points":9},{"id":"b","text":"I''d stay quiet to avoid saying something wrong.","points":6},{"id":"c","text":"I''d tell coworkers I''m not in the mood so they understand.","points":5},{"id":"d","text":"I''d just push through and finish quickly.","points":4}]'::jsonb,
'Manager', 'Tests professionalism under emotion', true),

('service', 'workplace_intelligence', 'A colleague is rude to a customer in front of you.',
'[{"id":"a","text":"I''d politely step in to calm the customer and later talk privately with my colleague.","points":10},{"id":"b","text":"I''d ignore it—it''s not my business.","points":4},{"id":"c","text":"I''d tell my manager right away so they know what happened.","points":6},{"id":"d","text":"I''d defend my colleague so the customer doesn''t get angrier.","points":5}]'::jsonb,
'Manager', 'Shows team accountability and customer care balance', true),

('service', 'workplace_intelligence', 'A customer asks for help while you''re serving another one.',
'[{"id":"a","text":"I''d acknowledge them with a smile and let them know I''ll assist soon.","points":9},{"id":"b","text":"I''d finish the first customer completely before looking at the other.","points":7},{"id":"c","text":"I''d ask the second customer to wait in line like everyone else.","points":5},{"id":"d","text":"I''d quickly handle the second one first so no one waits.","points":4}]'::jsonb,
'Customer', 'Tests awareness of service flow and multitasking', true),

('service', 'performance_habits', 'You notice the counter area looks messy between rushes.',
'[{"id":"a","text":"I''d tidy it whenever traffic slows, even if not asked.","points":10},{"id":"b","text":"I''d tell the cleaner when they pass by—it''s their duty.","points":5},{"id":"c","text":"I''d leave it until closing; it''ll just get messy again.","points":3},{"id":"d","text":"I''d clean it only if my supervisor sees it.","points":2}]'::jsonb,
'Manager', 'Shows initiative and pride in workspace', true),

('service', 'performance_habits', 'You''re behind schedule and a coworker offers help but is slower than you.',
'[{"id":"a","text":"I''d accept and guide them so we both keep pace.","points":9},{"id":"b","text":"I''d thank them but decline—I work faster alone.","points":6},{"id":"c","text":"I''d let them do their part and redo it later if needed.","points":4},{"id":"d","text":"I''d ignore the offer to avoid confusion.","points":3}]'::jsonb,
'Supervisor', 'Evaluates collaboration versus control mindset', true),

('service', 'applied_thinking', 'A tourist can''t speak your language well and seems frustrated.',
'[{"id":"a","text":"I''d use gestures, simple words, or translation apps to help them complete their request.","points":10},{"id":"b","text":"I''d ask a bilingual coworker to handle it entirely.","points":6},{"id":"c","text":"I''d smile and point to the menu to make them choose.","points":5},{"id":"d","text":"I''d tell them politely I can''t understand and move on.","points":3}]'::jsonb,
'Customer', 'Shows problem-solving and patience with communication barriers', true),

('service', 'applied_thinking', 'You realize a common customer complaint keeps repeating every week.',
'[{"id":"a","text":"I''d note details and suggest a small process fix to my manager.","points":10},{"id":"b","text":"I''d keep giving the same explanation—it''s part of the job.","points":5},{"id":"c","text":"I''d tell the team to just be more patient with those customers.","points":6},{"id":"d","text":"I''d wait for management to notice the pattern.","points":4}]'::jsonb,
'Manager', 'Tests initiative in long-term service improvement', true),

('service', 'mindset', 'A coworker forgot to restock before their shift ended, and now you''re short on supplies.',
'[{"id":"a","text":"I''d handle the shortage calmly and restock when I can, then remind the coworker politely next shift.","points":9},{"id":"b","text":"I''d tell the manager right away so they know who forgot.","points":6},{"id":"c","text":"I''d leave it—it''s not my fault and they''ll fix it next time.","points":3},{"id":"d","text":"I''d call them to come back and restock properly.","points":2}]'::jsonb,
'Supervisor', 'Shows ownership vs. blame culture', true),

('service', 'applied_thinking', 'The POS system goes down while customers are waiting.',
'[{"id":"a","text":"I''d stay calm, note orders manually, and reassure customers until it''s fixed.","points":10},{"id":"b","text":"I''d tell customers to wait until the system comes back.","points":6},{"id":"c","text":"I''d call IT and step aside until it''s solved.","points":5},{"id":"d","text":"I''d explain it''s out of my hands and apologize repeatedly.","points":4}]'::jsonb,
'Manager', 'Evaluates composure and situational creativity', true);