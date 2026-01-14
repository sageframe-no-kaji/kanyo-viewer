"""Test configuration and fixtures."""
import pytest
import os
import tempfile
import json
from pathlib import Path
from datetime import datetime
import yaml


@pytest.fixture
def test_data_dir():
    """Create a temporary test data directory."""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield Path(tmpdir)


@pytest.fixture
def mock_stream_config(test_data_dir):
    """Create mock stream configuration."""
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
            "departure_clip_path": "falcon_074530_departure.mp4"
        },
        {
            "id": "20260114_093000",
            "start_time": "2026-01-14T09:30:00-05:00",
            "end_time": "2026-01-14T10:15:00-05:00",
            "duration_seconds": 2700,
            "peak_confidence": 0.921,
            "thumbnail_path": "falcon_093000_arrival.jpg",
            "arrival_clip_path": "falcon_093000_arrival.mp4",
            "departure_clip_path": "falcon_101500_departure.mp4"
        }
    ]

    events_file = harvard_date_dir / f"events_{date_str}.json"
    with open(events_file, 'w') as f:
        json.dump(events, f)

    # Create dummy clip files
    for event in events:
        for key in ['thumbnail_path', 'arrival_clip_path', 'departure_clip_path']:
            if event.get(key):
                clip_file = harvard_date_dir / event[key]
                clip_file.write_text("dummy content")

    # Create streams.yaml config
    streams_config = {
        'streams': {
            'harvard': {
                'name': 'Harvard Falcon Cam',
                'youtube_id': 'glczTFRRAK4',
                'data_path': str(test_data_dir / 'harvard'),
                'timezone': 'America/New_York',
                'display': {
                    'short_name': 'Harvard',
                    'location': 'Memorial Hall, Harvard University, Cambridge MA',
                    'species': 'Peregrine Falcon',
                    'maintainer': 'Harvard FAS',
                    'telegram_channel': 'kanyo_harvard_falcon'
                }
            },
            'nsw': {
                'name': 'NSW Falcon Cam',
                'youtube_id': 'test123',
                'data_path': str(test_data_dir / 'nsw'),
                'timezone': 'Australia/Sydney',
                'display': {
                    'short_name': 'NSW',
                    'location': 'New South Wales, Australia',
                    'species': 'Peregrine Falcon',
                    'maintainer': 'NSW Wildlife',
                    'telegram_channel': 'kanyo_nsw_falcon'
                }
            }
        }
    }

    return streams_config


@pytest.fixture
def override_streams_config(mock_stream_config, monkeypatch):
    """Override settings.streams with mock configuration."""
    from app.config import settings
    monkeypatch.setattr(settings, '_streams_config', mock_stream_config['streams'])
    return settings
