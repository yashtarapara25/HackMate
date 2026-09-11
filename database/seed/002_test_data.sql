-- HackMate AI — Neon PostgreSQL Test Data
-- 009_test_data.sql
-- Injects mock students, teams, channels, messages, tasks, and reviews matching the frontend.

-- ==========================================
-- 1. SEED MOCK USERS (STUDENTS & FACULTY)
-- ==========================================
-- Password hashes default to '$2b$12$eImiTXuWV5jihJQCl6S1uOwE.tSgBfVshgJqK4BfUXs9jGjL8jGfS' which represents 'password123'
INSERT INTO users (id, email, hashed_password, full_name, avatar_url, university_id, department_id, skills, xp_score) VALUES
('m-1-4a81-432d-9477-d35272a8c3d1', 'alex@bytecraft.io', '$2b$12$eImiTXuWV5jihJQCl6S1uOwE.tSgBfVshgJqK4BfUXs9jGjL8jGfS', 'Alex Rivers', 'AR', 'aa14fe4c-d198-4c12-888e-64dfd236aa08', 'b34e5651-d4ea-4c91-a1e6-c1dfd4e6aa02', '{"React", "Node.js", "MongoDB", "System Design"}', 940),
('m-2-4a81-432d-9477-d35272a8c3d2', 'sophia@bytecraft.io', '$2b$12$eImiTXuWV5jihJQCl6S1uOwE.tSgBfVshgJqK4BfUXs9jGjL8jGfS', 'Sophia Chen', 'SC', 'bb24fe4c-d198-4c12-888e-64dfd236bb09', 'd56e5651-d4ea-4c91-a1e6-c1dfd4e6dd05', '{"Figma", "CSS Grid", "Vanilla JS", "Aesthetics"}', 880),
('m-3-4a81-432d-9477-d35272a8c3d3', 'marcus@bytecraft.io', '$2b$12$eImiTXuWV5jihJQCl6S1uOwE.tSgBfVshgJqK4BfUXs9jGjL8jGfS', 'Marcus Vance', 'MV', 'aa14fe4c-d198-4c12-888e-64dfd236aa08', 'c45e5651-d4ea-4c91-a1e6-c1dfd4e6bb03', '{"Go", "Docker", "PostgreSQL", "Google Cloud"}', 900),
('m-4-4a81-432d-9477-d35272a8c3d4', 'elena@bytecraft.io', '$2b$12$eImiTXuWV5jihJQCl6S1uOwE.tSgBfVshgJqK4BfUXs9jGjL8jGfS', 'Elena Rostova', 'ER', 'cc34fe4c-d198-4c12-888e-64dfd236cc10', 'e67e5651-d4ea-4c91-a1e6-c1dfd4e6dd05', '{"Python", "PyTorch", "LLMs", "Vector DBs"}', 960),
('f-1-4a81-432d-9477-d35272a8c3e1', 'vikram@stanford.edu', '$2b$12$eImiTXuWV5jihJQCl6S1uOwE.tSgBfVshgJqK4BfUXs9jGjL8jGfS', 'Dr. Vikram Sen', 'VS', 'aa14fe4c-d198-4c12-888e-64dfd236aa08', 'b34e5651-d4ea-4c91-a1e6-c1dfd4e6aa02', '{"Distributed Architectures", "Database Scaling"}', 1000),
('a-1-4a81-432d-9477-d35272a8c3f1', 'admin@hackmate.ai', '$2b$12$eImiTXuWV5jihJQCl6S1uOwE.tSgBfVshgJqK4BfUXs9jGjL8jGfS', 'Organiser Admin', 'AD', 'aa14fe4c-d198-4c12-888e-64dfd236aa08', 'b34e5651-d4ea-4c91-a1e6-c1dfd4e6aa02', '{}', 1000)
ON CONFLICT (email) DO NOTHING;

