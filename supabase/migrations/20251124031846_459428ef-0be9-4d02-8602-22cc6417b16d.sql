-- Phase 3: Question Bank Expansion for Technical and Digital Sectors (Fixed JSON escaping)

-- TECHNICAL SECTOR QUESTIONS (25 questions across 4 categories)

-- Technical - Mindset (7 questions)
INSERT INTO cert_questions (sector, category, question_type, scenario, choices, mirror_role, mirror_context, randomize_order, time_limit_seconds) VALUES
('technical', 'mindset', 'mcq', 'A coworker skips a safety step to save time while you are on shift together.',
'[{"id":"a","text":"I would stop them and remind them we must follow the full procedure, even if it is slower.","points":10},
{"id":"b","text":"I would mention it but keep working so we do not fall behind.","points":7},
{"id":"c","text":"I would let it slide once, but tell the supervisor later.","points":5},
{"id":"d","text":"I would ignore it; it is their responsibility, not mine.","points":3}]',
'Supervisor', 'Shows integrity around safety and team responsibility', true, 40),

('technical', 'mindset', 'mcq', 'You notice a potential safety hazard that was not in the morning briefing.',
'[{"id":"a","text":"I would report it immediately and suggest we pause until it is addressed.","points":10},
{"id":"b","text":"I would work around it carefully and mention it at the end of shift.","points":6},
{"id":"c","text":"I would tell my coworkers to watch out but keep going.","points":5},
{"id":"d","text":"I would assume someone already noticed and keep working.","points":2}]',
'Site Manager', 'Tests proactive safety ownership', true, 40),

('technical', 'mindset', 'mcq', 'You made a mistake that could delay the project by a day.',
'[{"id":"a","text":"I would tell the supervisor right away and propose how to catch up.","points":10},
{"id":"b","text":"I would try to fix it myself before anyone notices.","points":6},
{"id":"c","text":"I would mention it only if asked directly.","points":4},
{"id":"d","text":"I would explain that I was following the instructions I was given.","points":3}]',
'Project Lead', 'Shows accountability under pressure', true, 40),

('technical', 'mindset', 'mcq', 'The client complains about the quality of yesterday work from your team.',
'[{"id":"a","text":"I would listen fully, take notes, and commit to fixing it today with a clear timeline.","points":10},
{"id":"b","text":"I would apologize but explain the challenges we faced.","points":7},
{"id":"c","text":"I would say I will check with the supervisor about what happened.","points":5},
{"id":"d","text":"I would point out that we finished on time as requested.","points":3}]',
'Client', 'Tests customer-facing accountability', true, 40),

('technical', 'mindset', 'mcq', 'You see another crew member struggling but you are behind schedule.',
'[{"id":"a","text":"I would pause and help them, then we both catch up together.","points":10},
{"id":"b","text":"I would offer quick advice but keep focused on my own tasks.","points":7},
{"id":"c","text":"I would finish my work first, then help if there is time.","points":5},
{"id":"d","text":"I would let them handle it; everyone has their own responsibilities.","points":3}]',
'Team Lead', 'Shows team mindset versus individual focus', true, 40),

('technical', 'mindset', 'mcq', 'Equipment breaks down in the middle of an urgent job.',
'[{"id":"a","text":"I would stop immediately, report the issue, and recommend the next safest step.","points":10},
{"id":"b","text":"I would try a quick fix to see if we can keep going.","points":6},
{"id":"c","text":"I would call my supervisor and wait for instructions.","points":7},
{"id":"d","text":"I would switch to a backup tool and finish the job.","points":5}]',
'Operations Manager', 'Tests judgment between speed and safety', true, 40),

('technical', 'mindset', 'mcq', 'A client asks you to skip a step to finish early.',
'[{"id":"a","text":"I would explain why we need to follow the full process and offer to speed up other areas.","points":10},
{"id":"b","text":"I would check with my supervisor before agreeing.","points":8},
{"id":"c","text":"I would agree if the client takes responsibility in writing.","points":5},
{"id":"d","text":"I would do it to keep the client happy.","points":2}]',
'Client', 'Shows professional boundaries and integrity', true, 40);

