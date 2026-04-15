"""Tests for streams router."""
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app
import app.routers.streams as streams_router


client = TestClient(app)


def test_list_streams(override_streams_config):
    """Test GET /api/streams endpoint."""
    response = client.get("/api/streams")
    assert response.status_code == 200

    data = response.json()
    assert "streams" in data
    assert len(data["streams"]) == 2

    # Check stream structure
    stream = data["streams"][0]
    assert "id" in stream
    assert "name" in stream
    assert "display" in stream
    assert "youtube_id" in stream
    assert "timezone" in stream
    assert "stats" in stream


def test_get_stream_detail(override_streams_config):
    """Test GET /api/streams/{stream_id} endpoint."""
    response = client.get("/api/streams/kanyo-harvard")
    assert response.status_code == 200

    data = response.json()
    assert data["id"] == "kanyo-harvard"
    assert data["name"] == "Harvard Falcon Cam"
    assert data["youtube_id"] == "glczTFRRAK4"
    assert data["timezone"] == "America/New_York"
    assert "stats" in data


def test_get_stream_detail_not_found(override_streams_config):
    """Test GET /api/streams/{stream_id} with invalid stream."""
    response = client.get("/api/streams/nonexistent")
    assert response.status_code == 404


def test_get_stream_events(override_streams_config):
    """Test GET /api/streams/{stream_id}/events endpoint."""
    response = client.get("/api/streams/kanyo-harvard/events?date=2026-01-14")
    assert response.status_code == 200

    data = response.json()
    assert data["stream_id"] == "kanyo-harvard"
    assert data["date"] == "2026-01-14"
    assert "events" in data
    # Events list may be empty if no visit clips exist in test data
    assert isinstance(data["events"], list)

    # If events exist, check structure
    if len(data["events"]) > 0:
        event = data["events"][0]
        assert "type" in event
        assert event["type"] == "visit"  # Now only returns visit clips
        assert "timestamp" in event
        assert "thumbnail" in event
        assert "clip" in event
        assert "duration" in event  # New field


def test_get_stream_events_auto_select(override_streams_config):
    """Test auto-selection of most recent date with events."""
    response = client.get("/api/streams/kanyo-harvard/events")
    assert response.status_code == 200

    data = response.json()
    assert data["stream_id"] == "kanyo-harvard"
    assert data["date"] is not None


def test_get_stream_stats(override_streams_config):
    """Test GET /api/streams/{stream_id}/stats endpoint."""
    response = client.get("/api/streams/kanyo-harvard/stats?range=24h")
    assert response.status_code == 200

    data = response.json()
    assert data["stream_id"] == "kanyo-harvard"
    assert "visits" in data  # Only visits now, not arrivals/departures separately
    assert data["range"] == "24h"


def test_get_stream_stats_different_ranges(override_streams_config):
    """Test stats with different time ranges."""
    for range_str in ["24h", "2d", "3d"]:
        response = client.get(f"/api/streams/kanyo-harvard/stats?range={range_str}")
        assert response.status_code == 200
        data = response.json()
        assert data["range"] == range_str


def test_get_stream_snapshot(override_streams_config):
    """Test GET /api/streams/{stream_id}/snapshot returns most recent arrival image."""
    response = client.get("/api/streams/kanyo-harvard/snapshot")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("image/")


def test_get_stream_snapshot_not_found(override_streams_config, test_data_dir):
    """Test snapshot returns 404 when no arrival images exist."""
    # NSW has no clips at all, so no snapshots
    response = client.get("/api/streams/kanyo-nsw/snapshot")
    assert response.status_code == 404


def test_get_stream_dates_with_events_via_streams(override_streams_config):
    """Test dates-with-events endpoint accessible via streams router."""
    response = client.get(
        "/api/streams/kanyo-harvard/dates-with-events?start_date=2026-01-14&end_date=2026-01-14"
    )
    assert response.status_code == 200
    data = response.json()
    assert "2026-01-14" in data["dates"]


# --- live-url endpoint ---

def test_get_live_url_success(override_streams_config):
    """Test GET /api/streams/{stream_id}/live-url returns HLS URL from yt-dlp."""
    streams_router._live_url_cache.clear()

    fake_url = "https://manifest.googlevideo.com/fake/hls/manifest.m3u8"
    mock_result = MagicMock()
    mock_result.returncode = 0
    mock_result.stdout = fake_url + "\n"

    with patch("app.routers.streams.subprocess.run", return_value=mock_result):
        response = client.get("/api/streams/kanyo-harvard/live-url")

    assert response.status_code == 200
    data = response.json()
    assert data["url"] == fake_url
    assert data["cached"] is False
    assert data["expires_in"] == streams_router._LIVE_URL_TTL_SECONDS


def test_get_live_url_cached(override_streams_config):
    """Test that second call returns cached URL without calling yt-dlp again."""
    streams_router._live_url_cache.clear()

    fake_url = "https://manifest.googlevideo.com/fake/hls/manifest.m3u8"
    mock_result = MagicMock()
    mock_result.returncode = 0
    mock_result.stdout = fake_url + "\n"

    with patch("app.routers.streams.subprocess.run", return_value=mock_result):
        client.get("/api/streams/kanyo-harvard/live-url")
        response = client.get("/api/streams/kanyo-harvard/live-url")

    assert response.status_code == 200
    data = response.json()
    assert data["url"] == fake_url
    assert data["cached"] is True
    assert data["age_seconds"] >= 0


def test_get_live_url_not_found(override_streams_config):
    """Test 404 for nonexistent stream."""
    response = client.get("/api/streams/nonexistent/live-url")
    assert response.status_code == 404


def test_get_live_url_ytdlp_failure(override_streams_config):
    """Test 502 when yt-dlp exits non-zero."""
    streams_router._live_url_cache.clear()

    mock_result = MagicMock()
    mock_result.returncode = 1
    mock_result.stderr = "ERROR: Sign in to confirm you're not a bot"

    with patch("app.routers.streams.subprocess.run", return_value=mock_result):
        response = client.get("/api/streams/kanyo-harvard/live-url")

    assert response.status_code == 502


def test_get_live_url_ytdlp_not_installed(override_streams_config):
    """Test 503 when yt-dlp binary is not found."""
    streams_router._live_url_cache.clear()

    with patch("app.routers.streams.subprocess.run", side_effect=FileNotFoundError):
        response = client.get("/api/streams/kanyo-harvard/live-url")

    assert response.status_code == 503
