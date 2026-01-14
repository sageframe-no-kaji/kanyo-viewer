"""Configuration for Kanyo Viewer backend."""
import os
from pathlib import Path
from typing import Dict, Any
import yaml


class Settings:
    """Application settings."""

    # Environment
    ENV: str = os.getenv("KANYO_ENV", "production")
    DEBUG: bool = ENV == "development"

    # Application
    APP_NAME: str = "Kanyo Viewer"
    VERSION: str = "1.0.0"

    # Paths
    BASE_DIR: Path = Path(__file__).parent.parent
    STREAMS_CONFIG: Path = BASE_DIR / "streams.yaml"

    # API
    API_PREFIX: str = "/api"

    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",  # Vite dev server
        "http://kanyo.lan",
        "http://kanyo.lan:3000",
    ]

    def __init__(self):
        """Load streams configuration on init."""
        self._streams_config = None

    @property
    def streams(self) -> Dict[str, Any]:
        """Load and cache streams configuration."""
        if self._streams_config is None:
            with open(self.STREAMS_CONFIG, "r") as f:
                config = yaml.safe_load(f)
                self._streams_config = config.get("streams", {})
        return self._streams_config


settings = Settings()
