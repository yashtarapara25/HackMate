-- HackMate AI — Neon PostgreSQL Database Views
-- 005_views.sql
-- Simplifies complex aggregations for frontend dashboards and analytics.

-- 1. View for Team Leaderboard Rankings
CREATE OR REPLACE VIEW view_leaderboard_rankings AS
SELECT 
    t.id AS team_id,
    t.name AS team_name,
    t.avatar AS team_avatar,
    t.hackathon_id,
    h.name AS hackathon_name,
    t.progress_percentage,
    t.health_score,
    (t.progress_percentage * 0.7 + t.health_score * 0.3)::NUMERIC(5,2) AS overall_score,
    COUNT(tm.id) AS member_count,
    RANK() OVER (PARTITION BY t.hackathon_id ORDER BY (t.progress_percentage * 0.7 + t.health_score * 0.3) DESC, t.name ASC) AS rank
FROM teams t
JOIN hackathons h ON t.hackathon_id = h.id
LEFT JOIN team_members tm ON t.id = tm.team_id
WHERE t.deleted_at IS NULL
GROUP BY t.id, h.name;

-- 2. View for Project Submissions Details (for Judges & Faculty)
CREATE OR REPLACE VIEW view_project_submissions AS
SELECT 
    t.id AS team_id,
    t.name AS team_name,
    h.id AS hackathon_id,
    h.name AS hackathon_name,
    ps.core_statement AS problem_statement,
    p.file_name AS slide_deck_name,
    p.file_size_bytes AS slide_deck_size,
    pv.file_path AS slide_deck_url,
    p.current_version AS slide_deck_version,
    jr.final_score AS evaluation_score,
    jr.feedback_comments AS evaluation_feedback,
    u.full_name AS evaluator_name,
    CASE 
        WHEN p.id IS NOT NULL THEN 'Submitted'
        ELSE 'Pending'
    END AS submission_status
FROM teams t
JOIN hackathons h ON t.hackathon_id = h.id
LEFT JOIN problem_statements ps ON t.id = ps.team_id
LEFT JOIN presentations p ON t.id = p.team_id
LEFT JOIN presentation_versions pv ON p.id = pv.presentation_id AND p.current_version = pv.version_number
LEFT JOIN judge_reviews jr ON t.id = jr.team_id
LEFT JOIN users u ON jr.reviewer_id = u.id
WHERE t.deleted_at IS NULL;

-- 3. View for Team Member Contribution Summary (for Insights tab)
CREATE OR REPLACE VIEW view_team_contributions AS
SELECT 
    t.id AS team_id,
    t.name AS team_name,
    u.id AS user_id,
    u.full_name AS member_name,
    tm.role_in_team,
    COUNT(ta.id) AS assigned_tasks_count,
    COUNT(CASE WHEN tk.status = 'completed' THEN 1 END) AS completed_tasks_count,
    COALESCE(SUM(tk.progress_percentage), 0) AS total_progress_units
FROM teams t
JOIN team_members tm ON t.id = tm.team_id
JOIN users u ON tm.user_id = u.id
LEFT JOIN task_assignments ta ON u.id = ta.user_id
LEFT JOIN tasks tk ON ta.task_id = tk.id AND t.id = tk.team_id AND tk.deleted_at IS NULL
WHERE t.deleted_at IS NULL
GROUP BY t.id, u.id, tm.role_in_team;

-- 4. View for Active Hackathons Stats (for Organizers)
CREATE OR REPLACE VIEW view_active_hackathons_stats AS
SELECT 
    h.id AS hackathon_id,
    h.name AS hackathon_name,
    h.status AS hackathon_status,
    h.start_date,
    h.end_date,
    COUNT(DISTINCT t.id) AS registered_teams_count,
    COUNT(DISTINCT tm.user_id) AS total_participants_count
FROM hackathons h
LEFT JOIN teams t ON h.id = t.hackathon_id AND t.deleted_at IS NULL
LEFT JOIN team_members tm ON t.id = tm.team_id
GROUP BY h.id;
