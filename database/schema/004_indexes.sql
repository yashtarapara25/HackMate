-- HackMate AI — Neon PostgreSQL Indexing Configuration
-- 004_indexes.sql
-- Optimizes query execution paths for high concurrent usage.

-- 1. users indexes
CREATE INDEX IF NOT EXISTS idx_users_email_active ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_university ON users(university_id);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);

-- 2. user_roles_join indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_composite ON user_roles_join(user_id, role_id);

-- 3. sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- 4. teams indexes
CREATE INDEX IF NOT EXISTS idx_teams_hackathon ON teams(hackathon_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_name_active ON teams(hackathon_id, name) WHERE deleted_at IS NULL;

-- 5. team_members indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_members_unique ON team_members(team_id, user_id);

-- 6. team_invitations indexes
CREATE INDEX IF NOT EXISTS idx_invitations_search ON team_invitations(team_id, email, status);

-- 7. problem_statements indexes
CREATE INDEX IF NOT EXISTS idx_problems_team ON problem_statements(team_id);

-- 8. pain_points indexes
CREATE INDEX IF NOT EXISTS idx_pain_points_statement ON pain_points(problem_statement_id);

-- 9. solution_concepts indexes
CREATE INDEX IF NOT EXISTS idx_solutions_team ON solution_concepts(team_id);

-- 10. idea_votes indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_voter_concept ON idea_votes(concept_id, voter_id);

-- 11. discussion_channels indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_channels_name_active ON discussion_channels(team_id, name) WHERE deleted_at IS NULL;

-- 12. messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_timeline ON messages(channel_id, created_at DESC);

-- 13. tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_team_status ON tasks(team_id, status) WHERE deleted_at IS NULL;

-- 14. task_assignments indexes
CREATE INDEX IF NOT EXISTS idx_task_assignments_composite ON task_assignments(task_id, user_id);

-- 15. task_comments indexes
CREATE INDEX IF NOT EXISTS idx_task_comments_list ON task_comments(task_id, created_at DESC);

-- 16. documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_team ON documents(team_id);

-- 17. document_versions indexes
CREATE INDEX IF NOT EXISTS idx_doc_versions_desc ON document_versions(document_id, version_number DESC);

-- 18. meeting_notes indexes
CREATE INDEX IF NOT EXISTS idx_meeting_notes_team ON meeting_notes(team_id, meeting_date DESC);

-- 19. architecture_files indexes
CREATE INDEX IF NOT EXISTS idx_arch_files_team ON architecture_files(team_id);

-- 20. presentations indexes
CREATE INDEX IF NOT EXISTS idx_presentations_team ON presentations(team_id);

-- 21. presentation_versions indexes
CREATE INDEX IF NOT EXISTS idx_pres_versions_desc ON presentation_versions(presentation_id, version_number DESC);

-- 22. notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);

-- 23. activity_logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_team ON activity_logs(team_id, created_at DESC);

-- 24. badge_awards indexes
CREATE INDEX IF NOT EXISTS idx_badge_awards_composite ON badge_awards(user_id, badge_id);

-- 25. judge_reviews indexes
CREATE INDEX IF NOT EXISTS idx_judge_reviews_team ON judge_reviews(team_id);

-- 26. settings indexes
CREATE INDEX IF NOT EXISTS idx_settings_user ON settings(user_id);

-- 27. archived_projects indexes
CREATE INDEX IF NOT EXISTS idx_arch_projects_team ON archived_projects(team_id);
-- GIN index to optimize array element searches inside the tech stack
CREATE INDEX IF NOT EXISTS idx_arch_projects_tech ON archived_projects USING GIN (technology_stack);

-- 28. knowledge_hub_articles indexes
-- GIN index for search tags
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_tags ON knowledge_hub_articles USING GIN (tags);
