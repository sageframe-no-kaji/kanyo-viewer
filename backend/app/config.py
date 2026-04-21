"""Configuration for Kanyo Viewer backend."""
import os
from pathlib import Path
from typing import Dict, Any, Optional
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
        # Root directory scanned for stream subdirectories.
        # Each subdir containing config.yaml is treated as a stream.
        self.DATA_DIR: Path = Path(os.getenv("KANYO_DATA_DIR", "/data"))
        self._streams: Optional[Dict[str, Any]] = None

    def _load_stream_from_dir(self, stream_dir: Path) -> Dict[str, Any]:
        """Parse config.yaml from a stream directory into a stream config dict."""
        with open(stream_dir / "config.yaml") as f:
            config = yaml.safe_load(f)

        youtube_id = None
        video_source = config.get("video_source", "")
        if "youtube.com/watch?v=" in video_source:
            youtube_id = video_source.split("v=")[1].split("&")[0]
        elif "youtu.be/" in video_source:
            youtube_id = video_source.split("youtu.be/")[1].split("?")[0]

        return {
            "id": stream_dir.name,
            "name": config.get("stream_name", "Unknown Stream"),
            "timezone": config.get("timezone", "UTC"),
            "data_path": str(stream_dir),
            "display": config.get("display", {}),
            "telegram_channel": config.get("telegram_channel"),
            "youtube_id": youtube_id,
        }

    def _discover_streams(self) -> Dict[str, Any]:
        """Scan DATA_DIR for subdirectories containing config.yaml.

        Streams are ordered by display.order (integer) when present, then
        alphabetically by directory name. This lets operators control card
        order on the landing page via config.yaml without touching the viewer.
        """
        candidates = []
        if not self.DATA_DIR.exists():
            return {}
        for subdir in sorted(self.DATA_DIR.iterdir()):
            if not subdir.is_dir():
                continue
            if not (subdir / "config.yaml").exists():
                continue
            try:
                stream = self._load_stream_from_dir(subdir)
                order = stream.get("display", {}).get("order", 999)
                candidates.append((order, subdir.name, stream))
            except Exception:
                continue
        candidates.sort(key=lambda x: (x[0], x[1]))
        return {name: stream for _, name, stream in candidates}

    @property
    def streams(self) -> Dict[str, Any]:
        """All stream configs, discovered from DATA_DIR on first access."""
        if self._streams is None:
            self._streams = self._discover_streams()
        return self._streams


settings = Settings()
