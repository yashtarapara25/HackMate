"""
auth.py
===============================================================================
WHAT THIS FILE DOES:
  Provides functions for password hashing, password verification, JWT access
  token generation, and the `get_current_user` FastAPI dependency.

WHY IT IS NEEDED:
  Protects API endpoints so that users can log in securely and only perform
  actions on resources they have permission to access.

HOW IT CONNECTS TO OTHER FILES:
  - Reads `SECRET_KEY`, `ALGORITHM`, and token expiry from `.env`.
  - Queries `User` model from `models.py` using `get_db` from `database.py`.
  - Imported by `main.py` for `/api/auth` endpoints and route authorization.
===============================================================================
"""

import os
import jwt
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from database import get_db
import models

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "hackmate_secret_key_super_secure_for_hackathon")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_password_hash(password: str) -> str:
    """Hashes a password securely using PBKDF2 with SHA-256."""
    salt = hashlib.sha256(SECRET_KEY.encode()).hexdigest()[:16]
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return f"pbkdf2_sha256${salt}${key.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against its hashed value."""
    try:
        if hashed_password.startswith("pbkdf2_sha256$"):
            parts = hashed_password.split("$")
            salt = parts[1]
            expected_key = parts[2]
            key = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt.encode('utf-8'), 100000)
            return key.hex() == expected_key
        # Fallback for plain text pre-seeded passwords in test data
        return plain_password == hashed_password
    except Exception:
        return plain_password == hashed_password


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Creates a signed JWT access token containing payload data."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    """
    FastAPI dependency that extracts the JWT token from the Authorization header,
    verifies it, and retrieves the current User record from the database.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == user_id_str).first()
    if user is None:
        raise credentials_exception
    return user
