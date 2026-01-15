"""Stream information endpoints."""
from fastapi import APIRouter, HTTPException
from pathlib import Path
from datetime import datetime, timedelta, tzinfo
from typing import List, Dict, Any, Optional
import json
import pytz

from app.config import settings

router = APIRouter()


def get_stream_timezone(stream_id: str) -> tzinfo:
    """Get timezone for a stream."""
    stream_config = settings.streams.get(stream_id)
    if not stream_config:
        raise HTTPException(status_code=404, detail=f"Stream {stream_id} not found")

    tz_name = stream_config.get("timezone", "UTC")
    return pytz.timezone(tz_name)


def get_clips_dir(stream_id: str) -> Path:
    """Get clips directory for a stream."""
    stream_config = settings.streams.get(stream_id)
    if not stream_config:
        raise HTTPException(status_code=404, detail=f"Stream {stream_id} not found")

    data_path = stream_config.get("data_path")
    if not data_path:
        raise HTTPException(status_code=500, detail=f"No data_path configured for {stream_id}")

    clips_dir = Path(data_path) / "clips"
    if not clips_dir.exists():
        raise HTTPException(status_code=500, detail=f"Clips directory not found: {clips_dir}")

    return clips_dir


def find_most_recent_date_with_events(
    clips_dir: Path, start_date: datetime, tz: tzinfo
) -> Optional[str]:
    """Find the most recent date with events, searching backwards from start_date."""
    current_date = start_date

    # Search up to 30 days back
    for _ in range(30):
        date_str = current_date.strftime("%Y-%m-%d")
        date_dir = clips_dir / date_str

        if date_dir.exists():
            events_file = date_dir / f"events_{date_str}.json"
            if events_file.exists():
                # Check if it has any arrival/departure events
                try:
                    with open(events_file, "r") as f:
                        events = json.load(f)
                        # Filter for arrivals/departures
                        filtered = [
                            e
                            for e in events
                            if "_arrival" in e.get("thumbnail_path", "")
                            or "_departure" in e.get("departure_clip_path", "")
                        ]
                        if filtered:
                            return date_str
                except Exception:
                    pass

        # Move to previous day
        current_date = current_date - timedelta(days=1)

    return None


def load_events_for_date(stream_id: str, date_str: str) -> List[Dict[str, Any]]:
    """Load visit clips with duration for HKSV-style timeline."""
    clips_dir = get_clips_dir(stream_id)
    date_dir = clips_dir / date_str

    if not date_dir.exists():
        return []

    try:
        import re
        import subprocess

        # Pattern: falcon_HHMMSS_visit.mp4 (only visit clips)
        pattern = re.compile(r"falcon_(\d{6})_visit\.(mp4|avi|mov|mkv)$")

        filtered_events = []

        # Scan all visit video files in the directory
        for clip_file in sorted(date_dir.iterdir()):
            if not clip_file.is_file():
                continue

            match = pattern.match(clip_file.name)
            if not match:
                continue

            time_str, ext = match.groups()

            # Parse time to create timestamp
            hour = time_str[:2]
            minute = time_str[2:4]
            second = time_str[4:6]

            # Get stream timezone for proper timestamp
            tz = get_stream_timezone(stream_id)
            date_obj = datetime.strptime(date_str, "%Y-%m-%d")
            timestamp_dt = (
                tz.localize(
                    date_obj.replace(hour=int(hour), minute=int(minute), second=int(second))
                )
                if hasattr(tz, "localize")
                else date_obj.replace(
                    hour=int(hour), minute=int(minute), second=int(second), tzinfo=tz
                )
            )

            # Get video duration using ffprobe
            duration = 0.0
            try:
                result = subprocess.run(
                    [
                        "ffprobe",
                        "-v",
                        "error",
                        "-show_entries",
                        "format=duration",
                        "-of",
                        "default=noprint_wrappers=1:nokey=1",
                        str(clip_file),
                    ],
                    capture_output=True,
                    text=True,
                    timeout=5,
                )
                if result.returncode == 0:
                    duration = float(result.stdout.strip())
            except Exception:
                # Fallback: estimate from file size (very rough)
                file_size_mb = clip_file.stat().st_size / (1024 * 1024)
                duration = file_size_mb * 10  # Rough estimate: ~10s per MB

            # Check for thumbnail
            thumb_file = clip_file.with_suffix(".jpg")
            thumbnail = thumb_file.name if thumb_file.exists() else ""

            filtered_events.append(
                {
                    "type": "visit",
                    "timestamp": timestamp_dt.isoformat(),
                    "thumbnail": thumbnail,
                    "clip": clip_file.name,
                    "duration": duration,
                    "event_id": f"{date_str.replace('-', '')}_{time_str}",
                }
            )

        return filtered_events
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading events: {str(e)}")


