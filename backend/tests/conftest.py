"""Test configuration and fixtures."""
import tempfile
import json
from pathlib import Path
import yaml
import pytest


@pytest.fixture
def test_data_dir():
    """Create a temporary test data directory."""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield Path(tmpdir)


@pytest.fixture
def mock_stream_config(test_data_dir):
    """Create mock stream configuration with proper file structure.

    Each stream lives in its own subdirectory under test_data_dir, mirroring
    the production layout at /data/<stream-id>/. The backend discovers streams
    by scanning for config.yaml files in immediate subdirectories.
    """
    # Create Harvard stream directory with config.yaml inside it
    harvard_dir = test_data_dir / "kanyo-harvard"
    harvard_dir.mkdir(parents=True)
    harvard_config = {
        "stream_name": "Harvard Falcon Cam",
        "timezone": "America/New_York",
        "video_source": "https://www.youtube.com/watch?v=glczTFRRAK4",
        "display": {
            "short_name": "Harvard",
            "location": "Memorial Hall, Harvard University, Cambridge MA",
            "species": "Peregrine Falcon",
            "maintainer": "Harvard FAS",
        },
        "telegram_channel": "kanyo_harvard_falcon",
    }
    with open(harvard_dir / "config.yaml", "w") as f:
        yaml.dump(harvard_config, f)

    # Create NSW stream directory with config.yaml inside it
    nsw_dir = test_data_dir / "kanyo-nsw"
    nsw_dir.mkdir(parents=True)
    nsw_config = {
        "stream_name": "NSW Falcon Cam",
        "timezone": "Australia/Sydney",
        "video_source": "https://www.youtube.com/watch?v=VuZaWzhXSAI",
        "display": {
            "short_name": "NSW",
            "location": "New South Wales, Australia",
            "species": "Peregrine Falcon",
            "maintainer": "NSW Wildlife",
        },
        "telegram_channel": "kanyo_nsw_falcon",
    }
    with open(nsw_dir / "config.yaml", "w") as f:
        yaml.dump(nsw_config, f)

    # Create clips directories inside stream directories
    harvard_clips = harvard_dir / "clips"
    harvard_clips.mkdir()

    (nsw_dir / "clips").mkdir()

    # Create sample event data for 2026-01-14.
    # These rows are deliberately LEGACY-shaped (pre-microsecond filenames, no
    # duration_str/insignificant/merged_segments keys): archived dates written
    # by older detector versions still look like this, and the viewer must
    # tolerate them. Current-contract rows live on 2026-01-16 and 2026-01-17.
    date_str = "2026-01-14"
    harvard_date_dir = harvard_clips / date_str
    harvard_date_dir.mkdir()

    events = [
        {
            "id": "20260114_072315",
            "start_time": "2026-01-14T07:23:15-05:00",
            "end_time": "2026-01-14T07:45:30-05:00",
            "duration_seconds": 1335,
            "peak_confidence": 0.847,
            "thumbnail_path": "falcon_072315_arrival.jpg",
            "arrival_clip_path": "falcon_072315_arrival.mp4",
            "departure_clip_path": "falcon_074530_departure.mp4",
        },
        {
            "id": "20260114_093000",
            "start_time": "2026-01-14T09:30:00-05:00",
            "end_time": "2026-01-14T10:15:00-05:00",
            "duration_seconds": 2700,
            "peak_confidence": 0.921,
            "thumbnail_path": "falcon_093000_arrival.jpg",
            "arrival_clip_path": "falcon_093000_arrival.mp4",
            "departure_clip_path": "falcon_101500_departure.mp4",
        },
    ]

    events_file = harvard_date_dir / f"events_{date_str}.json"
    with open(events_file, "w") as f:
        json.dump(events, f)

    # Create dummy clip files (mp4 and jpg)
    for event in events:
        for key in ["thumbnail_path", "arrival_clip_path", "departure_clip_path"]:
            if event.get(key):
                clip_file = harvard_date_dir / event[key]
                clip_file.write_bytes(b"dummy content")

    # Create visit clips for events endpoint testing
    (harvard_date_dir / "falcon_072315_visit.mp4").write_bytes(b"dummy video")
    (harvard_date_dir / "falcon_093000_visit.mp4").write_bytes(b"dummy video")
    (harvard_date_dir / "falcon_072315_visit.jpg").write_bytes(b"dummy jpeg")
    (harvard_date_dir / "falcon_093000_visit.jpg").write_bytes(b"dummy jpeg")

    # Create a date with NEW-format filenames (falcon_HHMMSS_MICROSECONDS_type.ext,
    # produced by detector commit a014025). The visit clip's microseconds differ
    # from the arrival snapshot's, as they do in production.
    new_format_date = "2026-01-16"
    new_format_dir = harvard_clips / new_format_date
    new_format_dir.mkdir()
    new_format_events = [
        {
            "id": "20260116_081500",
            "start_time": "2026-01-16T08:15:00-05:00",
            "end_time": "2026-01-16T08:40:00-05:00",
            "duration_seconds": 1500,
            "duration_str": "25m 0s",
            "peak_confidence": 0.88,
            "thumbnail_path": "falcon_081500_123456_arrival.jpg",
            "arrival_clip_path": "falcon_081500_123456_arrival.mp4",
            "departure_clip_path": "falcon_084000_654321_departure.mp4",
            "insignificant": False,
            "merged_segments": 1,
        }
    ]
    with open(new_format_dir / f"events_{new_format_date}.json", "w") as f:
        json.dump(new_format_events, f)
    (new_format_dir / "falcon_081500_123456_arrival.jpg").write_bytes(b"dummy jpeg")
    (new_format_dir / "falcon_081500_123456_arrival.mp4").write_bytes(b"dummy video")
    (new_format_dir / "falcon_084000_654321_departure.mp4").write_bytes(b"dummy video")
    (new_format_dir / "falcon_081500_999999_visit.mp4").write_bytes(b"dummy video")

    # Create a date exercising the full current detector contract
    # (FalconVisit.to_dict() in the detector's src/kanyo/detection/events.py):
    # - a merged visit (merged_segments >= 2) spanning MULTIPLE _visit.mp4
    #   files, each much shorter than the visit's dwell (roosting stops)
    # - an insignificant visit (insignificant: true, recorded log-only, so no
    #   clip files exist for it)
    # - an in-progress .mp4.tmp file and .ffmpeg.log sidecar, which the
    #   detector writes next to clips and the viewer must ignore
    contract_date = "2026-01-17"
    contract_dir = harvard_clips / contract_date
    contract_dir.mkdir()
    contract_events = [
        {
            "id": "20260117_090000",
            "start_time": "2026-01-17T09:00:00-05:00",
            "end_time": "2026-01-17T09:50:00-05:00",
            "duration_seconds": 3000,
            "duration_str": "50m",
            "peak_confidence": 0.93,
            "thumbnail_path": "falcon_090000_111111_arrival.jpg",
            "arrival_clip_path": "falcon_090000_111111_arrival.mp4",
            "departure_clip_path": "falcon_095000_444444_departure.mp4",
            "insignificant": False,
            "merged_segments": 2,
        },
        {
            "id": "20260117_120000",
            "start_time": "2026-01-17T12:00:00-05:00",
            "end_time": "2026-01-17T12:00:20-05:00",
            "duration_seconds": 20,
            "duration_str": "20s",
            "peak_confidence": 0.61,
            "thumbnail_path": None,
            "arrival_clip_path": None,
            "departure_clip_path": None,
            "insignificant": True,
            "merged_segments": 1,
        },
    ]
    with open(contract_dir / f"events_{contract_date}.json", "w") as f:
        json.dump(contract_events, f)
    (contract_dir / "falcon_090000_111111_arrival.jpg").write_bytes(b"dummy jpeg")
    (contract_dir / "falcon_090000_111111_arrival.mp4").write_bytes(b"dummy video")
    (contract_dir / "falcon_095000_444444_departure.mp4").write_bytes(b"dummy video")
    # Two visit segments inside one merged visit's [start, end] window
    (contract_dir / "falcon_090000_111111_visit.mp4").write_bytes(b"dummy video")
    (contract_dir / "falcon_092500_222222_visit.mp4").write_bytes(b"dummy video")
    # In-progress recording + ffmpeg stderr sidecar: must never surface as events
    (contract_dir / "falcon_130000_555555_visit.mp4.tmp").write_bytes(b"partial video")
    (contract_dir / "falcon_130000_555555_visit.mp4.ffmpeg.log").write_bytes(b"ffmpeg noise")

    # Create a recent date with events so auto-select tests can find data
    # (find_most_recent_date_with_events only searches 30 days back)
    from datetime import datetime, timedelta

    recent_date_str = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    recent_date_dir = harvard_clips / recent_date_str
    recent_date_dir.mkdir(parents=True, exist_ok=True)
    recent_events = [
        {
            "id": f"{recent_date_str.replace('-', '')}_100000",
            "start_time": f"{recent_date_str}T10:00:00-05:00",
            "end_time": f"{recent_date_str}T10:30:00-05:00",
            "duration_seconds": 1800,
            "duration_str": "30m",
            "peak_confidence": 0.9,
            "thumbnail_path": "falcon_100000_arrival.jpg",
            "arrival_clip_path": "falcon_100000_arrival.mp4",
            "departure_clip_path": "falcon_103000_departure.mp4",
            "insignificant": False,
            "merged_segments": 1,
        }
    ]
    with open(recent_date_dir / f"events_{recent_date_str}.json", "w") as f:
        json.dump(recent_events, f)
    (recent_date_dir / "falcon_100000_arrival.jpg").write_bytes(b"dummy jpeg")
    (recent_date_dir / "falcon_100000_arrival.mp4").write_bytes(b"dummy video")
    (recent_date_dir / "falcon_103000_departure.mp4").write_bytes(b"dummy video")
    (recent_date_dir / "falcon_100000_visit.mp4").write_bytes(b"dummy video")
    # New-format arrival snapshot with a later time than the legacy one, so the
    # snapshot endpoint should pick it (distinct content lets tests verify).
    (recent_date_dir / "falcon_110000_123456_arrival.jpg").write_bytes(b"new format jpeg")

    return {"data_dir": test_data_dir}


@pytest.fixture
def override_streams_config(mock_stream_config, monkeypatch):
    """Point DATA_DIR at the mock data directory and clear the stream cache."""
    from app.config import settings

    monkeypatch.setattr(settings, "DATA_DIR", mock_stream_config["data_dir"])
    monkeypatch.setattr(settings, "_streams", None)
    return settings