-- Technical - Workplace Intelligence (6 questions)
INSERT INTO cert_questions (sector, category, question_type, scenario, choices, mirror_role, mirror_context, randomize_order, time_limit_seconds) VALUES
('technical', 'workplace_intelligence', 'mcq', 'The supervisor gives unclear instructions for a critical task.',
'[{"id":"a","text":"I would ask specific clarifying questions before starting.","points":10},
{"id":"b","text":"I would start working and ask questions as they come up.","points":6},
{"id":"c","text":"I would do my best interpretation and check in halfway through.","points":7},
{"id":"d","text":"I would follow what I think they meant and explain later if it is wrong.","points":4}]',
'Supervisor', 'Tests communication and initiative', true, 40),

('technical', 'workplace_intelligence', 'mcq', 'You overhear the client is unhappy with the timeline but they have not said anything to you.',
'[{"id":"a","text":"I would proactively check in with them about their concerns and offer solutions.","points":10},
{"id":"b","text":"I would mention it to my supervisor and let them handle it.","points":7},
{"id":"c","text":"I would work faster to try to finish early.","points":6},
{"id":"d","text":"I would wait for them to bring it up officially.","points":4}]',
'Project Lead', 'Tests proactive communication', true, 40),

('technical', 'workplace_intelligence', 'mcq', 'Your crew is behind schedule and tensions are rising.',
'[{"id":"a","text":"I would suggest a quick team huddle to reassign tasks and refocus.","points":10},
{"id":"b","text":"I would just focus on my own work to catch up.","points":5},
{"id":"c","text":"I would make a joke to lighten the mood.","points":6},
{"id":"d","text":"I would wait for the supervisor to step in.","points":4}]',
'Site Manager', 'Tests leadership instinct and team awareness', true, 40),

('technical', 'workplace_intelligence', 'mcq', 'A supplier delivers the wrong materials but the order slip is unclear.',
'[{"id":"a","text":"I would check the order details, contact the supplier immediately, and update the supervisor.","points":10},
{"id":"b","text":"I would use what we have and mention it to the supervisor.","points":5},
{"id":"c","text":"I would send the supplier back and wait for new delivery.","points":7},
{"id":"d","text":"I would blame the supplier and demand they fix it for free.","points":3}]',
'Operations Manager', 'Tests problem-solving under ambiguity', true, 40),

('technical', 'workplace_intelligence', 'mcq', 'Weather conditions worsen during an outdoor job.',
'[{"id":"a","text":"I would assess the risk, pause if unsafe, and communicate the decision clearly.","points":10},
{"id":"b","text":"I would keep going unless told to stop.","points":4},
{"id":"c","text":"I would ask the team what they think we should do.","points":7},
{"id":"d","text":"I would push through to avoid delays.","points":3}]',
'Safety Officer', 'Tests judgment and risk assessment', true, 40),

('technical', 'workplace_intelligence', 'mcq', 'The client keeps changing requirements mid-job.',
'[{"id":"a","text":"I would document each change, confirm them in writing, and adjust the timeline accordingly.","points":10},
{"id":"b","text":"I would try to accommodate all changes without pushing back.","points":5},
{"id":"c","text":"I would tell them we need to stick to the original plan.","points":6},
{"id":"d","text":"I would make the changes but charge extra later.","points":4}]',
'Client', 'Tests scope management and communication', true, 40);

-- Technical - Performance Habits (6 questions)
INSERT INTO cert_questions (sector, category, question_type, scenario, choices, mirror_role, mirror_context, randomize_order, time_limit_seconds) VALUES
('technical', 'performance_habits', 'mcq', 'You are scheduled to arrive at 7 AM but there is heavy traffic.',
'[{"id":"a","text":"I would call ahead as soon as I know I will be late and give an updated ETA.","points":10},
{"id":"b","text":"I would just get there as fast as I can and explain when I arrive.","points":6},
{"id":"c","text":"I would text the supervisor when I am 10 minutes away.","points":7},
{"id":"d","text":"I would assume they will understand since traffic is unpredictable.","points":3}]',
'Site Manager', 'Tests reliability and communication', true, 40),

