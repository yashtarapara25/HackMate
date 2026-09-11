"""
main.py
===============================================================================
WHAT THIS FILE DOES:
  Initializes the FastAPI application, adds CORS middleware, connects all API routes
  (Auth, Users, Teams, Problems, Solutions, Discussions, Tasks, Documents, Pitch Deck,
  Analytics), and handles database health checks (`/health`).

WHY IT IS NEEDED:
  Serves as the main entry point to start the backend application server using
  `uvicorn main:app --reload`.

HOW IT CONNECTS TO OTHER FILES:
  - Connects database session lifecycle using `database.get_db`.
  - Uses `auth.py` for authentication routes and route access authorization.
  - Uses `schemas.py` for API data validation and serialization.
  - Uses `crud.py` to execute database queries.
  - Uses `analytics.py` for team metrics calculation.
===============================================================================
"""

from uuid import UUID
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import engine, get_db, Base
import models
import schemas
import crud
import auth
import analytics

import os
# Create database tables if they do not exist
Base.metadata.create_all(bind=engine)

# Ensure Admin user from .env exists in Neon database on startup
try:
    with Session(engine) as init_db:
        crud.ensure_admin_user_exists(init_db)
except Exception as e:
    print("Admin setup log:", e)

app = FastAPI(
    title="HACKMATE AI Backend API",
    description="Simple, clean Python backend for HackMate AI connected to Neon PostgreSQL.",
    version="1.0.0"
)

# Enable CORS for frontend fetch requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------------------------------------------------
# ROOT & HEALTH CHECK
# -----------------------------------------------------------------------------
@app.get("/")
def read_root():
    return {
        "message": "Welcome to HACKMATE AI API",
        "health_check": "/health",
        "docs": "/docs"
    }


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Verifies that the backend can connect and query Neon PostgreSQL."""
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "ok",
            "database": "connected",
            "provider": "Neon PostgreSQL"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database connection error: {str(e)}"
        )


# -----------------------------------------------------------------------------
# 1. AUTHENTICATION ENDPOINTS
# -----------------------------------------------------------------------------
@app.post("/api/auth/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED)
def register(user_data: schemas.UserRegister, db: Session = Depends(get_db)):
    """Registers a new user and returns a JWT access token."""
    existing_user = crud.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
    user = crud.create_user(db, user_data)
    access_token = auth.create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer", "user": user}


@app.post("/api/auth/login", response_model=schemas.Token)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    """Authenticates user credentials and returns a JWT access token."""
    user = crud.get_user_by_email(db, login_data.email)
    if not user or not auth.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    admin_email = os.getenv("ADMIN_EMAIL", "admin@hackmate.ai").strip().lower()
    is_admin = user.email.lower() == admin_email
    access_token = auth.create_access_token(data={"sub": str(user.id), "is_admin": is_admin})
    return {"access_token": access_token, "token_type": "bearer", "user": user}


@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_current_user_profile(current_user: models.User = Depends(auth.get_current_user)):
    """Returns the profile of the authenticated user."""
    return current_user


# -----------------------------------------------------------------------------
# 2. USER PROFILE ENDPOINTS
# -----------------------------------------------------------------------------
@app.get("/api/users/{user_id}", response_model=schemas.UserResponse)
def get_user_profile(user_id: UUID, db: Session = Depends(get_db)):
    """Gets public user details by user ID."""
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


@app.put("/api/users/{user_id}", response_model=schemas.UserResponse)
def update_user_profile(
    user_id: UUID,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Updates user profile details."""
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this profile.")
    updated_user = crud.update_user(db, user_id, user_update)
    return updated_user


