"""Clip serving endpoints."""
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
import re

from app.config import settings

router = APIRouter()


def is_safe_path(base_path: Path, requested_path: Path) -> bool:
    """Check if requested path is within base path (prevent path traversal)."""
    try:
        base_resolved = base_path.resolve()
        requested_resolved = requested_path.resolve()
        return str(requested_resolved).startswith(str(base_resolved))
    except Exception:
        return False


@router.get("/{stream_id}/{date}/{filename}")
async def serve_clip(stream_id: str, date: str, filename: str):
    """
    Serve a clip or thumbnail file.

    Security: Validates path to prevent directory traversal attacks.
    """
    # Validate stream exists
    stream_config = settings.streams.get(stream_id)
    if not stream_config:
        raise HTTPException(status_code=404, detail=f"Stream {stream_id} not found")

    # Get data path
    data_path = stream_config.get("data_path")
    if not data_path:
        raise HTTPException(status_code=500, detail=f"No data_path configured for {stream_id}")

    # Validate date format (YYYY-MM-DD)
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", date):
        raise HTTPException(status_code=400, detail="Invalid date format")

    # Validate filename (only allow falcon_HHMMSS_type.ext)
    if not re.match(r"^falcon_\d{6}_(arrival|departure|visit)\.(mp4|jpg)$", filename):
        raise HTTPException(status_code=400, detail="Invalid filename")

    # Construct file path
    clips_dir = Path(data_path) / "clips"
    file_path = clips_dir / date / filename

    # Security check: ensure path is within clips directory
    if not is_safe_path(clips_dir, file_path):
        raise HTTPException(status_code=403, detail="Access denied")

    # Check if file exists
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    # Serve file
    media_type = "video/mp4" if filename.endswith(".mp4") else "image/jpeg"
    return FileResponse(path=file_path, media_type=media_type, filename=filename)