-- Bind Roles to Users
INSERT INTO user_roles_join (user_id, role_id) VALUES
('m-1-4a81-432d-9477-d35272a8c3d1', '55e03f4a-81a1-432d-9477-d35272a8c3d5'), -- Student
('m-2-4a81-432d-9477-d35272a8c3d2', '55e03f4a-81a1-432d-9477-d35272a8c3d5'), -- Student
('m-3-4a81-432d-9477-d35272a8c3d3', '55e03f4a-81a1-432d-9477-d35272a8c3d5'), -- Student
('m-4-4a81-432d-9477-d35272a8c3d4', '55e03f4a-81a1-432d-9477-d35272a8c3d5'), -- Student
('f-1-4a81-432d-9477-d35272a8c3e1', '22b03f4a-81a1-432d-9477-d35272a8c3d2'), -- Faculty
('a-1-4a81-432d-9477-d35272a8c3f1', '11a03f4a-81a1-432d-9477-d35272a8c3d1')  -- Super Admin
ON CONFLICT DO NOTHING;

-- ==========================================
-- 2. SEED TEAMS & MEMBERSHIP
-- ==========================================
INSERT INTO teams (id, name, avatar, hackathon_id, leader_id, progress_percentage, health_score) VALUES
('t-1-bytecraft-workspace-id', 'ByteCraft', 'BC', 'ghf-2026-c198-4c12-888e-64dfd236aa08', 'm-1-4a81-432d-9477-d35272a8c3d1', 68, 94)
ON CONFLICT DO NOTHING;

INSERT INTO team_members (team_id, user_id, role_in_team, availability_percentage) VALUES
('t-1-bytecraft-workspace-id', 'm-1-4a81-432d-9477-d35272a8c3d1', 'Team Lead & Full-Stack Engineer', 100),
('t-1-bytecraft-workspace-id', 'm-2-4a81-432d-9477-d35272a8c3d2', 'UI/UX Designer & Frontend Dev', 95),
('t-1-bytecraft-workspace-id', 'm-3-4a81-432d-9477-d35272a8c3d3', 'Backend & DevOps Engineer', 90),
('t-1-bytecraft-workspace-id', 'm-4-4a81-432d-9477-d35272a8c3d4', 'AI/ML Scientist', 85)
ON CONFLICT DO NOTHING;

-- ==========================================
-- 3. SEED INVITATIONS
-- ==========================================
INSERT INTO team_invitations (team_id, email, suggested_role, status, expires_at) VALUES
('t-1-bytecraft-workspace-id', 'david@kim.dev', 'QA Engineer', 'pending', '2026-07-22T09:00:00Z')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 4. SEED PROBLEM & SOLUTIONS LAB
-- ==========================================
INSERT INTO problem_statements (id, team_id, core_statement) VALUES
('p-1-bytecraft-problem', 't-1-bytecraft-workspace-id', 'Traditional hackathons suffer from fragmented team communications, where planning, coding, documenting, and presenting are split across multiple disjointed tools (Discord, WhatsApp, Notion, Trello, Slides), leading to loss of context, alignment issues, and project abandonment.')
ON CONFLICT DO NOTHING;

INSERT INTO pain_points (problem_statement_id, text, votes_count) VALUES
('p-1-bytecraft-problem', 'Context switching: Developers waste up to 30 mins an hour jumping between chat, tasks, and documentation.', 4),
('p-1-bytecraft-problem', 'Loss of ideas: Great ideas discussed in casual chats get buried and lost over the 48-hour sprint.', 3),
('p-1-bytecraft-problem', 'Pitch and code mismatch: The final pitch slides often describe features that the team could not complete, creating friction with judges.', 4)
ON CONFLICT DO NOTHING;

