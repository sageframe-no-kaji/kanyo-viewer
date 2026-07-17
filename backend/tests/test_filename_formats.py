"""Regression tests for the two clip filename formats.

The detector originally wrote falcon_HHMMSS_type.ext; commit a014025 added
microseconds: falcon_HHMMSS_MICROSECONDS_type.ext. The viewer must accept both.
The fixture date 2026-01-16 contains only new-format files (see conftest.py).
"""
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)

NEW_FORMAT_DATE = "2026-01-16"
LEGACY_DATE = "2026-01-14"


# --- events endpoint ---


def test_events_new_format_date(override_streams_config):
    """Visit clips with microsecond filenames appear on the timeline."""
    response = client.get(f"/api/streams/kanyo-harvard/events?date={NEW_FORMAT_DATE}")
    assert response.status_code == 200

    data = response.json()
    assert data["date"] == NEW_FORMAT_DATE
    assert len(data["events"]) == 1

    event = data["events"][0]
    assert event["type"] == "visit"
    assert event["clip"] == "falcon_081500_999999_visit.mp4"
    # Timestamp comes from the HHMMSS portion regardless of microseconds
    assert "08:15:00" in event["timestamp"]


def test_events_new_format_thumbnail_glob(override_streams_config):
    """Thumbnail resolves via arrival-snapshot glob even when the visit clip's
    microseconds differ from the arrival snapshot's (the old _visit -> _arrival
    stem swap cannot find it)."""
    response = client.get(f"/api/streams/kanyo-harvard/events?date={NEW_FORMAT_DATE}")
    assert response.status_code == 200

    event = response.json()["events"][0]
    assert event["thumbnail"] == "falcon_081500_123456_arrival.jpg"


def test_events_legacy_format_still_works(override_streams_config):
    """Legacy falcon_HHMMSS_visit.mp4 files still produce events."""
    response = client.get(f"/api/streams/kanyo-harvard/events?date={LEGACY_DATE}")
    assert response.status_code == 200

    data = response.json()
    clips = {e["clip"] for e in data["events"]}
    assert "falcon_072315_visit.mp4" in clips
    assert "falcon_093000_visit.mp4" in clips


# --- clips serving ---


def test_serve_clip_new_format(override_streams_config):
    """New-format clip filenames pass filename validation and are served."""
    response = client.get(
        f"/api/clips/kanyo-harvard/{NEW_FORMAT_DATE}/falcon_081500_999999_visit.mp4"
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "video/mp4"


def test_serve_thumbnail_new_format(override_streams_config):
    """New-format thumbnail filenames pass filename validation and are served."""
    response = client.get(
        f"/api/clips/kanyo-harvard/{NEW_FORMAT_DATE}/falcon_081500_123456_arrival.jpg"
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/jpeg"


def test_serve_clip_rejects_malformed_microseconds(override_streams_config):
    """Filenames with a malformed microsecond segment are rejected."""
    for bad in [
        "falcon_081500_1234567_visit.mp4",  # 7 digits
        "falcon_081500_12345_visit.mp4",  # 5 digits
        "falcon_081500_123456_123456_visit.mp4",  # doubled segment
        "falcon_081500_abcdef_visit.mp4",  # non-digits
    ]:
        response = client.get(f"/api/clips/kanyo-harvard/{NEW_FORMAT_DATE}/{bad}")
        assert response.status_code == 400, f"{bad} should be rejected"


# --- dates-with-events ---


def test_dates_with_events_new_format(override_streams_config):
    """Dates containing only new-format visit clips are reported."""
    response = client.get(
        "/api/streams/kanyo-harvard/dates-with-events"
        f"?start_date={NEW_FORMAT_DATE}&end_date={NEW_FORMAT_DATE}"
    )
    assert response.status_code == 200
    assert NEW_FORMAT_DATE in response.json()["dates"]


# --- snapshot ---


def test_snapshot_prefers_newest_including_new_format(override_streams_config):
    """Snapshot search matches new-format arrival jpgs; the newest wins."""
    response = client.get("/api/streams/kanyo-harvard/snapshot")
    assert response.status_code == 200
    # The recent fixture date has a legacy 10:00:00 arrival jpg and a new-format
    # 11:00:00 arrival jpg with distinct content; the later one must be served.
    assert response.content == b"new format jpeg"


# --- stats ---


def test_stats_counts_new_format_visits(override_streams_config, test_data_dir):
    """Stats file-scan fallback (dates without events JSON) counts new-format
    visit clips."""
    from datetime import datetime, timedelta

    no_json_date = (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d")
    no_json_dir = test_data_dir / "kanyo-harvard" / "clips" / no_json_date
    no_json_dir.mkdir(parents=True, exist_ok=True)
    (no_json_dir / "falcon_120000_111111_visit.mp4").write_bytes(b"dummy video")

    response = client.get("/api/streams/kanyo-harvard/stats?range=7d")
    assert response.status_code == 200

    data = response.json()
    # One JSON row on the recent fixture date + one new-format file two days ago
    assert data["visits"] == 2
    times = {e["time"] for e in data["last_events"]}
    assert "12:00:00" in times
