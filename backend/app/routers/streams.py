"""Stream information endpoints."""
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pathlib import Path
from datetime import datetime, timedelta, tzinfo
from typing import List, Dict, Any, Optional
import json
import os
import subprocess
import tempfile
import shutil
import time
from urllib.parse import urlparse, quote
import httpx
import pytz

from app.config import settings

router = APIRouter()

# In-memory cache for resolved HLS URLs: {stream_id: {"url": str, "resolved_at": float}}
_live_url_cache: Dict[str, Dict[str, Any]] = {}
_LIVE_URL_TTL_SECONDS = 4 * 60 * 60  # 4 hours (YouTube URLs expire ~6h)


async def _resolve_or_get_live_url(stream_id: str) -> str:
    """Return the cached HLS manifest URL for a stream, resolving via yt-dlp if needed."""
    stream_config = settings.streams.get(stream_id)
    if not stream_config:
        raise HTTPException(status_code=404, detail=f"Stream {stream_id} not found")

    youtube_id = stream_config.get("youtube_id")
    if not youtube_id:
        raise HTTPException(
            status_code=422, detail=f"Stream {stream_id} has no YouTube video source"
        )

    # Return cached URL if still valid
    cached = _live_url_cache.get(stream_id)
    if cached and (time.time() - cached["resolved_at"]) < _LIVE_URL_TTL_SECONDS:
        return cached["url"]

    # Resolve fresh URL via yt-dlp
    youtube_url = f"https://www.youtube.com/watch?v={youtube_id}"
    cookies_path = "/app/cookies.txt"

    # yt-dlp writes back to the cookies file after every call.
    # Since cookies.txt is mounted read-only, copy it to a writable temp file.
    tmp_cookies = None
    if Path(cookies_path).exists():
        tmp_fd, tmp_cookies = tempfile.mkstemp(suffix=".txt", prefix="yt-cookies-")
        os.close(tmp_fd)
        shutil.copy2(cookies_path, tmp_cookies)
        cmd = [
            "yt-dlp", "--cookies", tmp_cookies,
            "--js-runtimes", "node", "-f", "best[height<=720]", "-g", youtube_url,
        ]
    else:
        cmd = ["yt-dlp", "--js-runtimes", "node", "-f", "best[height<=720]", "-g", youtube_url]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="yt-dlp timed out resolving stream URL")
    except FileNotFoundError:
        raise HTTPException(status_code=503, detail="yt-dlp not available in this environment")
    finally:
        if tmp_cookies:
            try:
                os.unlink(tmp_cookies)
            except OSError:
                pass

    if result.returncode != 0:
        raise HTTPException(
            status_code=502,
            detail=f"yt-dlp failed to resolve stream URL: {result.stderr.strip()[:200]}",
        )

    resolved_url = result.stdout.strip().splitlines()[0]
    if not resolved_url:
        raise HTTPException(status_code=502, detail="yt-dlp returned empty URL")

    _live_url_cache[stream_id] = {"url": resolved_url, "resolved_at": time.time()}
    return resolved_url


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

            # Check for thumbnail: try _visit.jpg first, then _arrival.jpg
            # (recording system saves arrival captures as _arrival.jpg)
            thumb_file = clip_file.with_suffix(".jpg")
            if not thumb_file.exists():
                thumb_file = clip_file.with_name(
                    clip_file.stem.replace("_visit", "_arrival") + ".jpg"
                )
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
    if range_str.endswith("h"):
        hours = int(range_str[:-1])
    elif range_str.endswith("d"):
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
    # Only count .mp4 files (not .tmp, .log, or thumbnails)
    pattern = re.compile(r"falcon_(\d{6})_(arrival|departure|visit)\.mp4$")

    visits = 0
    events_by_time: dict = {}  # deduplicate by time

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

            time_str, clip_type = match.groups()

            # Parse clip datetime
            hour = int(time_str[:2])
            minute = int(time_str[2:4])
            second = int(time_str[4:6])

            try:
                clip_date = datetime.strptime(date_str, "%Y-%m-%d")
                clip_dt = (
                    tz.localize(clip_date.replace(hour=hour, minute=minute, second=second))
                    if hasattr(tz, "localize")
                    else clip_date.replace(hour=hour, minute=minute, second=second, tzinfo=tz)
                )
            except Exception:
                continue

            # Filter by cutoff time
            if clip_dt < cutoff:
                continue

            # Only count visit files for the visits stat
            if clip_type == "visit":
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
                "datetime": clip_dt,
            }

    # Sort events by datetime (most recent first)
    last_events = sorted(events_by_time.values(), key=lambda x: x["datetime"], reverse=True)

    # Remove datetime object before returning (not JSON serializable)
    for event in last_events:
        event.pop("datetime", None)

    return {
        "visits": visits,  # Only completed visit.mp4 files
        "last_events": last_events,  # All events in the time range
        "range": range_str,
    }