INSERT INTO solution_concepts (id, team_id, author_id, title, description, pros, cons, average_score, votes_count) VALUES
('idea-1-hackmate-ai', 't-1-bytecraft-workspace-id', 'm-1-4a81-432d-9477-d35272a8c3d1', 'HackMate AI - Unified Workspace', 'An integrated command center matching the hackathon lifecycle: chat, voting, tasks, system diagrams, and pitch slides synced in real time.', '{"Eliminates context switching", "Keeps everyone aligned on the same board", "Auto-generates pitch skeleton from tasks"}', '{"Requires high engineering effort for 48h MVP", "Needs robust offline-first synchronization"}', 4.88, 4),
('idea-2-slidesynth', 't-1-bytecraft-workspace-id', 'm-2-4a81-432d-9477-d35272a8c3d2', 'SlideSynth - Auto Pitch Deck Builder', 'A tool that watches github commits and commits descriptive summary slides to Google Slides automatically.', '{"Very high wow-factor for judges", "Keeps slides 100% updated with git logs"}', '{"Hard to control layout design quality automatically", "Does not solve team communication issues"}', 3.50, 2)
ON CONFLICT DO NOTHING;

INSERT INTO idea_votes (concept_id, voter_id, rating, comment) VALUES
('idea-1-hackmate-ai', 'm-1-4a81-432d-9477-d35272a8c3d1', 5.0, 'This solves our exact problem. Meta and high utility.'),
('idea-1-hackmate-ai', 'm-2-4a81-432d-9477-d35272a8c3d2', 5.0, 'Love the UI concepts. Clean and dashboard-focused.'),
('idea-1-hackmate-ai', 'm-3-4a81-432d-9477-d35272a8c3d3', 4.5, 'Highly feasible if we build frontend-only prototypes.'),
('idea-1-hackmate-ai', 'm-4-4a81-432d-9477-d35272a8c3d4', 5.0, 'I can build the prompt-to-checklist feature easily.'),
('idea-2-slidesynth', 'm-2-4a81-432d-9477-d35272a8c3d2', 4.0, 'Good backup idea but maybe too narrow.'),
('idea-2-slidesynth', 'm-1-4a81-432d-9477-d35272a8c3d1', 3.0, 'APIs might limit customization during presentation.')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 5. SEED DISCUSSION BOARD
-- ==========================================
INSERT INTO discussion_channels (id, team_id, name, topic) VALUES
('ch-1-general', 't-1-bytecraft-workspace-id', 'general', 'General team announcements and chat'),
('ch-2-frontend', 't-1-bytecraft-workspace-id', 'frontend', 'CSS, design tokens, HTML layouts'),
('ch-3-backend', 't-1-bytecraft-workspace-id', 'backend', 'Server configs, routers, APIs'),
('ch-4-database', 't-1-bytecraft-workspace-id', 'database', 'Schemas, migrations, indexes')
ON CONFLICT DO NOTHING;

INSERT INTO messages (channel_id, sender_id, text, reactions) VALUES
('ch-1-general', 'm-1-4a81-432d-9477-d35272a8c3d1', 'Welcome to Global HackFest 2026! 🚀 Let''s build HackMate AI.', '[{"emoji": "🔥", "count": 3}]'),
('ch-1-general', 'm-2-4a81-432d-9477-d35272a8c3d2', 'Design system skeleton is ready in variables.css. It''s beautiful!', '[{"emoji": "🎨", "count": 2}, {"emoji": "🚀", "count": 2}]'),
('ch-1-general', 'm-3-4a81-432d-9477-d35272a8c3d3', 'Great. I am preparing the local development server configurations.', '[]')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 6. SEED TASKS BOARD
-- ==========================================
INSERT INTO tasks (id, team_id, title, description, status, priority, progress_percentage) VALUES
('tk-1-design-vars', 't-1-bytecraft-workspace-id', 'Establish Design System Variables', 'Implement variables.css and global.css to lock in the dark mode palette, fonts, spacing and glassmorphism components.', 'completed', 'high', 100),
('tk-2-design-sidebar', 't-1-bytecraft-workspace-id', 'Design Left Sidebar Layout', 'Construct the collapsible left panel incorporating team profile switcher and page navigation items.', 'completed', 'high', 100),
('tk-3-mock-setup', 't-1-bytecraft-workspace-id', 'Mock Data Layer Setup', 'Create mock-data.js compiling mock structures for dashboard, team lists, solution labs, and chat feeds.', 'in_progress', 'medium', 80),
('tk-4-render-charts', 't-1-bytecraft-workspace-id', 'Render Interactive Charts', 'Configure ApexCharts inside team-insights.html to display velocity metrics, user contributions, and task pipelines.', 'todo', 'medium', 0)
ON CONFLICT DO NOTHING;

