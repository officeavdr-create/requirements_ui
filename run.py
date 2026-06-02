#!/usr/bin/env python3
"""
Entry point for the SWE.1 Stage 3 Backend
Run with: python run.py
"""

import sys
import os
import uvicorn

# Add the project root and backend to Python path
project_root = os.path.dirname(os.path.abspath(__file__))
backend_root = os.path.join(project_root, 'backend')
sys.path.insert(0, project_root)
sys.path.insert(0, backend_root)

from backend.app.core.settings import settings

if __name__ == "__main__":
    uvicorn.run(
        "backend.app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.environment == "development",
        log_level=settings.log_level.lower(),
        access_log=True
    )