def get_stats_for_range(stream_id: str, range_str: str) -> Dict[str, Any]:
    """Get stats by scanning clips directory directly."""
    import re

    # Parse range (e.g., "24h", "7d")
    hours = 24  # default
    if range_str.endswith('h'):
        hours = int(range_str[:-1])
    elif range_str.endswith('d'):
        hours = int(range_str[:-1]) * 24

    clips_dir = get_clips_dir(stream_id)
    tz = get_stream_timezone(stream_id)
    now = datetime.now(tz)
    cutoff = now - timedelta(hours=hours)

    # Get date folders to check
    dates_to_check = set()
    current = cutoff
    while current <= now:
        dates_to_check.add(current.strftime("%Y-%m-%d"))
        current += timedelta(days=1)

    # Pattern: falcon_HHMMSS_type.ext (completed files only)
    pattern = re.compile(r"falcon_(\d{6})_(arrival|departure|visit)\.(mp4|jpg|jpeg|avi|mov|mkv|png)$")

    arrivals = 0
    departures = 0
    visits = 0
    events_by_time = {}  # deduplicate by time

    for date_str in sorted(dates_to_check):
        date_path = clips_dir / date_str
        if not date_path.exists():
            continue

        for clip_file in date_path.iterdir():
            if not clip_file.is_file():
                continue

            match = pattern.match(clip_file.name)
            if not match:
                continue

            time_str, clip_type, ext = match.groups()

            # Parse clip datetime
            hour = int(time_str[:2])
            minute = int(time_str[2:4])
            second = int(time_str[4:6])

            try:
                clip_date = datetime.strptime(date_str, "%Y-%m-%d")
                clip_dt = tz.localize(clip_date.replace(hour=hour, minute=minute, second=second)) \
                    if hasattr(tz, "localize") \
                    else clip_date.replace(hour=hour, minute=minute, second=second, tzinfo=tz)
            except Exception:
                continue

            # Filter by cutoff time
            if clip_dt < cutoff:
                continue

            # Count by type
            if clip_type == "arrival":
                arrivals += 1
            elif clip_type == "departure":
                departures += 1
            elif clip_type == "visit":
                visits += 1

            # Track events (deduplicate by time, prefer arrival/departure over visit)
            time_key = f"{time_str[:2]}:{time_str[2:4]}:{time_str[4:6]}"
            if time_key in events_by_time:
                existing = events_by_time[time_key]
                # Prefer arrival/departure over visit
                if existing["type"] in ["arrival", "departure"]:
                    continue

            events_by_time[time_key] = {
                "time": time_key,
                "type": clip_type,
                "timestamp": clip_dt.isoformat(),
                "datetime": clip_dt
            }

    # Sort events by datetime (most recent first)
    last_events = sorted(events_by_time.values(), key=lambda x: x["datetime"], reverse=True)

    # Remove datetime object before returning (not JSON serializable)
    for event in last_events:
        event.pop("datetime", None)

    return {
        "visits": visits,
        "arrivals": arrivals,
        "departures": departures,
        "last_events": last_events[:10],  # limit to 10 most recent
        "range": range_str,
    }

