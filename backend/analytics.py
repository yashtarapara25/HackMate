"""
analytics.py
===============================================================================
WHAT THIS FILE DOES:
  Calculates team performance insights and activity metrics using Pandas from
  real database data (total tasks, completed tasks, pending tasks, completion
  percentages, member contributions, and recent team activity logs).

WHY IT IS NEEDED:
  Provides data science and team analytics functionality to help teams track
  their progress during a hackathon without introducing complex or unnecessary
  machine learning models before sufficient training data exists.

HOW IT CONNECTS TO OTHER FILES:
  - Fetches data from Neon via SQLAlchemy queries and `crud.py`.
  - Uses `TeamAnalyticsResponse` and `MemberContribution` schemas from `schemas.py`.
  - Called by `GET /api/analytics/team/{team_id}` endpoint in `main.py`.
===============================================================================
"""

from uuid import UUID
from typing import Dict, Any, List
import pandas as pd
from sqlalchemy.orm import Session

import models
import schemas
import crud


def calculate_team_analytics(db: Session, team_id: UUID) -> schemas.TeamAnalyticsResponse:
    """
    Fetches real database records for a team, constructs Pandas DataFrames,
    computes key performance indicators (KPIs), and returns structured analytics.
    """
    team = crud.get_team_by_id(db, team_id)
    team_name = team.name if team else "Team Workspace"

    # 1. Fetch tasks for the team
    tasks = crud.get_tasks(db, team_id=team_id)
    
    # 2. Fetch members for the team
    members = crud.get_team_members(db, team_id=team_id)

    # 3. Fetch activity logs
    activities = db.query(models.ActivityLog).filter(
        models.ActivityLog.team_id == team_id
    ).order_by(models.ActivityLog.created_at.desc()).limit(10).all()

    # Process Tasks using Pandas
    total_tasks = len(tasks)
    completed_tasks = 0
    pending_tasks = 0
    completion_percentage = 0.0

    if total_tasks > 0:
        task_data = []
        for t in tasks:
            task_data.append({
                "id": str(t.id),
                "title": t.title,
                "status": (t.status or "todo").lower(),
                "priority": t.priority or "medium",
                "progress": t.progress_percentage or 0
            })
        
        df_tasks = pd.DataFrame(task_data)
        
        completed_tasks = int((df_tasks["status"] == "completed").sum())
        pending_tasks = total_tasks - completed_tasks
        completion_percentage = round((completed_tasks / total_tasks) * 100.0, 1)

    # Process Member Contributions using Pandas
    member_contributions: List[schemas.MemberContribution] = []

    for m in members:
        user = crud.get_user_by_id(db, m.user_id)
        user_name = user.full_name if user else "Member"

        # Count tasks assigned to this user in this team
        assignments = db.query(models.TaskAssignment).join(
            models.Task, models.Task.id == models.TaskAssignment.task_id
        ).filter(
            models.Task.team_id == team_id,
            models.TaskAssignment.user_id == m.user_id
        ).all()

        assigned_count = len(assignments)
        completed_count = 0

        if assigned_count > 0:
            assigned_task_ids = [a.task_id for a in assignments]
            completed_assignments = db.query(models.Task).filter(
                models.Task.id.in_(assigned_task_ids),
                models.Task.status.ilike("completed")
            ).all()
            completed_count = len(completed_assignments)

        member_contributions.append(
            schemas.MemberContribution(
                user_id=m.user_id,
                user_name=user_name,
                role_in_team=m.role_in_team,
                assigned_tasks_count=assigned_count,
                completed_tasks_count=completed_count
            )
        )

    # Process Activity Logs
    recent_activity_list: List[Dict[str, Any]] = []
    for act in activities:
        recent_activity_list.append({
            "id": str(act.id),
            "description": act.action_description,
            "event_type": act.event_type,
            "timestamp": act.created_at.isoformat() if act.created_at else None
        })

    return schemas.TeamAnalyticsResponse(
        team_id=team_id,
        team_name=team_name,
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        pending_tasks=pending_tasks,
        completion_percentage=completion_percentage,
        member_count=len(members),
        member_contributions=member_contributions,
        recent_activity=recent_activity_list
    )
