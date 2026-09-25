"""
models.py
===============================================================================
WHAT THIS FILE DOES:
  Defines SQLAlchemy ORM models matching the existing Neon PostgreSQL tables
  for HackMate AI (users, teams, tasks, problem statements, solutions, chat,
  documents, presentations, activity logs).

WHY IT IS NEEDED:
  Enables clean Python object-relational mapping (ORM) to read, insert, and update
  data in your existing Neon database without modifying table schemas.

HOW IT CONNECTS TO OTHER FILES:
  - Imports `Base` from `database.py`.
  - Referenced by `crud.py` to execute database queries.
  - Referenced by `auth.py` for user authentication logic.
  - Referenced by `analytics.py` to compute team metrics.
===============================================================================
"""

import uuid
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, BigInteger, ARRAY
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from database import Base


class University(Base):
    __tablename__ = "universities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, unique=True)
    email_domain = Column(String(255), nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Department(Base):
    __tablename__ = "departments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    university_id = Column(UUID(as_uuid=True), ForeignKey("universities.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), nullable=False, unique=True)
    hashed_password = Column(String(255), nullable=True)
    full_name = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    google_id = Column(String(255), nullable=True, unique=True, index=True)
    auth_provider = Column(String(50), default="local")
    university_id = Column(UUID(as_uuid=True), ForeignKey("universities.id"), nullable=False)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=False)
    skills = Column(ARRAY(String), default=[])
    xp_score = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Hackathon(Base):
    __tablename__ = "hackathons"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    tagline = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(50), default="upcoming")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Team(Base):
    __tablename__ = "teams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    avatar = Column(String(10), default="BC")
    hackathon_id = Column(UUID(as_uuid=True), ForeignKey("hackathons.id"), nullable=False)
    leader_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    progress_percentage = Column(Integer, default=0)
    health_score = Column(Integer, default=100)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role_in_team = Column(String(100), nullable=False)
    availability_percentage = Column(Integer, default=100)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ProblemStatement(Base):
    __tablename__ = "problem_statements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False, unique=True)
    core_statement = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PainPoint(Base):
    __tablename__ = "pain_points"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    problem_statement_id = Column(UUID(as_uuid=True), ForeignKey("problem_statements.id", ondelete="CASCADE"), nullable=False)
    text = Column(Text, nullable=False)
    votes_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SolutionConcept(Base):
    __tablename__ = "solution_concepts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    pros = Column(ARRAY(String), default=[])
    cons = Column(ARRAY(String), default=[])
    average_score = Column(Float, default=0.0)
    votes_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class IdeaVote(Base):
    __tablename__ = "idea_votes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    concept_id = Column(UUID(as_uuid=True), ForeignKey("solution_concepts.id", ondelete="CASCADE"), nullable=False)
    voter_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Float, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DiscussionChannel(Base):
    __tablename__ = "discussion_channels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    topic = Column(String(255), nullable=True)
    is_private = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    channel_id = Column(UUID(as_uuid=True), ForeignKey("discussion_channels.id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="todo")
    priority = Column(String(50), default="medium")
    progress_percentage = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class TaskAssignment(Base):
    __tablename__ = "task_assignments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    folder_name = Column(String(100), default="Root")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DocumentVersion(Base):
    __tablename__ = "document_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    version_number = Column(Integer, nullable=False, default=1)
    content = Column(Text, nullable=False)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Presentation(Base):
    __tablename__ = "presentations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False, unique=True)
    file_name = Column(String(255), nullable=False)
    file_size_bytes = Column(BigInteger, nullable=False, default=0)
    current_version = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action_description = Column(String(500), nullable=False)
    event_type = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