# -----------------------------------------------------------------------------
# 3. TEAMS ENDPOINTS
# -----------------------------------------------------------------------------
@app.post("/api/teams", response_model=schemas.TeamResponse, status_code=201)
def create_team(
    team_data: schemas.TeamCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Creates a new team and sets the current user as team leader."""
    team = crud.create_team(db, team_data, current_user.id)
    return team


@app.get("/api/teams", response_model=List[schemas.TeamResponse])
def get_teams(db: Session = Depends(get_db)):
    """Gets all available teams."""
    return crud.get_teams(db)


@app.get("/api/teams/{team_id}", response_model=schemas.TeamResponse)
def get_team_details(team_id: UUID, db: Session = Depends(get_db)):
    """Gets details for a specific team."""
    team = crud.get_team_by_id(db, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")
    return team


@app.post("/api/teams/{team_id}/join", response_model=schemas.TeamMemberResponse)
def join_team(
    team_id: UUID,
    join_data: schemas.TeamJoin,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Adds the authenticated user to a team."""
    team = crud.get_team_by_id(db, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")
    member = crud.join_team(db, team_id, current_user.id, join_data)
    member.user_name = current_user.full_name
    return member


@app.get("/api/teams/{team_id}/members", response_model=List[schemas.TeamMemberResponse])
def get_team_members(team_id: UUID, db: Session = Depends(get_db)):
    """Gets all members of a specific team."""
    members = crud.get_team_members(db, team_id)
    res = []
    for m in members:
        u = crud.get_user_by_id(db, m.user_id)
        m_dict = schemas.TeamMemberResponse(
            id=m.id,
            team_id=m.team_id,
            user_id=m.user_id,
            role_in_team=m.role_in_team,
            availability_percentage=m.availability_percentage,
            user_name=u.full_name if u else "Team Member"
        )
        res.append(m_dict)
    return res


# -----------------------------------------------------------------------------
# 4. PROBLEM & SOLUTION LAB ENDPOINTS
# -----------------------------------------------------------------------------
@app.post("/api/problems", response_model=schemas.ProblemResponse)
def create_problem(problem_data: schemas.ProblemCreate, db: Session = Depends(get_db)):
    """Creates or updates a team's core problem statement."""
    problem = crud.create_problem(db, problem_data)
    pain_points = db.query(models.PainPoint).filter(models.PainPoint.problem_statement_id == problem.id).all()
    return schemas.ProblemResponse(
        id=problem.id,
        team_id=problem.team_id,
        core_statement=problem.core_statement,
        pain_points=pain_points,
        created_at=problem.created_at
    )


@app.get("/api/problems", response_model=Optional[schemas.ProblemResponse])
def get_problem(team_id: UUID = Query(...), db: Session = Depends(get_db)):
    """Gets the problem statement and pain points for a team."""
    problem = crud.get_problem_by_team(db, team_id)
    if not problem:
        return None
    pain_points = db.query(models.PainPoint).filter(models.PainPoint.problem_statement_id == problem.id).all()
    return schemas.ProblemResponse(
        id=problem.id,
        team_id=problem.team_id,
        core_statement=problem.core_statement,
        pain_points=pain_points,
        created_at=problem.created_at
    )


@app.post("/api/problems/{problem_id}/pain-points", response_model=schemas.PainPointResponse)
def add_pain_point(problem_id: UUID, pain_data: schemas.PainPointCreate, db: Session = Depends(get_db)):
    """Adds a pain point to a problem statement."""
    pain = crud.add_pain_point(db, problem_id, pain_data)
    return pain


@app.post("/api/solutions", response_model=schemas.SolutionResponse)
def create_solution(
    solution_data: schemas.SolutionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Submits a solution concept for a team."""
    solution = crud.create_solution(db, solution_data, current_user.id)
    return solution


@app.get("/api/solutions", response_model=List[schemas.SolutionResponse])
def get_solutions(team_id: UUID = Query(...), db: Session = Depends(get_db)):
    """Gets all submitted solution concepts for a team."""
    return crud.get_solutions_by_team(db, team_id)


@app.post("/api/solutions/{solution_id}/vote", response_model=schemas.SolutionResponse)
def vote_solution(
    solution_id: UUID,
    vote_data: schemas.IdeaVoteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Votes and rates a solution concept."""
    solution = crud.vote_solution(db, solution_id, current_user.id, vote_data)
    if not solution:
        raise HTTPException(status_code=404, detail="Solution concept not found.")
    return solution


# -----------------------------------------------------------------------------
# 5. DISCUSSION ENDPOINTS
# -----------------------------------------------------------------------------
@app.get("/api/channels", response_model=List[schemas.ChannelResponse])
def get_channels(team_id: UUID = Query(...), db: Session = Depends(get_db)):
    """Gets discussion channels for a team."""
    return crud.get_channels_by_team(db, team_id)


@app.get("/api/channels/{channel_id}/messages", response_model=List[schemas.MessageResponse])
def get_messages(channel_id: UUID, db: Session = Depends(get_db)):
    """Gets message chat history for a channel."""
    messages = crud.get_messages_by_channel(db, channel_id)
    res = []
    for m in messages:
        sender = crud.get_user_by_id(db, m.sender_id) if m.sender_id else None
        res.append(
            schemas.MessageResponse(
                id=m.id,
                channel_id=m.channel_id,
                sender_id=m.sender_id,
                text=m.text,
                sender_name=sender.full_name if sender else "Team Member",
                created_at=m.created_at
            )
        )
    return res


@app.post("/api/channels/{channel_id}/messages", response_model=schemas.MessageResponse)
def send_message(
    channel_id: UUID,
    msg_data: schemas.MessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Sends a chat message to a subteam discussion channel."""
    msg = crud.create_message(db, channel_id, current_user.id, msg_data)
    return schemas.MessageResponse(
        id=msg.id,
        channel_id=msg.channel_id,
        sender_id=msg.sender_id,
        text=msg.text,
        sender_name=current_user.full_name,
        created_at=msg.created_at
    )


# -----------------------------------------------------------------------------
# 6. TASK BOARD ENDPOINTS
# -----------------------------------------------------------------------------
@app.post("/api/tasks", response_model=schemas.TaskResponse, status_code=201)
def create_task(task_data: schemas.TaskCreate, db: Session = Depends(get_db)):
    """Creates a new task on the task board."""
    task = crud.create_task(db, task_data)
    return task


@app.get("/api/tasks", response_model=List[schemas.TaskResponse])
def get_tasks(team_id: Optional[UUID] = Query(None), db: Session = Depends(get_db)):
    """Gets tasks filtered by team ID."""
    return crud.get_tasks(db, team_id=team_id)


@app.put("/api/tasks/{task_id}", response_model=schemas.TaskResponse)
def update_task(task_id: UUID, task_update: schemas.TaskUpdate, db: Session = Depends(get_db)):
    """Updates task details."""
    task = crud.update_task(db, task_id, task_update)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
    return task


@app.put("/api/tasks/{task_id}/status", response_model=schemas.TaskResponse)
def change_task_status(task_id: UUID, status_data: schemas.TaskStatusUpdate, db: Session = Depends(get_db)):
    """Updates task status (TODO, IN_PROGRESS, REVIEW, COMPLETED)."""
    valid_statuses = ["todo", "in_progress", "review", "completed"]
    if status_data.status.lower() not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{status_data.status}'. Allowed values: {valid_statuses}"
        )
    task = crud.update_task_status(db, task_id, status_data.status)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
    return task


@app.post("/api/tasks/{task_id}/assign", response_model=schemas.TaskResponse)
def assign_task(task_id: UUID, assign_data: schemas.TaskAssign, db: Session = Depends(get_db)):
    """Assigns a task to a user."""
    task = crud.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
    crud.assign_task(db, task_id, assign_data.user_id)
    return task


# -----------------------------------------------------------------------------
# 7. DOCUMENTATION ENDPOINTS
# -----------------------------------------------------------------------------
@app.post("/api/documents", response_model=schemas.DocumentResponse, status_code=201)
def create_document(
    doc_data: schemas.DocumentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Creates a new team document with initial content version."""
    doc = crud.create_document(db, doc_data, author_id=current_user.id)
    return schemas.DocumentResponse(
        id=doc.id,
        team_id=doc.team_id,
        title=doc.title,
        folder_name=doc.folder_name,
        latest_content=doc_data.content,
        created_at=doc.created_at
    )


@app.get("/api/documents", response_model=List[schemas.DocumentResponse])
def get_documents(team_id: UUID = Query(...), db: Session = Depends(get_db)):
    """Gets documents for a team along with their latest version content."""
    docs = crud.get_documents_by_team(db, team_id)
    res = []
    for d in docs:
        latest_ver = db.query(models.DocumentVersion).filter(
            models.DocumentVersion.document_id == d.id
        ).order_by(models.DocumentVersion.version_number.desc()).first()

        res.append(
            schemas.DocumentResponse(
                id=d.id,
                team_id=d.team_id,
                title=d.title,
                folder_name=d.folder_name,
                latest_content=latest_ver.content if latest_ver else "",
                created_at=d.created_at
            )
        )
    return res


@app.put("/api/documents/{document_id}", response_model=schemas.DocumentResponse)
def update_document(
    document_id: UUID,
    doc_update: schemas.DocumentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    """Updates a document's title or appends a new content version."""
    doc = crud.update_document(db, document_id, doc_update, author_id=current_user.id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    latest_ver = db.query(models.DocumentVersion).filter(
        models.DocumentVersion.document_id == doc.id
    ).order_by(models.DocumentVersion.version_number.desc()).first()

    return schemas.DocumentResponse(
        id=doc.id,
        team_id=doc.team_id,
        title=doc.title,
        folder_name=doc.folder_name,
        latest_content=latest_ver.content if latest_ver else "",
        created_at=doc.created_at
    )


# -----------------------------------------------------------------------------
# 8. PITCH BOARD / PRESENTATION ENDPOINTS
# -----------------------------------------------------------------------------
@app.post("/api/presentations", response_model=schemas.PresentationResponse)
def create_presentation(pres_data: schemas.PresentationCreate, db: Session = Depends(get_db)):
    """Uploads/records pitch deck presentation info."""
    pres = crud.create_presentation(db, pres_data)
    return pres


@app.get("/api/presentations/{presentation_id}", response_model=schemas.PresentationResponse)
def get_presentation(presentation_id: UUID, db: Session = Depends(get_db)):
    """Gets presentation details by ID."""
    pres = db.query(models.Presentation).filter(models.Presentation.id == presentation_id).first()
    if not pres:
        raise HTTPException(status_code=404, detail="Presentation not found.")
    return pres


@app.put("/api/presentations/{presentation_id}", response_model=schemas.PresentationResponse)
def update_presentation(
    presentation_id: UUID,
    pres_update: schemas.PresentationUpdate,
    db: Session = Depends(get_db)
):
    """Updates presentation details (name, size, version)."""
    pres = crud.update_presentation(db, presentation_id, pres_update)
    if not pres:
        raise HTTPException(status_code=404, detail="Presentation not found.")
    return pres


# -----------------------------------------------------------------------------
# 9. TEAM INSIGHTS & ANALYTICS ENDPOINT
# -----------------------------------------------------------------------------
@app.get("/api/analytics/team/{team_id}", response_model=schemas.TeamAnalyticsResponse)
def get_team_analytics(team_id: UUID, db: Session = Depends(get_db)):
    """
    Computes real-time Pandas team analytics:
    - Total, completed, pending tasks
    - Completion percentage
    - Member task distribution
    - Recent team activity logs
    """
    team = crud.get_team_by_id(db, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")

    res = analytics.calculate_team_analytics(db, team_id)
    return res


# Run local server when executed directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