-- Bind Task Assignments
INSERT INTO task_assignments (task_id, user_id) VALUES
('tk-1-design-vars', 'm-2-4a81-432d-9477-d35272a8c3d2'),
('tk-2-design-sidebar', 'm-2-4a81-432d-9477-d35272a8c3d2'),
('tk-3-mock-setup', 'm-1-4a81-432d-9477-d35272a8c3d1'),
('tk-4-render-charts', 'm-1-4a81-432d-9477-d35272a8c3d1')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 7. SEED WORKSPACE DOCUMENTS
-- ==========================================
INSERT INTO documents (id, team_id, title, folder_name) VALUES
('doc-1-mvp-spec', 't-1-bytecraft-workspace-id', 'Product Spec MVP', 'Requirements'),
('doc-2-comp-analysis', 't-1-bytecraft-workspace-id', 'Competitor Analysis', 'Research')
ON CONFLICT DO NOTHING;

INSERT INTO document_versions (document_id, version_number, content, author_id) VALUES
('doc-1-mvp-spec', 1, '### HackMate AI - Functional Specification\n\nGoal: Provide a cohesive hackathon experience.\n\nFeatures:\n1. Core dashboard detailing sprint statuses\n2. Idea boards supporting vote mechanics\n3. Integrated chat rooms mapping subteams\n4. Kanban schedules assigning cards\n5. Static architecture diagrams plotting workflows', 'm-1-4a81-432d-9477-d35272a8c3d1'),
('doc-2-comp-analysis', 1, '### Competitors:\n- Discord: Great chat, poor planning.\n- Notion: Beautiful doc layout, bad team synchronization/realtime flow.\n- Trello: Fast cards, separate workspace context.', 'm-2-4a81-432d-9477-d35272a8c3d2')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 8. SEED PRESENTATION SLIDES
-- ==========================================
INSERT INTO presentations (id, team_id, file_name, file_size_bytes, current_version) VALUES
('pres-1-bytecraft', 't-1-bytecraft-workspace-id', 'HackMate_AI_Pitch_Draft.pptx', 6081792, 1)
ON CONFLICT DO NOTHING;

INSERT INTO presentation_versions (presentation_id, version_number, file_path, uploader_id) VALUES
('pres-1-bytecraft', 1, 'https://s3.amazonaws.com/hackmate-files/ghf-2026/teams/t-1/presentations/v1_pitch_draft.pptx', 'm-1-4a81-432d-9477-d35272a8c3d1')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 9. SEED JUDGES REVIEW
-- ==========================================
INSERT INTO judge_reviews (team_id, reviewer_id, scoring_rubric, final_score, feedback_comments) VALUES
('t-1-bytecraft-workspace-id', 'f-1-4a81-432d-9477-d35272a8c3e1', '{"innovation": 9, "feasibility": 8, "presentation": 8.5, "completeness": 8}', 85.00, 'Stunning UI concept. Ensure you detail how team messaging synchronizes with the task tracker during conflicts.')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 10. SEED SETTINGS & NOTIFICATIONS
-- ==========================================
INSERT INTO settings (user_id, theme_preference, is_email_notify, is_push_notify) VALUES
('m-1-4a81-432d-9477-d35272a8c3d1', 'dark', TRUE, TRUE),
('m-2-4a81-432d-9477-d35272a8c3d2', 'light', TRUE, FALSE)
ON CONFLICT DO NOTHING;

INSERT INTO notifications (user_id, title, message, is_read) VALUES
('m-1-4a81-432d-9477-d35272a8c3d1', 'New Comment', 'Sophia Chen commented on task "Establish Design System Variables"', FALSE),
('m-1-4a81-432d-9477-d35272a8c3d1', 'Idea Leading', 'Idea "HackMate AI - Unified Workspace" is winning the voting rounds.', FALSE)
ON CONFLICT DO NOTHING;
