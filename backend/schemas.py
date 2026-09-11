"""
schemas.py
===============================================================================
WHAT THIS FILE DOES:
  Defines Pydantic schemas for data validation on API requests and data
  serialization for API JSON responses.

WHY IT IS NEEDED:
  FastAPI relies on Pydantic to ensure incoming HTTP request data matches expected
  types and to format database model outputs into clean JSON payloads.

HOW IT CONNECTS TO OTHER FILES:
  - Used in `main.py` as type hints for route request parameters and response models.
  - Used in `crud.py` to structure incoming payloads for insertion and updates.
===============================================================================
"""

from uuid import UUID
from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field


# -----------------------------------------------------------------------------
# 1. AUTHENTICATION & USER SCHEMAS
# -----------------------------------------------------------------------------
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=4)
    full_name: str
    university_id: Optional[UUID] = None
    department_id: Optional[UUID] = None
    skills: Optional[List[str]] = []


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    skills: Optional[List[str]] = None


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    university_id: UUID
    department_id: UUID
    skills: List[str] = []
    xp_score: int = 0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# -----------------------------------------------------------------------------
# 2. TEAM SCHEMAS
# -----------------------------------------------------------------------------
class TeamCreate(BaseModel):
    name: str
    hackathon_id: Optional[UUID] = None
    avatar: Optional[str] = "BC"


class TeamJoin(BaseModel):
    role_in_team: str = "Developer"
    availability_percentage: int = 100


class TeamMemberResponse(BaseModel):
    id: UUID
    team_id: UUID
    user_id: UUID
    role_in_team: str
    availability_percentage: int
    user_name: Optional[str] = None

    class Config:
        from_attributes = True


class TeamResponse(BaseModel):
    id: UUID
    name: str
    avatar: str
    hackathon_id: UUID
    leader_id: UUID
    progress_percentage: int = 0
    health_score: int = 100
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# -----------------------------------------------------------------------------
# 3. PROBLEM & SOLUTION LAB SCHEMAS
# -----------------------------------------------------------------------------
class ProblemCreate(BaseModel):
    team_id: UUID
    core_statement: str


class PainPointCreate(BaseModel):
    text: str


class PainPointResponse(BaseModel):
    id: UUID
    problem_statement_id: UUID
    text: str
    votes_count: int = 0

    class Config:
        from_attributes = True


class ProblemResponse(BaseModel):
    id: UUID
    team_id: UUID
    core_statement: str
    pain_points: List[PainPointResponse] = []
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SolutionCreate(BaseModel):
    team_id: UUID
    title: str
    description: str
    pros: Optional[List[str]] = []
    cons: Optional[List[str]] = []


class IdeaVoteCreate(BaseModel):
    rating: float = Field(..., ge=1.0, le=5.0)
    comment: Optional[str] = None


class SolutionResponse(BaseModel):
    id: UUID
    team_id: UUID
    author_id: Optional[UUID] = None
    title: str
    description: str
    pros: List[str] = []
    cons: List[str] = []
    average_score: float = 0.0
    votes_count: int = 0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# -----------------------------------------------------------------------------
# 4. DISCUSSION SCHEMAS
# -----------------------------------------------------------------------------
class ChannelCreate(BaseModel):
    team_id: UUID
    name: str
    topic: Optional[str] = None


class ChannelResponse(BaseModel):
    id: UUID
    team_id: UUID
    name: str
    topic: Optional[str] = None
    is_private: bool = False

    class Config:
        from_attributes = True


class MessageCreate(BaseModel):
    text: str


class MessageResponse(BaseModel):
    id: UUID
    channel_id: UUID
    sender_id: Optional[UUID] = None
    text: str
    sender_name: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# -----------------------------------------------------------------------------
# 5. TASK BOARD SCHEMAS
# -----------------------------------------------------------------------------
class TaskCreate(BaseModel):
    team_id: UUID
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "medium"
    status: Optional[str] = "todo"
    assignee_id: Optional[UUID] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    progress_percentage: Optional[int] = None


class TaskStatusUpdate(BaseModel):
    status: str = Field(..., description="Status must be todo, in_progress, review, or completed")


class TaskAssign(BaseModel):
    user_id: UUID


class TaskResponse(BaseModel):
    id: UUID
    team_id: UUID
    title: str
    description: Optional[str] = None
    status: str = "todo"
    priority: str = "medium"
    progress_percentage: int = 0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# -----------------------------------------------------------------------------
# 6. DOCUMENTATION SCHEMAS
# -----------------------------------------------------------------------------
class DocumentCreate(BaseModel):
    team_id: UUID
    title: str
    folder_name: Optional[str] = "Root"
    content: str


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class DocumentResponse(BaseModel):
    id: UUID
    team_id: UUID
    title: str
    folder_name: str
    latest_content: Optional[str] = ""
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# -----------------------------------------------------------------------------
# 7. PITCH BOARD / PRESENTATION SCHEMAS
# -----------------------------------------------------------------------------
class PresentationCreate(BaseModel):
    team_id: UUID
    file_name: str
    file_size_bytes: int = 0


class PresentationUpdate(BaseModel):
    file_name: Optional[str] = None
    file_size_bytes: Optional[int] = None


class PresentationResponse(BaseModel):
    id: UUID
    team_id: UUID
    file_name: str
    file_size_bytes: int
    current_version: int = 1
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# -----------------------------------------------------------------------------
# 8. TEAM INSIGHTS & ANALYTICS SCHEMAS
# -----------------------------------------------------------------------------
class MemberContribution(BaseModel):
    user_id: UUID
    user_name: str
    role_in_team: str
    assigned_tasks_count: int
    completed_tasks_count: int


class TeamAnalyticsResponse(BaseModel):
    team_id: UUID
    team_name: str
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    completion_percentage: float
    member_count: int
    member_contributions: List[MemberContribution]
    recent_activity: List[Dict[str, Any]]
