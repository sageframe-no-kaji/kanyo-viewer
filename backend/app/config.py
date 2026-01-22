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
        """Load streams registry on init."""
        self._streams_registry = None

    @property
    def streams_registry(self) -> Dict[str, Any]:
        """Load and cache streams registry (just paths)."""
        if self._streams_registry is None:
            with open(self.STREAMS_CONFIG, "r") as f:
                config = yaml.safe_load(f)
                self._streams_registry = config.get("streams", {})
        return self._streams_registry

    def get_stream_config(self, stream_id: str) -> Dict[str, Any]:
        """Load full config from stream's config.yaml (not cached - reads fresh each time)."""
        registry = self.streams_registry.get(stream_id)
        if not registry:
            raise ValueError(f"Stream {stream_id} not found in registry")

        config_path = Path(registry["config_path"])
        if not config_path.exists():
            raise FileNotFoundError(f"Config file not found: {config_path}")

        with open(config_path, "r") as f:
            config = yaml.safe_load(f)

        # Merge registry data with config data
        return {
            "id": stream_id,
            "name": config.get("stream_name", "Unknown Stream"),
            "timezone": config.get("timezone", "UTC"),
            "data_path": registry["data_path"],
            "display": config.get("display", {}),
            "telegram_channel": config.get("telegram_channel"),
        }

    @property
    def streams(self) -> Dict[str, Any]:
        """Get all stream configs (loads fresh from config.yaml files)."""
        return {
            stream_id: self.get_stream_config(stream_id)
            for stream_id in self.streams_registry.keys()
        }


settings = Settings()