('technical', 'performance_habits', 'mcq', 'Your tools are dirty and need maintenance after a long week.',
'[{"id":"a","text":"I would clean and maintain them before the weekend so they are ready Monday.","points":10},
{"id":"b","text":"I would do a quick wipe-down and full maintenance next week.","points":6},
{"id":"c","text":"I would clean them Monday morning before starting work.","points":7},
{"id":"d","text":"I would wait until they start causing problems.","points":2}]',
'Supervisor', 'Tests professionalism and preparation', true, 40),

('technical', 'performance_habits', 'mcq', 'The job requires double-checking measurements but you are running behind.',
'[{"id":"a","text":"I would double-check anyway; fixing mistakes later takes even more time.","points":10},
{"id":"b","text":"I would skip the check if I am confident in my work.","points":4},
{"id":"c","text":"I would ask someone else to check while I keep working.","points":8},
{"id":"d","text":"I would do a quick glance instead of a full check.","points":5}]',
'Quality Control', 'Tests thoroughness under pressure', true, 40),

('technical', 'performance_habits', 'mcq', 'You need a certification renewed but the deadline is in 3 weeks.',
'[{"id":"a","text":"I would schedule it this week to avoid last-minute issues.","points":10},
{"id":"b","text":"I would wait until next week to book it.","points":7},
{"id":"c","text":"I would handle it the week before it expires.","points":5},
{"id":"d","text":"I would renew it if my employer reminds me.","points":3}]',
'HR Manager', 'Tests proactive planning', true, 40),

('technical', 'performance_habits', 'mcq', 'You finish a task early and there are 30 minutes before the next one.',
'[{"id":"a","text":"I would ask the supervisor if there is anything else to prep or help with.","points":10},
{"id":"b","text":"I would start setting up for the next task.","points":9},
{"id":"c","text":"I would take a break since I earned it.","points":5},
{"id":"d","text":"I would wait for someone to tell me what is next.","points":4}]',
'Team Lead', 'Tests initiative and work ethic', true, 40),

('technical', 'performance_habits', 'mcq', 'Documentation says one thing but experienced workers do it differently.',
'[{"id":"a","text":"I would follow documentation but ask why the difference exists.","points":10},
{"id":"b","text":"I would do what experienced workers do since they know best.","points":6},
{"id":"c","text":"I would follow documentation exactly no matter what.","points":7},
{"id":"d","text":"I would ask the supervisor which way they prefer.","points":8}]',
'Operations Manager', 'Tests judgment and learning mindset', true, 40);

-- Technical - Applied Thinking (6 questions)
INSERT INTO cert_questions (sector, category, question_type, scenario, choices, mirror_role, mirror_context, randomize_order, time_limit_seconds) VALUES
('technical', 'applied_thinking', 'mcq', 'A critical component arrives damaged and there is no immediate replacement.',
'[{"id":"a","text":"I would assess alternatives, contact the supplier, and present options to the supervisor with timeline impacts.","points":10},
{"id":"b","text":"I would try to repair it temporarily and mention it later.","points":6},
{"id":"c","text":"I would stop work and wait for a replacement.","points":5},
{"id":"d","text":"I would ask the team what they think we should do.","points":7}]',
'Project Manager', 'Tests solution-focused thinking', true, 40),

('technical', 'applied_thinking', 'mcq', 'The project is falling behind because tasks are not clearly divided.',
'[{"id":"a","text":"I would suggest a quick team meeting to clarify roles and create a simple task list.","points":10},
{"id":"b","text":"I would just focus on what I know needs to be done.","points":6},
{"id":"c","text":"I would wait for the supervisor to organize us.","points":4},
{"id":"d","text":"I would volunteer to coordinate if no one else does.","points":9}]',
'Team Lead', 'Tests organizational thinking', true, 40),

