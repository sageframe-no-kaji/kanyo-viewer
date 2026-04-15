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
    """Create mock stream configuration with proper file structure."""
    # Create Harvard config.yaml
    harvard_config_dir = test_data_dir / "configs" / "harvard"
    harvard_config_dir.mkdir(parents=True)
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
    with open(harvard_config_dir / "config.yaml", "w") as f:
        yaml.dump(harvard_config, f)

    # Create NSW config.yaml
    nsw_config_dir = test_data_dir / "configs" / "nsw"
    nsw_config_dir.mkdir(parents=True)
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
    with open(nsw_config_dir / "config.yaml", "w") as f:
        yaml.dump(nsw_config, f)

    # Create clips directory structure
    harvard_dir = test_data_dir / "harvard" / "clips"
    harvard_dir.mkdir(parents=True)

    nsw_dir = test_data_dir / "nsw" / "clips"
    nsw_dir.mkdir(parents=True)

    # Create sample event data for 2026-01-14
    date_str = "2026-01-14"
    harvard_date_dir = harvard_dir / date_str
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

    # Create a recent date with events so auto-select tests can find data
    # (find_most_recent_date_with_events only searches 30 days back)
    from datetime import datetime, timedelta

    recent_date_str = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    recent_date_dir = harvard_dir / recent_date_str
    recent_date_dir.mkdir(parents=True, exist_ok=True)
    recent_events = [
        {
            "id": f"{recent_date_str.replace('-', '')}_100000",
            "start_time": f"{recent_date_str}T10:00:00-05:00",
            "end_time": f"{recent_date_str}T10:30:00-05:00",
            "duration_seconds": 1800,
            "peak_confidence": 0.9,
            "thumbnail_path": "falcon_100000_arrival.jpg",
            "arrival_clip_path": "falcon_100000_arrival.mp4",
            "departure_clip_path": "falcon_103000_departure.mp4",
        }
    ]
    with open(recent_date_dir / f"events_{recent_date_str}.json", "w") as f:
        json.dump(recent_events, f)
    (recent_date_dir / "falcon_100000_arrival.jpg").write_bytes(b"dummy jpeg")
    (recent_date_dir / "falcon_100000_arrival.mp4").write_bytes(b"dummy video")
    (recent_date_dir / "falcon_103000_departure.mp4").write_bytes(b"dummy video")
    (recent_date_dir / "falcon_100000_visit.mp4").write_bytes(b"dummy video")

    # Registry format matching streams.yaml structure (config_path + data_path)
    streams_registry = {
        "kanyo-harvard": {
            "config_path": str(harvard_config_dir / "config.yaml"),
            "data_path": str(test_data_dir / "harvard"),
        },
        "kanyo-nsw": {
            "config_path": str(nsw_config_dir / "config.yaml"),
            "data_path": str(test_data_dir / "nsw"),
        },
    }

    return {"streams": streams_registry, "data_dir": test_data_dir}


@pytest.fixture
def override_streams_config(mock_stream_config, monkeypatch):
    """Override settings with mock stream registry and clear caches."""
    from app.config import settings

    monkeypatch.setattr(settings, "_streams_registry", mock_stream_config["streams"])
    monkeypatch.setattr(settings, "_streams", None)  # clear cached streams
    return settings
