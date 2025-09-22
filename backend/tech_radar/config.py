from __future__ import annotations

import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./tech_radar.db")