@router.get("")
async def list_streams():
    """List all available streams with last 24h stats."""
    streams_list = []

    for stream_id, stream_config in settings.streams.items():
        try:
            # Get last 24h stats
            stats_24h = get_stats_for_range(stream_id, "24h")
            visits = stats_24h.get("visits", 0)
            last_events = stats_24h.get("last_events", [])

            # Determine date to show (today or most recent with events)
            tz = get_stream_timezone(stream_id)
            today = datetime.now(tz).date()
            date_str = today.strftime("%Y-%m-%d")

            # If no events in last 24h, find most recent date
            if not last_events:
                recent_date = find_most_recent_date_with_events(
                    get_clips_dir(stream_id), datetime.now(tz), tz
                )
                if recent_date:
                    date_str = recent_date

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
                        "last_event": last_events[0] if last_events else None,
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
        "telegram_channel": stream_config.get("telegram_channel"),
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


@router.get("/{stream_id}/snapshot")
async def get_stream_snapshot(stream_id: str):
    """Get the most recent arrival snapshot for a stream."""
    from fastapi.responses import FileResponse
    import re

    clips_dir = get_clips_dir(stream_id)
    tz = get_stream_timezone(stream_id)

    # Search back up to 30 days for the most recent arrival snapshot
    current_date = datetime.now(tz)
    pattern = re.compile(r"falcon_(\d{6})_arrival\.(jpg|jpeg|png)$")

    for _ in range(30):
        date_str = current_date.strftime("%Y-%m-%d")
        date_dir = clips_dir / date_str

        if date_dir.exists():
            # Find all arrival snapshots in this directory
            snapshots = []
            for file in date_dir.iterdir():
                if file.is_file():
                    match = pattern.match(file.name)
                    if match:
                        snapshots.append(file)

            # Return the most recent one (sorted by filename, which includes time)
            if snapshots:
                most_recent = sorted(snapshots, reverse=True)[0]
                return FileResponse(most_recent, media_type="image/jpeg")

        # Move to previous day
        current_date = current_date - timedelta(days=1)

    # If no snapshot found, return 404
    raise HTTPException(status_code=404, detail=f"No arrival snapshot found for {stream_id}")


@router.get("/{stream_id}/live-url")
async def get_live_url(stream_id: str):
    """Resolve and return the HLS manifest URL (useful for debugging).

    The frontend should use /{stream_id}/hls/playlist.m3u8 instead, which
    proxies the stream through the backend to avoid browser CORS restrictions.
    """
    # Check cache state before resolving so we can report whether a cache hit occurred
    existing = _live_url_cache.get(stream_id)
    was_cached = bool(
        existing and (time.time() - existing["resolved_at"]) < _LIVE_URL_TTL_SECONDS
    )
    url = await _resolve_or_get_live_url(stream_id)
    entry = _live_url_cache.get(stream_id)
    age_seconds = int(time.time() - entry["resolved_at"]) if entry else 0
    return {
        "url": url,
        "cached": was_cached,
        "age_seconds": age_seconds,
        "expires_in": _LIVE_URL_TTL_SECONDS - age_seconds,
    }


@router.get("/{stream_id}/hls/playlist.m3u8")
async def get_hls_playlist(stream_id: str):
    """Proxy the HLS manifest through the backend to avoid browser CORS restrictions.

    Fetches the yt-dlp-resolved manifest URL server-side and rewrites all segment
    URLs to point through /hls/seg so every browser request stays same-origin.
    """
    manifest_url = await _resolve_or_get_live_url(stream_id)

    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=15) as client:
            resp = await client.get(manifest_url)
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Failed to fetch HLS manifest: {exc}")

    if resp.status_code != 200:
        # Manifest URL expired early — evict cache so next request re-resolves
        _live_url_cache.pop(stream_id, None)
        raise HTTPException(
            status_code=502, detail=f"HLS manifest fetch returned {resp.status_code}"
        )

    # Rewrite absolute segment/sub-manifest URLs to route through the proxy
    lines = []
    for line in resp.text.splitlines():
        stripped = line.strip()
        if stripped.startswith("https://") or stripped.startswith("http://"):
            encoded = quote(stripped, safe="")
            lines.append(f"/api/streams/{stream_id}/hls/seg?u={encoded}")
        else:
            lines.append(line)

    return Response(
        content="\n".join(lines),
        media_type="application/vnd.apple.mpegurl",
        headers={"Cache-Control": "no-cache, no-store"},
    )


@router.get("/{stream_id}/hls/seg")
async def proxy_hls_segment(stream_id: str, u: str):
    """Proxy a single HLS segment or sub-manifest from YouTube CDN.

    Only proxies URLs from *.googlevideo.com or *.youtube.com to prevent open-proxy abuse.
    """
    # FastAPI URL-decodes query params once on arrival; u is already the original
    # segment URL with its percent-encoding intact. A second unquote() would
    # corrupt YouTube's signed path params (e.g. %3D → = → 403 from CDN).
    url = u

    parsed = urlparse(url)
    if not parsed.hostname or not (
        parsed.hostname.endswith(".googlevideo.com")
        or parsed.hostname.endswith(".youtube.com")
    ):
        raise HTTPException(status_code=403, detail="Segment URL not from allowed domain")

    try:
        async with httpx.AsyncClient(follow_redirects=True, timeout=30) as client:
            resp = await client.get(url)
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Failed to fetch segment: {exc}")

    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Segment fetch returned {resp.status_code}")

    content_type = resp.headers.get("content-type", "video/MP2T")
    return Response(
        content=resp.content,
        media_type=content_type,
        headers={"Cache-Control": "max-age=3600"},
    )