@router.get("")
async def list_streams():
    """List all available streams with today's stats."""
    streams_list = []

    for stream_id, stream_config in settings.streams.items():
        try:
            # Get today's stats
            tz = get_stream_timezone(stream_id)
            today = datetime.now(tz).date()
            date_str = today.strftime("%Y-%m-%d")

            # Try to load today's events, or find most recent
            events = load_events_for_date(stream_id, date_str)
            if not events:
                # Auto-select most recent date with events
                recent_date = find_most_recent_date_with_events(
                    get_clips_dir(stream_id), datetime.now(tz), tz
                )
                if recent_date:
                    events = load_events_for_date(stream_id, recent_date)
                    date_str = recent_date

            visits = len(events)  # All returned events are visits

            streams_list.append(
                {
                    "id": stream_id,
                    "name": stream_config.get("name"),
                    "display": stream_config.get("display", {}),
                    "youtube_id": stream_config.get("youtube_id"),
                    "timezone": stream_config.get("timezone"),
                    "stats": {
                        "date": date_str,
                        "visits": visits,
                        "last_event": events[-1] if events else None,
                    },
                }
            )
        except Exception:
            # Skip streams that error out
            continue

    return {"streams": streams_list}


@router.get("/{stream_id}")
async def get_stream_detail(stream_id: str):
    """Get detailed information about a stream."""
    stream_config = settings.streams.get(stream_id)
    if not stream_config:
        raise HTTPException(status_code=404, detail=f"Stream {stream_id} not found")

    # Get today's stats
    stats = get_stats_for_range(stream_id, "24h")

    return {
        "id": stream_id,
        "name": stream_config.get("name"),
        "display": stream_config.get("display", {}),
        "youtube_id": stream_config.get("youtube_id"),
        "timezone": stream_config.get("timezone"),
        "stats": stats,
    }


@router.get("/{stream_id}/dates-with-events")
async def get_dates_with_events(stream_id: str, start_date: str, end_date: str):
    """Get list of dates that have visit clips in a date range."""
    import re

    clips_dir = get_clips_dir(stream_id)

    dates_with_events = []
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")

    current = start
    pattern = re.compile(r"falcon_(\d{6})_visit\.(mp4|avi|mov|mkv)$")

    while current <= end:
        date_str = current.strftime("%Y-%m-%d")
        date_dir = clips_dir / date_str

        if date_dir.exists():
            # Check if any visit clips exist
            has_events = any(pattern.match(f.name) for f in date_dir.iterdir() if f.is_file())
            if has_events:
                dates_with_events.append(date_str)

        current += timedelta(days=1)

    return {"dates": dates_with_events}


@router.get("/{stream_id}/events")
async def get_stream_events(stream_id: str, date: Optional[str] = None):
    """
    Get events for a specific date.
    If date is not provided or has no events, returns most recent date with events.
    """
    tz = get_stream_timezone(stream_id)
    clips_dir = get_clips_dir(stream_id)

    if date:
        # Try requested date first
        events = load_events_for_date(stream_id, date)
        if events:
            return {"stream_id": stream_id, "date": date, "events": events}

    # Auto-select most recent date with events
    today = datetime.now(tz)
    recent_date = find_most_recent_date_with_events(clips_dir, today, tz)

    if not recent_date:
        return {"stream_id": stream_id, "date": None, "events": []}

    events = load_events_for_date(stream_id, recent_date)
    return {"stream_id": stream_id, "date": recent_date, "events": events}


@router.get("/{stream_id}/stats")
async def get_stream_stats(stream_id: str, range: str = "24h"):
    """Get stats for a time range (24h, 2d, 3d, 4d, 5d)."""
    stats = get_stats_for_range(stream_id, range)
    return {"stream_id": stream_id, **stats}