('technical', 'applied_thinking', 'mcq', 'A measurement error is discovered after work has started.',
'[{"id":"a","text":"I would stop, assess how much is affected, and present options (redo vs. adjust) with cost and time implications.","points":10},
{"id":"b","text":"I would redo everything to be safe.","points":7},
{"id":"c","text":"I would see if we can adjust going forward without redoing.","points":6},
{"id":"d","text":"I would report it to the supervisor and wait for instructions.","points":5}]',
'Client', 'Tests analytical problem-solving', true, 40),

('technical', 'applied_thinking', 'mcq', 'Your usual supplier is out of stock but the job starts tomorrow.',
'[{"id":"a","text":"I would find alternative suppliers, compare options, and recommend the best choice with reasoning.","points":10},
{"id":"b","text":"I would order from whoever has stock, regardless of quality.","points":4},
{"id":"c","text":"I would ask the supervisor to delay the start date.","points":6},
{"id":"d","text":"I would check if we have extra materials from previous jobs.","points":8}]',
'Procurement', 'Tests resourcefulness', true, 40),

('technical', 'applied_thinking', 'mcq', 'The client wants to add extra work but does not want to adjust the timeline.',
'[{"id":"a","text":"I would explain the realistic options: adjust scope, timeline, or resources and let them choose.","points":10},
{"id":"b","text":"I would say yes and try to make it work somehow.","points":5},
{"id":"c","text":"I would refuse and stick to the original plan.","points":6},
{"id":"d","text":"I would tell them to discuss it with the manager.","points":4}]',
'Client', 'Tests negotiation and boundary-setting', true, 40),

('technical', 'applied_thinking', 'mcq', 'A new tool could save time but you have never used it before.',
'[{"id":"a","text":"I would learn it on my own time and propose a trial on a small task first.","points":10},
{"id":"b","text":"I would stick with what I know to avoid mistakes.","points":5},
{"id":"c","text":"I would ask if training is available before trying it.","points":8},
{"id":"d","text":"I would wait until the company requires it.","points":3}]',
'Operations Manager', 'Tests growth mindset and initiative', true, 40);

-- DIGITAL SECTOR QUESTIONS (25 questions across 4 categories)

-- Digital - Mindset (7 questions)
INSERT INTO cert_questions (sector, category, question_type, scenario, choices, mirror_role, mirror_context, randomize_order, time_limit_seconds) VALUES
('digital', 'mindset', 'mcq', 'A client rejects your design twice and says it is not what they imagined.',
'[{"id":"a","text":"I would ask for concrete examples or references, then adjust with clear expectations on timeline.","points":10},
{"id":"b","text":"I would redo it entirely from scratch to show commitment.","points":7},
{"id":"c","text":"I would explain that they approved the earlier version and defend my choices.","points":4},
{"id":"d","text":"I would wait for the manager to step in and decide.","points":3}]',
'Client', 'Tests expectation management and solution focus', true, 40),

('digital', 'mindset', 'mcq', 'You deployed code that broke a feature users rely on.',
'[{"id":"a","text":"I would roll back immediately, notify the team, and propose a fix with testing.","points":10},
{"id":"b","text":"I would fix it as fast as possible without telling anyone.","points":4},
{"id":"c","text":"I would post in Slack that I am working on it.","points":7},
{"id":"d","text":"I would explain that it worked in testing and was not my fault.","points":2}]',
'Technical Lead', 'Shows ownership versus blame-shifting', true, 40),

('digital', 'mindset', 'mcq', 'A teammate criticizes your approach publicly in a meeting.',
'[{"id":"a","text":"I would stay calm, ask them to elaborate, and discuss solutions after the meeting privately.","points":10},
{"id":"b","text":"I would defend my approach immediately with examples.","points":6},
{"id":"c","text":"I would suggest taking this offline and move on.","points":8},
{"id":"d","text":"I would stay quiet and bring it up with my manager later.","points":5}]',
'Manager', 'Tests emotional regulation and professionalism', true, 40),

