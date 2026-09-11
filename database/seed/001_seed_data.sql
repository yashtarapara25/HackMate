-- HackMate AI — Neon PostgreSQL Core Seed Data
-- 008_seed_data.sql
-- Injects static universities, departments, security roles, and badges.

-- ==========================================
-- 1. SEED UNIVERSITIES
-- ==========================================
INSERT INTO universities (id, name, email_domain) VALUES
('aa14fe4c-d198-4c12-888e-64dfd236aa08', 'Stanford University', 'stanford.edu'),
('bb24fe4c-d198-4c12-888e-64dfd236bb09', 'UC Berkeley', 'berkeley.edu'),
('cc34fe4c-d198-4c12-888e-64dfd236cc10', 'Massachusetts Institute of Technology', 'mit.edu')
ON CONFLICT (name) DO UPDATE SET email_domain = EXCLUDED.email_domain;

-- ==========================================
-- 2. SEED DEPARTMENTS
-- ==========================================
INSERT INTO departments (id, university_id, name) VALUES
('b34e5651-d4ea-4c91-a1e6-c1dfd4e6aa02', 'aa14fe4c-d198-4c12-888e-64dfd236aa08', 'Computer Science'),
('c45e5651-d4ea-4c91-a1e6-c1dfd4e6bb03', 'aa14fe4c-d198-4c12-888e-64dfd236aa08', 'Electrical Engineering'),
('d56e5651-d4ea-4c91-a1e6-c1dfd4e6cc04', 'bb24fe4c-d198-4c12-888e-64dfd236bb09', 'Cognitive Science & Design'),
('e67e5651-d4ea-4c91-a1e6-c1dfd4e6dd05', 'cc34fe4c-d198-4c12-888e-64dfd236cc10', 'Data Science & AI')
ON CONFLICT DO NOTHING;

-- ==========================================
-- 3. SEED SECURITY ROLES
-- ==========================================
INSERT INTO roles (id, name, description, permissions) VALUES
('11a03f4a-81a1-432d-9477-d35272a8c3d1', 'Super Admin', 'Platform Operations and System Administrators', '{"can_admin": true, "can_grade": true, "can_pitch": true, "can_manage_users": true}'),
('22b03f4a-81a1-432d-9477-d35272a8c3d2', 'Faculty', 'University Evaluators and Grading Committees', '{"can_admin": false, "can_grade": true, "can_pitch": false, "can_manage_users": false}'),
('33c03f4a-81a1-432d-9477-d35272a8c3d3', 'Hackathon Organizer', 'Event planners, category setup, and sponsor configurations', '{"can_admin": true, "can_grade": false, "can_pitch": false, "can_manage_users": false}'),
('44d03f4a-81a1-432d-9477-d35272a8c3d4', 'Mentor', 'Advisers supporting teams with critiques and suggestions', '{"can_admin": false, "can_grade": false, "can_pitch": false, "can_manage_users": false}'),
('55e03f4a-81a1-432d-9477-d35272a8c3d5', 'Student', 'Hackathon participants, team members, and leaders', '{"can_admin": false, "can_grade": false, "can_pitch": true, "can_manage_users": false}')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description, permissions = EXCLUDED.permissions;

-- ==========================================
-- 4. SEED BADGES
-- ==========================================
INSERT INTO badges (id, name, description, icon_url, xp_required) VALUES
('b1e03f4a-81a1-432d-9477-d35272a8c301', 'First Commit', 'Successfully committed your first task to completion', 'badge_first_commit.png', 50),
('b2e03f4a-81a1-432d-9477-d35272a8c302', 'Master Pitcher', 'Pitched a solution concept that received a rating above 4.5', 'badge_master_pitcher.png', 100),
('b3e03f4a-81a1-432d-9477-d35272a8c303', 'Sprint Hero', 'Completed 5 tasks within a single sprint window', 'badge_sprint_hero.png', 200),
('b4e03f4a-81a1-432d-9477-d35272a8c304', 'Grand Champion', 'Awarded 1st Place inside a finished hackathon event', 'badge_grand_champion.png', 500)
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description, xp_required = EXCLUDED.xp_required;

-- ==========================================
-- 5. SEED HACKATHONS
-- ==========================================
INSERT INTO hackathons (id, name, tagline, description, start_date, end_date, status, categories, sponsors) VALUES
('ghf-2026-c198-4c12-888e-64dfd236aa08', 'Global HackFest 2026', 'Building the Next Generation of Collaborative AI', 'A 48-hour global sprint challenge for students to pitch, model, build, and deploy collaboration tools.', '2026-07-16T09:00:00Z', '2026-07-18T09:00:00Z', 'active', '{"AI & Collaboration tools", "Developer productivity"}', '[{"name": "Google Cloud", "logo": "google.png"}, {"name": "GitHub", "logo": "github.png"}]'),
('eco-2026-c198-4c12-888e-64dfd236bb09', 'EcoHacks Climate Challenge', 'Green Tech for Smart Infrastructure', 'Brainstorm and build climate impact models, carbon monitors, and smart grids.', '2026-08-10T09:00:00Z', '2026-08-12T09:00:00Z', 'upcoming', '{"CleanTech", "Smart Infrastructure"}', '[{"name": "MongoDB", "logo": "mongodb.png"}]')
ON CONFLICT DO NOTHING;
