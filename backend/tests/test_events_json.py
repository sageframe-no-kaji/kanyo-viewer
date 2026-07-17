"""Tests for events-JSON authority.

events_{date}.json written by the detector is the authority for durations and
counts. Visit clip files supplement it (playable clip association, ongoing
visits) and remain the fallback for dates with no JSON.
"""
import json
from datetime import datetime, timedelta

from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)

LEGACY_DATE = "2026-01-14"


def _recent_date_str():
    return (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")


def _harvard_clips(test_data_dir):
    return test_data_dir / "kanyo-harvard" / "clips"


# --- load_events_for_date: JSON authority ---


def test_events_durations_come_from_json(override_streams_config):
    """Durations are the JSON rows' duration_seconds, not ffprobe estimates."""
    response = client.get(f"/api/streams/kanyo-harvard/events?date={LEGACY_DATE}")
    assert response.status_code == 200

    events = response.json()["events"]
    assert len(events) == 2
    assert [e["duration"] for e in events] == [1335, 2700]


def test_events_include_end_time_and_flags(override_streams_config):
    """Events carry end_time, insignificant, and merged_segments from the JSON."""
    response = client.get(f"/api/streams/kanyo-harvard/events?date={LEGACY_DATE}")
    events = response.json()["events"]

    first = events[0]
    assert first["end_time"] == "2026-01-14T07:45:30-05:00"
    assert first["insignificant"] is False
    assert first["merged_segments"] == 1
    assert first["event_id"] == "20260114_072315"


def test_events_associate_visit_clips_by_containment(override_streams_config):
    """Each row's playable clip is the earliest visit file inside its window."""
    response = client.get(f"/api/streams/kanyo-harvard/events?date={LEGACY_DATE}")
    events = response.json()["events"]

    assert events[0]["clip"] == "falcon_072315_visit.mp4"
    assert events[1]["clip"] == "falcon_093000_visit.mp4"


def test_events_supplement_ongoing_visit(override_streams_config, test_data_dir):
    """A visit file not covered by any JSON row (ongoing visit with no closing
    row yet) still appears, via the directory fallback."""
    date_dir = _harvard_clips(test_data_dir) / LEGACY_DATE
    (date_dir / "falcon_110000_visit.mp4").write_bytes(b"dummy video")

    response = client.get(f"/api/streams/kanyo-harvard/events?date={LEGACY_DATE}")
    events = response.json()["events"]

    assert len(events) == 3
    ongoing = [e for e in events if e["clip"] == "falcon_110000_visit.mp4"]
    assert len(ongoing) == 1
    assert ongoing[0]["end_time"] is None


def test_events_fallback_when_no_json(override_streams_config, test_data_dir):
    """Dates with visit files but no events JSON fall back to the file scan."""
    date_str = "2026-02-01"
    date_dir = _harvard_clips(test_data_dir) / date_str
    date_dir.mkdir()
    (date_dir / "falcon_140000_visit.mp4").write_bytes(b"dummy video")

    response = client.get(f"/api/streams/kanyo-harvard/events?date={date_str}")
    assert response.status_code == 200

    events = response.json()["events"]
    assert len(events) == 1
    assert events[0]["clip"] == "falcon_140000_visit.mp4"
    assert "14:00:00" in events[0]["timestamp"]


def test_events_tolerate_unknown_fields_and_non_rows(override_streams_config, test_data_dir):
    """Rows with extra unknown fields are read by named keys; non-dict entries
    and dicts without start_time are ignored."""
    date_str = "2026-02-02"
    date_dir = _harvard_clips(test_data_dir) / date_str
    date_dir.mkdir()
    rows = [
        {
            "start_time": f"{date_str}T06:00:00-05:00",
            "end_time": f"{date_str}T06:10:00-05:00",
            "duration_seconds": 600,
            "future_field": {"nested": True},
            "another_unknown": 42,
        },
        {"not_an_event": True},
        "just a string",
    ]
    with open(date_dir / f"events_{date_str}.json", "w") as f:
        json.dump(rows, f)

    response = client.get(f"/api/streams/kanyo-harvard/events?date={date_str}")
    assert response.status_code == 200

    events = response.json()["events"]
    assert len(events) == 1
    assert events[0]["duration"] == 600


# --- get_stats_for_range: JSON authority ---


def test_stats_count_json_rows(override_streams_config):
    """Headline visits count comes from JSON rows on JSON-covered dates."""
    response = client.get("/api/streams/kanyo-harvard/stats?range=7d")
    assert response.status_code == 200

    data = response.json()
    # The recent fixture date has one JSON row (its extra visit files no longer
    # inflate the count).
    assert data["visits"] == 1
    assert data["last_events"][0]["type"] == "visit"


def test_stats_exclude_insignificant_from_count(override_streams_config, test_data_dir):
    """insignificant:true rows are excluded from the headline visits count but
    still listed in last_events."""
    recent = _recent_date_str()
    date_dir = _harvard_clips(test_data_dir) / recent
    events_file = date_dir / f"events_{recent}.json"
    rows = json.loads(events_file.read_text())
    rows.append(
        {
            "id": f"{recent.replace('-', '')}_104500",
            "start_time": f"{recent}T10:45:00-05:00",
            "end_time": f"{recent}T10:45:20-05:00",
            "duration_seconds": 20,
            "insignificant": True,
            "merged_segments": 1,
        }
    )
    events_file.write_text(json.dumps(rows))

    response = client.get("/api/streams/kanyo-harvard/stats?range=7d")
    data = response.json()

    assert data["visits"] == 1
    times = {e["time"] for e in data["last_events"]}
    assert {"10:00:00", "10:45:00"} <= times


def test_stats_dedupe_by_date_and_time(override_streams_config, test_data_dir):
    """last_events dedupe key is (date, time): the same wall-clock time on two
    different days yields two entries, not one."""
    recent = _recent_date_str()
    other = (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d")
    other_dir = _harvard_clips(test_data_dir) / other
    other_dir.mkdir(parents=True, exist_ok=True)
    rows = [
        {
            "id": f"{other.replace('-', '')}_100000",
            "start_time": f"{other}T10:00:00-05:00",
            "end_time": f"{other}T10:20:00-05:00",
            "duration_seconds": 1200,
        }
    ]
    with open(other_dir / f"events_{other}.json", "w") as f:
        json.dump(rows, f)

    response = client.get("/api/streams/kanyo-harvard/stats?range=7d")
    data = response.json()

    assert data["visits"] == 2
    ten_oclock = [e for e in data["last_events"] if e["time"] == "10:00:00"]
    assert len(ten_oclock) == 2
    assert recent != other


# --- ffprobe cache ---


def test_probe_clip_duration_cached_by_path_and_mtime(tmp_path, monkeypatch):
    """ffprobe runs once per (path, mtime); repeat calls hit the cache."""
    from unittest.mock import MagicMock
    import app.routers.streams as streams_router

    clip = tmp_path / "falcon_100000_visit.mp4"
    clip.write_bytes(b"dummy video")

    calls = []

    def fake_run(*args, **kwargs):
        calls.append(args)
        result = MagicMock()
        result.returncode = 0
        result.stdout = "12.5\n"
        return result

    monkeypatch.setattr(streams_router.subprocess, "run", fake_run)
    streams_router._ffprobe_cache.clear()

    assert streams_router.probe_clip_duration(clip) == 12.5
    assert streams_router.probe_clip_duration(clip) == 12.5
    assert len(calls) == 1


# --- find_most_recent_date_with_events: unified predicate ---


def test_recent_date_found_with_null_thumbnail_path(override_streams_config, test_data_dir):
    """A JSON row with thumbnail_path:null must not crash date discovery
    (regression: 'in' against None raised TypeError, silently swallowed)."""
    recent = _recent_date_str()
    nsw_dir = test_data_dir / "kanyo-nsw" / "clips" / recent
    nsw_dir.mkdir(parents=True)
    rows = [
        {
            "id": f"{recent.replace('-', '')}_090000",
            "start_time": f"{recent}T09:00:00+10:00",
            "end_time": f"{recent}T09:30:00+10:00",
            "duration_seconds": 1800,
            "thumbnail_path": None,
            "arrival_clip_path": None,
            "departure_clip_path": None,
        }
    ]
    with open(nsw_dir / f"events_{recent}.json", "w") as f:
        json.dump(rows, f)

    response = client.get("/api/streams/kanyo-nsw/events")
    assert response.status_code == 200

    data = response.json()
    assert data["date"] == recent
    assert len(data["events"]) == 1
    assert data["events"][0]["duration"] == 1800


def test_recent_date_found_with_visit_files_only(override_streams_config, test_data_dir):
    """The 'has events' predicate also accepts dates that have visit files but
    no JSON, matching what load_events_for_date serves."""
    recent = _recent_date_str()
    nsw_dir = test_data_dir / "kanyo-nsw" / "clips" / recent
    nsw_dir.mkdir(parents=True)
    (nsw_dir / "falcon_080000_123456_visit.mp4").write_bytes(b"dummy video")

    response = client.get("/api/streams/kanyo-nsw/events")
    assert response.status_code == 200

    data = response.json()
    assert data["date"] == recent
    assert len(data["events"]) == 1