('digital', 'mindset', 'mcq', 'You are stuck on a problem for 3 hours and the deadline is tomorrow.',
'[{"id":"a","text":"I would post in team chat with context and ask for a quick pair review.","points":10},
{"id":"b","text":"I would keep trying different approaches on my own.","points":5},
{"id":"c","text":"I would Google it until I find a solution.","points":6},
{"id":"d","text":"I would tell my manager I need more time.","points":4}]',
'Tech Lead', 'Tests knowing when to ask for help', true, 40),

('digital', 'mindset', 'mcq', 'Your remote team is in 3 different time zones and communication is chaotic.',
'[{"id":"a","text":"I would propose asynchronous standups with a shared doc and clear response windows.","points":10},
{"id":"b","text":"I would schedule a call when everyone is available.","points":7},
{"id":"c","text":"I would just message people individually as needed.","points":5},
{"id":"d","text":"I would wait for the manager to set a system.","points":4}]',
'Remote Team Lead', 'Tests remote work organization', true, 40),

('digital', 'mindset', 'mcq', 'A feature you built is being removed because priorities changed.',
'[{"id":"a","text":"I would ask what we learned from it and document it for future reference.","points":10},
{"id":"b","text":"I would accept it but feel frustrated about the wasted effort.","points":6},
{"id":"c","text":"I would question why we built it in the first place.","points":5},
{"id":"d","text":"I would remove it quickly without discussing.","points":7}]',
'Product Manager', 'Tests adaptability and growth mindset', true, 40),

('digital', 'mindset', 'mcq', 'A non-technical stakeholder keeps asking for updates on technical work.',
'[{"id":"a","text":"I would create a simple status tracker they can check anytime, with plain-language updates.","points":10},
{"id":"b","text":"I would send them daily updates even if nothing changed.","points":6},
{"id":"c","text":"I would tell them to ask my manager for updates.","points":4},
{"id":"d","text":"I would explain the technical details so they understand.","points":5}]',
'Stakeholder', 'Tests communication across skill gaps', true, 40);

-- Digital - Workplace Intelligence (6 questions)
INSERT INTO cert_questions (sector, category, question_type, scenario, choices, mirror_role, mirror_context, randomize_order, time_limit_seconds) VALUES
('digital', 'workplace_intelligence', 'mcq', 'Your manager assigns you a task you do not know how to do.',
'[{"id":"a","text":"I would research it first, then ask specific questions about gaps in my understanding.","points":10},
{"id":"b","text":"I would start working and figure it out as I go.","points":6},
{"id":"c","text":"I would ask them to assign it to someone more experienced.","points":4},
{"id":"d","text":"I would ask for detailed instructions before starting.","points":8}]',
'Manager', 'Tests learning agility', true, 40),

('digital', 'workplace_intelligence', 'mcq', 'Feedback from code review is harsh and feels personal.',
'[{"id":"a","text":"I would focus on the technical points, ask clarifying questions, and thank them for the review.","points":10},
{"id":"b","text":"I would fix the code but feel demotivated.","points":5},
{"id":"c","text":"I would defend my decisions point by point.","points":4},
{"id":"d","text":"I would talk to my manager about the tone used.","points":6}]',
'Senior Developer', 'Tests professional maturity', true, 40),

('digital', 'workplace_intelligence', 'mcq', 'You notice a process that wastes time every week.',
'[{"id":"a","text":"I would document the issue, propose a solution, and ask for 15 minutes to present it.","points":10},
{"id":"b","text":"I would mention it in Slack and see if others agree.","points":7},
{"id":"c","text":"I would just work around it myself.","points":5},
{"id":"d","text":"I would complain about it but not suggest changes.","points":2}]',
'Team Lead', 'Tests initiative and systems thinking', true, 40),

