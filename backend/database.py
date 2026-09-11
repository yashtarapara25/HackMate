"""
database.py
===============================================================================
WHAT THIS FILE DOES:
  Configures the SQLAlchemy database engine, session maker, and base declarative
  class for the HackMate AI backend.

WHY IT IS NEEDED:
  FastAPI route handlers need a way to open and close database connections
  cleanly for every incoming HTTP request. This file provides the `get_db`
  dependency that safely yields a database session.

HOW IT CONNECTS TO OTHER FILES:
  - Loads DATABASE_URL from `.env`.
  - Exports `Base` to `models.py` so database tables map to Python ORM models.
  - Exports `get_db` to `main.py` so API endpoints can talk to Neon PostgreSQL.
===============================================================================
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load variables from .env file
load_dotenv()

# Get Neon PostgreSQL database connection string
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set in backend/.env")

# Create SQLAlchemy engine connected to Neon PostgreSQL
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# Create session maker factory for database transactions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all ORM models
Base = declarative_base()


def get_db():
    """
    Dependency function that creates a new database session for a request
    and closes it when the request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
