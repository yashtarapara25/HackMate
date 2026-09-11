-- HackMate AI — Neon PostgreSQL Triggers Configuration
-- 006_triggers.sql
-- Binds procedural functions to table mutations.

-- ==========================================
-- SECTION 1: Automatic updated_at Timestamps
-- ==========================================

-- 1. universities
CREATE TRIGGER trg_universities_updated_at
    BEFORE UPDATE ON universities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. departments
CREATE TRIGGER trg_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. users
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. roles
CREATE TRIGGER trg_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. hackathons
CREATE TRIGGER trg_hackathons_updated_at
    BEFORE UPDATE ON hackathons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. teams
CREATE TRIGGER trg_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. team_members
CREATE TRIGGER trg_team_members_updated_at
    BEFORE UPDATE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. team_invitations
CREATE TRIGGER trg_team_invitations_updated_at
    BEFORE UPDATE ON team_invitations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. problem_statements
CREATE TRIGGER trg_problem_statements_updated_at
    BEFORE UPDATE ON problem_statements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. pain_points
CREATE TRIGGER trg_pain_points_updated_at
    BEFORE UPDATE ON pain_points
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. solution_concepts
CREATE TRIGGER trg_solution_concepts_updated_at
    BEFORE UPDATE ON solution_concepts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. idea_votes
CREATE TRIGGER trg_idea_votes_updated_at
    BEFORE UPDATE ON idea_votes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. discussion_channels
CREATE TRIGGER trg_discussion_channels_updated_at
    BEFORE UPDATE ON discussion_channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 14. messages
CREATE TRIGGER trg_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. tasks
CREATE TRIGGER trg_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 16. task_comments
CREATE TRIGGER trg_task_comments_updated_at
    BEFORE UPDATE ON task_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 17. documents
CREATE TRIGGER trg_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 18. meeting_notes
CREATE TRIGGER trg_meeting_notes_updated_at
    BEFORE UPDATE ON meeting_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 19. architecture_files
CREATE TRIGGER trg_architecture_files_updated_at
    BEFORE UPDATE ON architecture_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 20. presentations
CREATE TRIGGER trg_presentations_updated_at
    BEFORE UPDATE ON presentations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 21. judge_reviews
CREATE TRIGGER trg_judge_reviews_updated_at
    BEFORE UPDATE ON judge_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 22. settings
CREATE TRIGGER trg_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 23. archived_projects
CREATE TRIGGER trg_archived_projects_updated_at
    BEFORE UPDATE ON archived_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 24. knowledge_hub_articles
CREATE TRIGGER trg_knowledge_hub_articles_updated_at
    BEFORE UPDATE ON knowledge_hub_articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ==========================================
-- SECTION 2: Dynamic Team Metric Calcs
-- ==========================================

-- Trigger to automatically recalculate team progress when tasks mutate
CREATE TRIGGER trg_tasks_calc_progress
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW EXECUTE FUNCTION recalculate_team_progress();


-- ==========================================
-- SECTION 3: Dynamic Log Event Trackers
-- ==========================================

-- 1. Tasks activity
CREATE TRIGGER trg_tasks_activity_log
    AFTER INSERT OR UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION log_team_activity();

-- 2. Idea pitches activity
CREATE TRIGGER trg_concepts_activity_log
    AFTER INSERT ON solution_concepts
    FOR EACH ROW EXECUTE FUNCTION log_team_activity();

-- 3. Slide deck uploads
CREATE TRIGGER trg_presentations_activity_log
    AFTER INSERT ON presentation_versions
    FOR EACH ROW EXECUTE FUNCTION log_team_activity();

-- 4. Document updates
CREATE TRIGGER trg_documents_activity_log
    AFTER INSERT ON document_versions
    FOR EACH ROW EXECUTE FUNCTION log_team_activity();


-- ==========================================
-- SECTION 4: High-Security Administrative Audit
-- ==========================================

-- Trigger audits for changes to roles
CREATE TRIGGER trg_roles_audit_log
    AFTER INSERT OR UPDATE OR DELETE ON roles
    FOR EACH ROW EXECUTE FUNCTION log_audit_changes();

-- Trigger audits for user role assignments
CREATE TRIGGER trg_user_roles_audit_log
    AFTER INSERT OR DELETE ON user_roles_join
    FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
