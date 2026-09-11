-- HackMate AI — Neon PostgreSQL Custom Functions
-- 007_functions.sql
-- Implements trigger functions and helper routines.

-- 1. Helper function to update updated_at timestamp columns automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger function to recalculate team workspace progress based on completed tasks
CREATE OR REPLACE FUNCTION recalculate_team_progress()
RETURNS TRIGGER AS $$
DECLARE
    v_team_id UUID;
    v_total_tasks INT;
    v_completed_tasks INT;
    v_progress INT := 0;
BEGIN
    -- Determine team context depending on action type
    IF TG_OP = 'DELETE' THEN
        v_team_id := OLD.team_id;
    ELSE
        v_team_id := NEW.team_id;
    END IF;

    -- Count total active tasks for the team
    SELECT COUNT(*) INTO v_total_tasks
    FROM tasks
    WHERE team_id = v_team_id AND deleted_at IS NULL;

    -- Count completed tasks
    SELECT COUNT(*) INTO v_completed_tasks
    FROM tasks
    WHERE team_id = v_team_id AND status = 'completed' AND deleted_at IS NULL;

    -- Calculate percentage
    IF v_total_tasks > 0 THEN
        v_progress := (v_completed_tasks * 100) / v_total_tasks;
    END IF;

    -- Update parent team record
    UPDATE teams
    SET progress_percentage = v_progress,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = v_team_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger function to capture activity log events dynamically
CREATE OR REPLACE FUNCTION log_team_activity()
RETURNS TRIGGER AS $$
DECLARE
    v_team_id UUID;
    v_user_id UUID;
    v_desc VARCHAR(500);
    v_event VARCHAR(100);
BEGIN
    IF TG_TABLE_NAME = 'tasks' THEN
        v_team_id := NEW.team_id;
        v_user_id := NEW.updated_by;
        IF TG_OP = 'INSERT' THEN
            v_desc := 'Created task card: ' || NEW.title;
            v_event := 'task_creation';
        ELSIF TG_OP = 'UPDATE' THEN
            IF OLD.status != NEW.status THEN
                v_desc := 'Changed status of "' || NEW.title || '" to ' || NEW.status;
                v_event := 'task_status_change';
            ELSE
                v_desc := 'Updated task details for: ' || NEW.title;
                v_event := 'task_update';
            END IF;
        END IF;
    ELSIF TG_TABLE_NAME = 'solution_concepts' THEN
        v_team_id := NEW.team_id;
        v_user_id := NEW.author_id;
        IF TG_OP = 'INSERT' THEN
            v_desc := 'Pitched new solution concept: ' || NEW.title;
            v_event := 'solution_pitch';
        END IF;
    ELSIF TG_TABLE_NAME = 'presentation_versions' THEN
        -- Resolve team id from parent presentations table
        SELECT team_id INTO v_team_id FROM presentations WHERE id = NEW.presentation_id;
        v_user_id := NEW.uploader_id;
        v_desc := 'Uploaded slide deck version ' || NEW.version_number;
        v_event := 'pitch_upload';
    ELSIF TG_TABLE_NAME = 'document_versions' THEN
        SELECT team_id INTO v_team_id FROM documents WHERE id = NEW.document_id;
        v_user_id := NEW.author_id;
        v_desc := 'Updated document notes version ' || NEW.version_number;
        v_event := 'document_edit';
    END IF;

    -- Write to team log if details are resolved
    IF v_team_id IS NOT NULL THEN
        INSERT INTO activity_logs (team_id, user_id, action_description, event_type)
        VALUES (v_team_id, v_user_id, v_desc, v_event);
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger function to capture high-security audit logs for admin updates
CREATE OR REPLACE FUNCTION log_audit_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_before JSONB := NULL;
    v_after JSONB := NULL;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_user_id := OLD.updated_by;
        v_before := to_jsonb(OLD);
    ELSIF TG_OP = 'UPDATE' THEN
        v_user_id := NEW.updated_by;
        v_before := to_jsonb(OLD);
        v_after := to_jsonb(NEW);
    ELSIF TG_OP = 'INSERT' THEN
        v_user_id := NEW.created_by;
        v_after := to_jsonb(NEW);
    END IF;

    INSERT INTO audit_logs (user_id, action, table_name, record_id, before_state, after_state)
    VALUES (
        v_user_id, 
        TG_OP || '_' || TG_TABLE_NAME, 
        TG_TABLE_NAME, 
        COALESCE(NEW.id, OLD.id), 
        v_before, 
        v_after
    );

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
