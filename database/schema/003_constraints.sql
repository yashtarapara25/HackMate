-- HackMate AI — Neon PostgreSQL Constraints Setup
-- 003_constraints.sql
-- Applies validation constraints, checks, and unique checks.

-- 1. users constraints
ALTER TABLE users
    ADD CONSTRAINT chk_users_xp CHECK (xp_score >= 0);

-- 2. hackathons constraints
ALTER TABLE hackathons
    ADD CONSTRAINT chk_hackathons_dates CHECK (end_date > start_date),
    ADD CONSTRAINT chk_hackathons_status CHECK (status IN ('upcoming', 'active', 'archived'));

-- 3. teams constraints
ALTER TABLE teams
    ADD CONSTRAINT chk_teams_progress CHECK (progress_percentage BETWEEN 0 AND 100),
    ADD CONSTRAINT chk_teams_health CHECK (health_score BETWEEN 0 AND 100);

-- 4. team_members constraints
ALTER TABLE team_members
    ADD CONSTRAINT chk_members_availability CHECK (availability_percentage BETWEEN 0 AND 100);

-- 5. team_invitations constraints
ALTER TABLE team_invitations
    ADD CONSTRAINT chk_invitations_status CHECK (status IN ('pending', 'accepted', 'declined'));

-- 6. idea_votes constraints
ALTER TABLE idea_votes
    ADD CONSTRAINT chk_votes_rating CHECK (rating BETWEEN 1.0 AND 5.0);

-- 7. tasks constraints
ALTER TABLE tasks
    ADD CONSTRAINT chk_tasks_status CHECK (status IN ('todo', 'in_progress', 'completed')),
    ADD CONSTRAINT chk_tasks_priority CHECK (priority IN ('low', 'medium', 'high')),
    ADD CONSTRAINT chk_tasks_progress CHECK (progress_percentage BETWEEN 0 AND 100);

-- 8. document_versions constraints
ALTER TABLE document_versions
    ADD CONSTRAINT chk_doc_version_num CHECK (version_number >= 1);

-- 9. presentations constraints
ALTER TABLE presentations
    ADD CONSTRAINT chk_presentations_size CHECK (file_size_bytes > 0),
    ADD CONSTRAINT chk_presentations_ver CHECK (current_version >= 1);

-- 10. presentation_versions constraints
ALTER TABLE presentation_versions
    ADD CONSTRAINT chk_pres_version_num CHECK (version_number >= 1);

-- 11. judge_reviews constraints
ALTER TABLE judge_reviews
    ADD CONSTRAINT chk_reviews_score CHECK (final_score BETWEEN 0.0 AND 100.0);

-- 12. settings constraints
ALTER TABLE settings
    ADD CONSTRAINT chk_settings_theme CHECK (theme_preference IN ('light', 'dark'));
