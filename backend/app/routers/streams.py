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
    """Load events by scanning clip files directly (like admin backend)."""
    clips_dir = get_clips_dir(stream_id)
    date_dir = clips_dir / date_str

    if not date_dir.exists():
        return []

    try:
        import re
        
        # Pattern: falcon_HHMMSS_type.mp4 (only video files, exclude .tmp)
        pattern = re.compile(r"falcon_(\d{6})_(arrival|departure|visit)\.(mp4|avi|mov|mkv)$")
        
        filtered_events = []
        
        # Scan all video files in the directory
        for clip_file in sorted(date_dir.iterdir()):
            if not clip_file.is_file():
                continue
                
            match = pattern.match(clip_file.name)
            if not match:
                continue
            
            time_str, clip_type, ext = match.groups()
            
            # Skip visit clips (only show arrivals and departures)
            if clip_type == "visit":
                continue
            
            # Parse time to create timestamp
            hour = time_str[:2]
            minute = time_str[2:4]
            second = time_str[4:6]
            time_formatted = f"{hour}:{minute}:{second}"
            
            # Get stream timezone for proper timestamp
            tz = get_stream_timezone(stream_id)
            from datetime import datetime
            date_obj = datetime.strptime(date_str, "%Y-%m-%d")
            timestamp_dt = tz.localize(
                date_obj.replace(hour=int(hour), minute=int(minute), second=int(second))
            ) if hasattr(tz, "localize") else date_obj.replace(
                hour=int(hour), minute=int(minute), second=int(second), tzinfo=tz
            )
            
            # Check for thumbnail
            thumb_file = clip_file.with_suffix(".jpg")
            thumbnail = thumb_file.name if thumb_file.exists() else ""
            
            filtered_events.append(
                {
                    "type": clip_type,
                    "timestamp": timestamp_dt.isoformat(),
                    "thumbnail": thumbnail,
                    "clip": clip_file.name,
                    "confidence": 0.0,  # Not available from filesystem scan
                    "event_id": f"{date_str.replace('-', '')}_{time_str}",
                }
            )
        
        return filtered_events
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading events: {str(e)}")


def get_stats_for_range(stream_id: str, range_str: str) -> Dict[str, Any]:
    """Get stats for a time range (24h, 2d, 3d, etc)."""
    tz = get_stream_timezone(stream_id)
    # Ensure clips directory exists
    get_clips_dir(stream_id)

    # Parse range
    if range_str == "24h":
        days = 1
    elif range_str.endswith("d"):
        days = int(range_str[:-1])
    else:
        days = 1

    # Get date range
    now = datetime.now(tz)

    # Collect stats
    total_arrivals = 0
    total_departures = 0
    total_visits = 0
    last_event = None

    current_date = now.date()
    for _ in range(days):
        date_str = current_date.strftime("%Y-%m-%d")
        events = load_events_for_date(stream_id, date_str)

        for event in events:
            if event["type"] == "arrival":
                total_arrivals += 1
            elif event["type"] == "departure":
                total_departures += 1

            # Track most recent event
            if last_event is None or event["timestamp"] > last_event.get("timestamp", ""):
                last_event = event

        current_date = current_date - timedelta(days=1)

    # Visits are pairs of arrivals/departures
    total_visits = min(total_arrivals, total_departures)

    return {
        "arrivals": total_arrivals,
        "departures": total_departures,
        "visits": total_visits,
        "last_event": last_event,
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

            arrivals = len([e for e in events if e["type"] == "arrival"])
            departures = len([e for e in events if e["type"] == "departure"])

            streams_list.append(
                {
                    "id": stream_id,
                    "name": stream_config.get("name"),
                    "display": stream_config.get("display", {}),
                    "youtube_id": stream_config.get("youtube_id"),
                    "timezone": stream_config.get("timezone"),
                    "stats": {
                        "date": date_str,
                        "arrivals": arrivals,
                        "departures": departures,
                        "visits": min(arrivals, departures),
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
