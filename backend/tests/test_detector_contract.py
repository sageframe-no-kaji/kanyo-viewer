"""Tests pinning the viewer to the current detector contract.

The detector (kanyo-contemplating-falcons) writes, per date directory:

- events_YYYY-MM-DD.json — FalconVisit.to_dict() rows: id, start_time/end_time
  (tz-aware ISO), duration_seconds, duration_str, peak_confidence,
  thumbnail_path, arrival_clip_path, departure_clip_path, insignificant,
  merged_segments
- falcon_HHMMSS[_MICROSECONDS]_(arrival|departure|visit).(mp4|jpg)
- falcon_..._visit.mp4.tmp while a recording is in progress, and
  falcon_..._visit.mp4.ffmpeg.log stderr sidecars

Merged visits (merged_segments >= 2) may span multiple _visit.mp4 files, and
roosting-stop segments are much shorter than the visit's dwell time — the JSON
row, not the files, is the authority. The fixture date 2026-01-17 encodes all
of this (see conftest.py).
"""
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)

CONTRACT_DATE = "2026-01-17"


def _events_for_contract_date():
    response = client.get(f"/api/streams/kanyo-harvard/events?date={CONTRACT_DATE}")
    assert response.status_code == 200
    return response.json()["events"]


# --- merged visits spanning multiple visit files ---


def test_merged_visit_is_one_event(override_streams_config):
    """A merged row spanning two _visit.mp4 segment files yields ONE event;
    the segments are not double-reported as separate visits."""
    events = _events_for_contract_date()

    merged = [e for e in events if e["event_id"] == "20260117_090000"]
    assert len(merged) == 1
    assert merged[0]["merged_segments"] == 2

    # Neither segment file surfaces as a supplementary (ongoing-visit) event
    clips = [e["clip"] for e in events]
    assert clips.count("falcon_092500_222222_visit.mp4") == 0


def test_merged_visit_plays_earliest_segment(override_streams_config):
    """The playable clip for a merged visit is the earliest segment file."""
    events = _events_for_contract_date()
    merged = next(e for e in events if e["event_id"] == "20260117_090000")
    assert merged["clip"] == "falcon_090000_111111_visit.mp4"


def test_merged_visit_duration_is_dwell_not_clip_length(override_streams_config):
    """Duration is the JSON row's dwell time. Roosting-stop segment files are
    much shorter than the visit; ffprobe/file-based estimates must not leak in."""
    events = _events_for_contract_date()
    merged = next(e for e in events if e["event_id"] == "20260117_090000")
    assert merged["duration"] == 3000
    assert merged["end_time"] == "2026-01-17T09:50:00-05:00"


# --- insignificant visits ---


def test_insignificant_row_surfaces_with_flag(override_streams_config):
    """insignificant:true rows (log-only, no clip files) still appear on the
    events surface, flagged, with null paths tolerated."""
    events = _events_for_contract_date()
    insig = [e for e in events if e["event_id"] == "20260117_120000"]
    assert len(insig) == 1
    assert insig[0]["insignificant"] is True
    assert insig[0]["duration"] == 20
    assert insig[0]["clip"] == ""


# --- .mp4.tmp in-progress files and .ffmpeg.log sidecars ---


def test_tmp_and_log_files_never_surface_as_events(override_streams_config):
    """The in-progress .mp4.tmp file and .ffmpeg.log sidecar on the fixture
    date do not appear as events (no 13:00:00 event exists in the JSON)."""
    events = _events_for_contract_date()
    assert len(events) == 2
    assert not any("13:00:00" in e["timestamp"] for e in events)
    assert not any(e["clip"].endswith((".tmp", ".log")) for e in events)


def test_date_with_only_tmp_and_log_files_has_no_events(
    override_streams_config, test_data_dir
):
    """A date directory containing only an in-progress recording and its
    sidecar reports no events and is not a date-with-events."""
    date_str = "2026-01-18"
    date_dir = test_data_dir / "kanyo-harvard" / "clips" / date_str
    date_dir.mkdir()
    (date_dir / "falcon_140000_777777_visit.mp4.tmp").write_bytes(b"partial")
    (date_dir / "falcon_140000_777777_visit.mp4.ffmpeg.log").write_bytes(b"noise")

    response = client.get(
        "/api/streams/kanyo-harvard/dates-with-events"
        f"?start_date={date_str}&end_date={date_str}"
    )
    assert response.status_code == 200
    assert response.json()["dates"] == []


def test_serve_clip_rejects_tmp_and_log_filenames(override_streams_config):
    """The clip-serving endpoint refuses .mp4.tmp and .ffmpeg.log names."""
    for bad in [
        "falcon_130000_555555_visit.mp4.tmp",
        "falcon_130000_555555_visit.mp4.ffmpeg.log",
        "falcon_130000_555555_visit.ffmpeg.log",
    ]:
        response = client.get(f"/api/clips/kanyo-harvard/{CONTRACT_DATE}/{bad}")
        assert response.status_code == 400, f"{bad} should be rejected"