('digital', 'workplace_intelligence', 'mcq', 'A client gives vague feedback saying it just does not feel right.',
'[{"id":"a","text":"I would ask them to show examples of what does feel right and identify specific elements.","points":10},
{"id":"b","text":"I would make random changes and ask if it is better.","points":4},
{"id":"c","text":"I would explain my design decisions to convince them.","points":5},
{"id":"d","text":"I would start over with a completely different approach.","points":6}]',
'Client', 'Tests clarification skills', true, 40),

('digital', 'workplace_intelligence', 'mcq', 'Your team uses a tool you are unfamiliar with.',
'[{"id":"a","text":"I would spend focused time learning it and ask teammates for best practices.","points":10},
{"id":"b","text":"I would learn as I work on real tasks.","points":7},
{"id":"c","text":"I would ask teammates to help me every time I need it.","points":5},
{"id":"d","text":"I would suggest using a tool I already know instead.","points":3}]',
'Manager', 'Tests adaptability', true, 40),

('digital', 'workplace_intelligence', 'mcq', 'A bug appears only in production, not in testing.',
'[{"id":"a","text":"I would reproduce it locally, compare environments, and document the difference.","points":10},
{"id":"b","text":"I would apply a quick fix directly in production.","points":4},
{"id":"c","text":"I would rollback and investigate offline.","points":8},
{"id":"d","text":"I would escalate to DevOps to figure out.","points":6}]',
'Tech Lead', 'Tests debugging methodology', true, 40);

-- Digital - Performance Habits (6 questions)
INSERT INTO cert_questions (sector, category, question_type, scenario, choices, mirror_role, mirror_context, randomize_order, time_limit_seconds) VALUES
('digital', 'performance_habits', 'mcq', 'You are blocked waiting for another team API endpoint.',
'[{"id":"a","text":"I would mock the endpoint, continue building, and document what I need from them.","points":10},
{"id":"b","text":"I would message them every hour for updates.","points":4},
{"id":"c","text":"I would work on something else until they are done.","points":7},
{"id":"d","text":"I would escalate to my manager right away.","points":5}]',
'Project Manager', 'Tests autonomy and unblocking skills', true, 40),

('digital', 'performance_habits', 'mcq', 'A meeting runs over and you have a deadline in 2 hours.',
'[{"id":"a","text":"I would politely excuse myself, commit to catching up async, and get back to work.","points":10},
{"id":"b","text":"I would stay in the meeting and work late to finish.","points":6},
{"id":"c","text":"I would ask for a deadline extension since the meeting ran over.","points":5},
{"id":"d","text":"I would message in the chat that I have to drop.","points":8}]',
'Manager', 'Tests time management', true, 40),

('digital', 'performance_habits', 'mcq', 'You committed to finishing a feature by Friday but realize Monday it is more complex than expected.',
'[{"id":"a","text":"I would update the team on Tuesday with revised estimates and a clear plan.","points":10},
{"id":"b","text":"I would work extra hours to hit Friday no matter what.","points":6},
{"id":"c","text":"I would mention it Friday that it is not done.","points":3},
{"id":"d","text":"I would deliver a partial version on Friday.","points":7}]',
'Product Manager', 'Tests proactive communication', true, 40),

('digital', 'performance_habits', 'mcq', 'Code reviews are taking 2-3 days and slowing everyone down.',
'[{"id":"a","text":"I would propose a 24-hour review SLA and volunteer to help review code.","points":10},
{"id":"b","text":"I would just keep working on new features while waiting.","points":5},
{"id":"c","text":"I would complain about it in standup.","points":3},
{"id":"d","text":"I would ping the reviewer directly after 1 day.","points":8}]',
'Engineering Manager', 'Tests team improvement mindset', true, 40),

('digital', 'performance_habits', 'mcq', 'A critical bug is reported Friday at 4 PM.',
'[{"id":"a","text":"I would assess severity, fix if it is a quick change, otherwise communicate timeline clearly.","points":10},
{"id":"b","text":"I would fix it immediately no matter how long it takes.","points":7},
{"id":"c","text":"I would log it and plan to fix it Monday.","points":5},
{"id":"d","text":"I would check if someone else can handle it.","points":4}]',
'Support Team', 'Tests judgment on urgency', true, 40),

