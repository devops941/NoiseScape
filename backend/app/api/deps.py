"""Shared API dependencies."""
from typing import Generator
from fastapi import Depends
from sqlalchemy.orm import Session
from app.db.session import get_db

# Re-export db dependency
DbDep = Depends(get_db)

