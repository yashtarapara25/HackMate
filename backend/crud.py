"""
crud.py
===============================================================================
WHAT THIS FILE DOES:
  Contains database helper functions (Create, Read, Update, Delete) using
  SQLAlchemy ORM sessions.

WHY IT IS NEEDED:
  Keeps API endpoint handlers in `main.py` concise and clean by decoupling SQL
  query execution logic from HTTP request/response handling.

HOW IT CONNECTS TO OTHER FILES:
  - Consumes SQLAlchemy models from `models.py`.
  - Consumes Pydantic data schemas from `schemas.py`.
  - Called by API routes in `main.py` and data calculation logic in `analytics.py`.
===============================================================================
"""

import os
from uuid import UUID
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from sqlalchemy import desc

import models
import schemas
import auth


# -----------------------------------------------------------------------------
# 1. USER CRUD
# -----------------------------------------------------------------------------
def get_all_users(db: Session) -> List[models.User]:
    return db.query(models.User).order_by(models.User.full_name).all()


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(func.lower(models.User.email) == func.lower(email)).first()


def get_user_by_google_id(db: Session, google_id: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.google_id == google_id).first()


def create_or_get_google_user(db: Session, google_info: dict) -> models.User:
    """
    Finds an existing user by stable Google User ID (sub) or email.
    If found by email, links the google_id without creating duplicate accounts.
    If not found, creates a new User record with Google identity details.
    """
    google_id = str(google_info.get("sub") or "")
    email = str(google_info.get("email") or "").strip()
    name = google_info.get("name") or (email.split("@")[0] if email else "Google User")
    picture = google_info.get("picture")

    if not google_id or not email:
        raise ValueError("Google user info payload missing required sub or email fields.")

    # 1. Check existing user by stable Google ID
    user = get_user_by_google_id(db, google_id)
    if user:
        if picture and not user.avatar_url:
            user.avatar_url = picture
        db.commit()
        db.refresh(user)
        return user

    # 2. Link existing user by email to prevent duplicate accounts
    user = get_user_by_email(db, email)
    if user:
        user.google_id = google_id
        if picture and not user.avatar_url:
            user.avatar_url = picture
        user.auth_provider = "google"
        db.commit()
        db.refresh(user)
        return user

    # 3. Create new user automatically
    def_uni_id, def_dept_id = get_default_university_and_department(db)
    user = models.User(
        email=email,
        full_name=name,
        avatar_url=picture,
        google_id=google_id,
        auth_provider="google",
        hashed_password=None,
        university_id=def_uni_id,
        department_id=def_dept_id,
        skills=["Developer", "AI Hacker"],
        xp_score=100
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def ensure_admin_user_exists(db: Session) -> models.User:
    """Creates or updates default Admin users from .env credentials."""
    admin_emails = list(set([
        os.getenv("ADMIN_EMAIL", "yash64104@gmail.com").strip().lower(),
        "yash64104@gmail.com",
        "admin@hackmate.ai"
    ]))
    admin_password = os.getenv("ADMIN_PASSWORD", "yashpatel9510")
    hashed_pw = auth.get_password_hash(admin_password)

    last_user = None
    for email in admin_emails:
        user = get_user_by_email(db, email)
        if not user:
            def_uni_id, def_dept_id = get_default_university_and_department(db)
            user = models.User(
                email=email,
                hashed_password=hashed_pw,
                full_name="Organiser Admin",
                university_id=def_uni_id,
                department_id=def_dept_id,
                skills=["System Admin", "Event Organizer"],
                xp_score=999
            )
            db.add(user)
        else:
            user.hashed_password = hashed_pw
        last_user = user

    db.commit()
    if last_user:
        db.refresh(last_user)
    return last_user


def get_user_by_id(db: Session, user_id: UUID) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_default_university_and_department(db: Session):
    """Ensures default University and Department exist for registration."""
    uni = db.query(models.University).first()
    if not uni:
        uni = models.University(name="Default Hackathon University", email_domain="hackmate.ai")
        db.add(uni)
        db.commit()
        db.refresh(uni)

    dept = db.query(models.Department).filter(models.Department.university_id == uni.id).first()
    if not dept:
        dept = models.Department(university_id=uni.id, name="Computer Science & AI")
        db.add(dept)
        db.commit()
        db.refresh(dept)

    return uni.id, dept.id


def create_user(db: Session, user_data: schemas.UserRegister) -> models.User:
    uni_id = user_data.university_id
    dept_id = user_data.department_id

    if not uni_id or not dept_id:
        def_uni_id, def_dept_id = get_default_university_and_department(db)
        uni_id = uni_id or def_uni_id
        dept_id = dept_id or def_dept_id

    hashed_pw = auth.get_password_hash(user_data.password)
    db_user = models.User(
        email=user_data.email,
        hashed_password=hashed_pw,
        full_name=user_data.full_name,
        university_id=uni_id,
        department_id=dept_id,
        skills=user_data.skills or ["Python", "JavaScript"]
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: UUID, user_update: schemas.UserUpdate) -> Optional[models.User]:
    user = get_user_by_id(db, user_id)
    if not user:
        return None

    if user_update.full_name is not None:
        user.full_name = user_update.full_name
    if user_update.avatar_url is not None:
        user.avatar_url = user_update.avatar_url
    if user_update.university is not None:
        user.university = user_update.university
    if user_update.skills is not None:
        user.skills = user_update.skills

    db.commit()
    db.refresh(user)
    return user


# -----------------------------------------------------------------------------
# 2. TEAMS CRUD
# -----------------------------------------------------------------------------
def get_default_hackathon(db: Session) -> models.Hackathon:
    hack = db.query(models.Hackathon).first()
    if not hack:
        hack = models.Hackathon(
            name="HackMate Global AI Hackathon",
            tagline="Build next-gen AI applications",
            start_date=func.now(),
            end_date=func.now(),
            status="active"
        )
        db.add(hack)
        db.commit()
        db.refresh(hack)
    return hack


def create_team(db: Session, team_data: schemas.TeamCreate, leader_id: UUID) -> models.Team:
    hackathon_id = team_data.hackathon_id
    if not hackathon_id:
        hackathon_id = get_default_hackathon(db).id

    db_team = models.Team(
        name=team_data.name,
        avatar=team_data.avatar or "BC",
        hackathon_id=hackathon_id,
        leader_id=leader_id
    )
    db.add(db_team)
    db.commit()
    db.refresh(db_team)

    # Add leader as initial team member
    member = models.TeamMember(
        team_id=db_team.id,
        user_id=leader_id,
        role_in_team="Team Leader",
        availability_percentage=100
    )
    db.add(member)

    # Automatically create default general discussion channel
    channel = models.DiscussionChannel(
        team_id=db_team.id,
        name="general",
        topic="General team communication"
    )
    db.add(channel)

    log_activity(db, db_team.id, leader_id, f"Created team '{db_team.name}'", "team_created")

    db.commit()
    return db_team


def get_teams(db: Session) -> List[models.Team]:
    return db.query(models.Team).all()


def get_team_by_id(db: Session, team_id: UUID) -> Optional[models.Team]:
    return db.query(models.Team).filter(models.Team.id == team_id).first()


def join_team(db: Session, team_id: UUID, user_id: UUID, join_data: schemas.TeamJoin) -> models.TeamMember:
    existing = db.query(models.TeamMember).filter(
        models.TeamMember.team_id == team_id,
        models.TeamMember.user_id == user_id
    ).first()

    if existing:
        return existing

    member = models.TeamMember(
        team_id=team_id,
        user_id=user_id,
        role_in_team=join_data.role_in_team,
        availability_percentage=join_data.availability_percentage
    )
    db.add(member)
    log_activity(db, team_id, user_id, f"Joined team with role {join_data.role_in_team}", "member_joined")
    db.commit()
    db.refresh(member)
    return member


def get_team_members(db: Session, team_id: UUID) -> List[models.TeamMember]:
    return db.query(models.TeamMember).filter(models.TeamMember.team_id == team_id).all()


# -----------------------------------------------------------------------------
# 3. PROBLEM & SOLUTION LAB CRUD
# -----------------------------------------------------------------------------
def create_problem(db: Session, problem_data: schemas.ProblemCreate) -> models.ProblemStatement:
    existing = db.query(models.ProblemStatement).filter(models.ProblemStatement.team_id == problem_data.team_id).first()
    if existing:
        existing.core_statement = problem_data.core_statement
        db.commit()
        db.refresh(existing)
        return existing

    problem = models.ProblemStatement(
        team_id=problem_data.team_id,
        core_statement=problem_data.core_statement
    )
    db.add(problem)
    db.commit()
    db.refresh(problem)
    return problem


def get_problem_by_team(db: Session, team_id: UUID) -> Optional[models.ProblemStatement]:
    return db.query(models.ProblemStatement).filter(models.ProblemStatement.team_id == team_id).first()


def add_pain_point(db: Session, problem_id: UUID, pain_data: schemas.PainPointCreate) -> models.PainPoint:
    pain = models.PainPoint(
        problem_statement_id=problem_id,
        text=pain_data.text
    )
    db.add(pain)
    db.commit()
    db.refresh(pain)
    return pain


def create_solution(db: Session, solution_data: schemas.SolutionCreate, author_id: UUID) -> models.SolutionConcept:
    solution = models.SolutionConcept(
        team_id=solution_data.team_id,
        author_id=author_id,
        title=solution_data.title,
        description=solution_data.description,
        pros=solution_data.pros or [],
        cons=solution_data.cons or []
    )
    db.add(solution)
    db.commit()
    db.refresh(solution)
    return solution


def get_solutions_by_team(db: Session, team_id: UUID) -> List[models.SolutionConcept]:
    return db.query(models.SolutionConcept).filter(models.SolutionConcept.team_id == team_id).all()


def vote_solution(db: Session, solution_id: UUID, voter_id: UUID, vote_data: schemas.IdeaVoteCreate) -> models.SolutionConcept:
    solution = db.query(models.SolutionConcept).filter(models.SolutionConcept.id == solution_id).first()
    if not solution:
        return None

    vote = models.IdeaVote(
        concept_id=solution_id,
        voter_id=voter_id,
        rating=vote_data.rating,
        comment=vote_data.comment
    )
    db.add(vote)

    # Recalculate average rating & vote count
    all_votes = db.query(models.IdeaVote).filter(models.IdeaVote.concept_id == solution_id).all()
    ratings = [v.rating for v in all_votes] + [vote_data.rating]
    solution.votes_count = len(ratings)
    solution.average_score = round(sum(ratings) / len(ratings), 2)

    db.commit()
    db.refresh(solution)
    return solution


# -----------------------------------------------------------------------------
# 4. DISCUSSION CRUD
# -----------------------------------------------------------------------------
def get_channels_by_team(db: Session, team_id: UUID) -> List[models.DiscussionChannel]:
    channels = db.query(models.DiscussionChannel).filter(models.DiscussionChannel.team_id == team_id).all()
    if not channels:
        default_ch = models.DiscussionChannel(team_id=team_id, name="general", topic="General Team Chat")
        db.add(default_ch)
        db.commit()
        db.refresh(default_ch)
        channels = [default_ch]
    return channels


def get_or_create_channel(db: Session, team_id: UUID, channel_name: str = "general") -> models.DiscussionChannel:
    ch = db.query(models.DiscussionChannel).filter(
        models.DiscussionChannel.team_id == team_id,
        models.DiscussionChannel.name == channel_name
    ).first()
    if not ch:
        ch = models.DiscussionChannel(team_id=team_id, name=channel_name)
        db.add(ch)
        db.commit()
        db.refresh(ch)
    return ch


def create_message(db: Session, channel_id: UUID, sender_id: UUID, msg_data: schemas.MessageCreate) -> models.Message:
    msg = models.Message(
        channel_id=channel_id,
        sender_id=sender_id,
        text=msg_data.text
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


def get_messages_by_channel(db: Session, channel_id: UUID) -> List[models.Message]:
    return db.query(models.Message).filter(models.Message.channel_id == channel_id).order_by(models.Message.created_at.asc()).all()


# -----------------------------------------------------------------------------
# 5. TASK BOARD CRUD
# -----------------------------------------------------------------------------
def create_task(db: Session, task_data: schemas.TaskCreate) -> models.Task:
    task = models.Task(
        team_id=task_data.team_id,
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority or "medium",
        status=(task_data.status or "todo").lower()
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    if task_data.assignee_id:
        assign_task(db, task.id, task_data.assignee_id)

    log_activity(db, task.team_id, task_data.assignee_id, f"Created task '{task.title}'", "task_created")
    return task


def get_tasks(db: Session, team_id: Optional[UUID] = None) -> List[models.Task]:
    query = db.query(models.Task)
    if team_id:
        query = query.filter(models.Task.team_id == team_id)
    return query.all()


def get_task_by_id(db: Session, task_id: UUID) -> Optional[models.Task]:
    return db.query(models.Task).filter(models.Task.id == task_id).first()


def update_task(db: Session, task_id: UUID, task_update: schemas.TaskUpdate) -> Optional[models.Task]:
    task = get_task_by_id(db, task_id)
    if not task:
        return None

    if task_update.title is not None:
        task.title = task_update.title
    if task_update.description is not None:
        task.description = task_update.description
    if task_update.status is not None:
        task.status = task_update.status.lower()
        if task.status == "completed":
            task.progress_percentage = 100
    if task_update.priority is not None:
        task.priority = task_update.priority
    if task_update.progress_percentage is not None:
        task.progress_percentage = task_update.progress_percentage

    db.commit()
    db.refresh(task)
    update_team_progress(db, task.team_id)
    return task


def update_task_status(db: Session, task_id: UUID, new_status: str) -> Optional[models.Task]:
    task = get_task_by_id(db, task_id)
    if not task:
        return None

    task.status = new_status.lower()
    if task.status == "completed":
        task.progress_percentage = 100

    db.commit()
    db.refresh(task)
    update_team_progress(db, task.team_id)
    return task


def assign_task(db: Session, task_id: UUID, user_id: UUID) -> models.TaskAssignment:
    existing = db.query(models.TaskAssignment).filter(
        models.TaskAssignment.task_id == task_id,
        models.TaskAssignment.user_id == user_id
    ).first()

    if existing:
        return existing

    assignment = models.TaskAssignment(task_id=task_id, user_id=user_id)
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


def update_team_progress(db: Session, team_id: UUID):
    """Recalculates team progress percentage based on completed tasks."""
    all_tasks = db.query(models.Task).filter(models.Task.team_id == team_id).all()
    if not all_tasks:
        return

    completed = [t for t in all_tasks if t.status.lower() == "completed"]
    percentage = int((len(completed) / len(all_tasks)) * 100)

    team = db.query(models.Team).filter(models.Team.id == team_id).first()
    if team:
        team.progress_percentage = percentage
        db.commit()


# -----------------------------------------------------------------------------
# 6. DOCUMENTATION CRUD
# -----------------------------------------------------------------------------
def create_document(db: Session, doc_data: schemas.DocumentCreate, author_id: Optional[UUID] = None) -> models.Document:
    doc = models.Document(
        team_id=doc_data.team_id,
        title=doc_data.title,
        folder_name=doc_data.folder_name or "Root"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    ver = models.DocumentVersion(
        document_id=doc.id,
        version_number=1,
        content=doc_data.content,
        author_id=author_id
    )
    db.add(ver)
    db.commit()
    return doc


def get_documents_by_team(db: Session, team_id: UUID) -> List[models.Document]:
    return db.query(models.Document).filter(models.Document.team_id == team_id).all()


def update_document(db: Session, doc_id: UUID, doc_update: schemas.DocumentUpdate, author_id: Optional[UUID] = None) -> Optional[models.Document]:
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc:
        return None

    if doc_update.title:
        doc.title = doc_update.title

    if doc_update.content:
        # Get latest version number
        latest_ver = db.query(models.DocumentVersion).filter(
            models.DocumentVersion.document_id == doc_id
        ).order_by(desc(models.DocumentVersion.version_number)).first()

        new_ver_num = (latest_ver.version_number + 1) if latest_ver else 1

        new_ver = models.DocumentVersion(
            document_id=doc_id,
            version_number=new_ver_num,
            content=doc_update.content,
            author_id=author_id
        )
        db.add(new_ver)

    db.commit()
    db.refresh(doc)
    return doc


# -----------------------------------------------------------------------------
# 7. PITCH BOARD / PRESENTATION CRUD
# -----------------------------------------------------------------------------
def create_presentation(db: Session, pres_data: schemas.PresentationCreate) -> models.Presentation:
    pres = db.query(models.Presentation).filter(models.Presentation.team_id == pres_data.team_id).first()
    if pres:
        pres.file_name = pres_data.file_name
        pres.file_size_bytes = pres_data.file_size_bytes
        pres.current_version += 1
        db.commit()
        db.refresh(pres)
        return pres

    pres = models.Presentation(
        team_id=pres_data.team_id,
        file_name=pres_data.file_name,
        file_size_bytes=pres_data.file_size_bytes,
        current_version=1
    )
    db.add(pres)
    db.commit()
    db.refresh(pres)
    return pres


def get_presentation_by_team(db: Session, team_id: UUID) -> Optional[models.Presentation]:
    return db.query(models.Presentation).filter(models.Presentation.team_id == team_id).first()


def update_presentation(db: Session, pres_id: UUID, pres_update: schemas.PresentationUpdate) -> Optional[models.Presentation]:
    pres = db.query(models.Presentation).filter(models.Presentation.id == pres_id).first()
    if not pres:
        return None

    if pres_update.file_name:
        pres.file_name = pres_update.file_name
    if pres_update.file_size_bytes is not None:
        pres.file_size_bytes = pres_update.file_size_bytes

    pres.current_version += 1
    db.commit()
    db.refresh(pres)
    return pres


# -----------------------------------------------------------------------------
# 8. ACTIVITY LOGGING HELPER
# -----------------------------------------------------------------------------
def log_activity(db: Session, team_id: UUID, user_id: Optional[UUID], description: str, event_type: str = "general"):
    log = models.ActivityLog(
        team_id=team_id,
        user_id=user_id,
        action_description=description,
        event_type=event_type
    )
    db.add(log)
    db.commit()


# -----------------------------------------------------------------------------
# 9. USER PROFILE UPDATE & PROJECTS / KNOWLEDGE / NOTIFICATION CRUD
# -----------------------------------------------------------------------------
def update_user_profile(db: Session, user_id: UUID, update_data: schemas.UserUpdate) -> Optional[models.User]:
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None
    if update_data.full_name is not None:
        user.full_name = update_data.full_name
    if update_data.avatar_url is not None:
        user.avatar_url = update_data.avatar_url
    if update_data.university is not None:
        user.university = update_data.university
    if update_data.skills is not None:
        user.skills = update_data.skills
    if update_data.bio is not None:
        user.bio = update_data.bio
    if update_data.github is not None:
        user.github = update_data.github
    if update_data.linkedin is not None:
        user.linkedin = update_data.linkedin
    if update_data.portfolio is not None:
        user.portfolio = update_data.portfolio
    if update_data.location is not None:
        user.location = update_data.location

    db.commit()
    db.refresh(user)
    return user


def get_projects_by_team(db: Session, team_id: UUID) -> List[models.Project]:
    return db.query(models.Project).filter(models.Project.team_id == team_id).all()


def create_project(db: Session, proj_data: schemas.ProjectCreate) -> models.Project:
    proj = models.Project(
        name=proj_data.name,
        description=proj_data.description,
        team_id=proj_data.team_id,
        hackathon_id=proj_data.hackathon_id,
        problem_id=proj_data.problem_id,
        tech_stack=proj_data.tech_stack or [],
        repository_url=proj_data.repository_url,
        deployment_url=proj_data.deployment_url,
        presentation_url=proj_data.presentation_url
    )
    db.add(proj)
    db.commit()
    db.refresh(proj)
    return proj


def update_project(db: Session, project_id: UUID, update_data: schemas.ProjectUpdate) -> Optional[models.Project]:
    proj = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not proj:
        return None
    if update_data.name is not None:
        proj.name = update_data.name
    if update_data.description is not None:
        proj.description = update_data.description
    if update_data.tech_stack is not None:
        proj.tech_stack = update_data.tech_stack
    if update_data.status is not None:
        proj.status = update_data.status
    if update_data.progress_percentage is not None:
        proj.progress_percentage = update_data.progress_percentage
    if update_data.repository_url is not None:
        proj.repository_url = update_data.repository_url
    if update_data.deployment_url is not None:
        proj.deployment_url = update_data.deployment_url
    if update_data.presentation_url is not None:
        proj.presentation_url = update_data.presentation_url

    db.commit()
    db.refresh(proj)
    return proj


def get_knowledge_items(db: Session, user_id: UUID, team_id: Optional[UUID] = None) -> List[models.KnowledgeItem]:
    query = db.query(models.KnowledgeItem)
    if team_id:
        query = query.filter((models.KnowledgeItem.team_id == team_id) | (models.KnowledgeItem.user_id == user_id))
    else:
        query = query.filter(models.KnowledgeItem.user_id == user_id)
    return query.order_by(desc(models.KnowledgeItem.created_at)).all()


def create_knowledge_item(db: Session, item_data: schemas.KnowledgeItemCreate, user_id: UUID) -> models.KnowledgeItem:
    item = models.KnowledgeItem(
        user_id=user_id,
        team_id=item_data.team_id,
        title=item_data.title,
        description=item_data.description,
        content_url=item_data.content_url,
        category=item_data.category or "General",
        tags=item_data.tags or []
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def delete_knowledge_item(db: Session, item_id: UUID, user_id: UUID) -> bool:
    item = db.query(models.KnowledgeItem).filter(
        models.KnowledgeItem.id == item_id,
        models.KnowledgeItem.user_id == user_id
    ).first()
    if item:
        db.delete(item)
        db.commit()
        return True
    return False


def get_user_notifications(db: Session, user_id: UUID) -> List[models.Notification]:
    return db.query(models.Notification).filter(models.Notification.user_id == user_id).order_by(desc(models.Notification.created_at)).limit(20).all()


def mark_notification_read(db: Session, notification_id: UUID, user_id: UUID) -> bool:
    notif = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == user_id
    ).first()
    if notif:
        notif.is_read = True
        db.commit()
        return True
    return False


def create_notification(db: Session, user_id: UUID, title: str, message: str, type_: str = "info", team_id: Optional[UUID] = None) -> models.Notification:
    notif = models.Notification(
        user_id=user_id,
        team_id=team_id,
        title=title,
        message=message,
        type=type_
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif


def get_all_hackathons(db: Session) -> List[models.Hackathon]:
    return db.query(models.Hackathon).order_by(desc(models.Hackathon.start_date)).all()


def create_hackathon(db: Session, hack_data: schemas.HackathonCreate) -> models.Hackathon:
    hack = models.Hackathon(
        name=hack_data.name,
        organizer=hack_data.organizer,
        tagline=hack_data.tagline,
        description=hack_data.description,
        start_date=hack_data.start_date,
        end_date=hack_data.end_date,
        registration_deadline=hack_data.registration_deadline,
        mode=hack_data.mode or "Online",
        location=hack_data.location,
        prize_pool=hack_data.prize_pool,
        eligibility=hack_data.eligibility,
        website_url=hack_data.website_url,
        status=hack_data.status or "upcoming"
    )
    db.add(hack)
    db.commit()
    db.refresh(hack)
    return hack