('digital', 'performance_habits', 'mcq', 'Your work setup at home is causing back pain and reduced focus.',
'[{"id":"a","text":"I would request ergonomic equipment and adjust my schedule for regular breaks.","points":10},
{"id":"b","text":"I would tough it out since remote work is a privilege.","points":3},
{"id":"c","text":"I would work from a cafe sometimes for variety.","points":6},
{"id":"d","text":"I would mention it to HR and see if they offer anything.","points":8}]',
'HR Manager', 'Tests self-advocacy and health awareness', true, 40);

-- Digital - Applied Thinking (6 questions)
INSERT INTO cert_questions (sector, category, question_type, scenario, choices, mirror_role, mirror_context, randomize_order, time_limit_seconds) VALUES
('digital', 'applied_thinking', 'mcq', 'The client wants a feature that would require rebuilding core architecture.',
'[{"id":"a","text":"I would explain the trade-offs, propose a phased approach, and show what is possible within current structure.","points":10},
{"id":"b","text":"I would say it is not possible with our current setup.","points":5},
{"id":"c","text":"I would start building it and figure it out as I go.","points":4},
{"id":"d","text":"I would recommend they hire a specialist for that.","points":3}]',
'Client', 'Tests technical communication', true, 40),

('digital', 'applied_thinking', 'mcq', 'Performance issues appear after a new feature launches.',
'[{"id":"a","text":"I would profile the system, identify bottlenecks, and prioritize fixes by user impact.","points":10},
{"id":"b","text":"I would roll back the feature immediately.","points":6},
{"id":"c","text":"I would optimize the most obvious slow code.","points":7},
{"id":"d","text":"I would add caching everywhere and hope it helps.","points":4}]',
'Tech Lead', 'Tests systematic problem-solving', true, 40),

('digital', 'applied_thinking', 'mcq', 'Three different stakeholders want conflicting features this sprint.',
'[{"id":"a","text":"I would document all requests, present trade-offs, and facilitate a prioritization discussion.","points":10},
{"id":"b","text":"I would build the one I think is most important.","points":5},
{"id":"c","text":"I would try to build all three partially.","points":4},
{"id":"d","text":"I would escalate to my manager to decide.","points":7}]',
'Product Manager', 'Tests stakeholder management', true, 40),

('digital', 'applied_thinking', 'mcq', 'Legacy code is blocking new features but there is no time to refactor.',
'[{"id":"a","text":"I would build a thin adapter layer to isolate new code, and propose refactoring as a separate initiative.","points":10},
{"id":"b","text":"I would refactor it anyway since it is the right thing to do.","points":6},
{"id":"c","text":"I would work around it even if it means duplicating code.","points":5},
{"id":"d","text":"I would document the issue and build on top of legacy.","points":7}]',
'Engineering Manager', 'Tests pragmatic architecture thinking', true, 40),

('digital', 'applied_thinking', 'mcq', 'A security vulnerability is discovered in a library you use.',
'[{"id":"a","text":"I would assess impact, update dependencies, test thoroughly, and document the change.","points":10},
{"id":"b","text":"I would update immediately without testing.","points":4},
{"id":"c","text":"I would wait for the library maintainers to release a fix.","points":5},
{"id":"d","text":"I would check if we are actually affected before doing anything.","points":8}]',
'Security Lead', 'Tests security awareness', true, 40),

('digital', 'applied_thinking', 'mcq', 'Your API is getting rate-limited by a third-party service.',
'[{"id":"a","text":"I would implement request queuing, add retries with backoff, and monitor usage patterns.","points":10},
{"id":"b","text":"I would just increase the rate limit on our end.","points":3},
{"id":"c","text":"I would cache responses to reduce requests.","points":8},
{"id":"d","text":"I would contact the provider to increase our limit.","points":6}]',
'Tech Lead', 'Tests technical problem-solving', true, 40);