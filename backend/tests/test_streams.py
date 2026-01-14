"""Tests for streams router."""
import pytest
from fastapi.testclient import TestClient
from app.main import app


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
    response = client.get("/api/streams/harvard")
    assert response.status_code == 200

    data = response.json()
    assert data["id"] == "harvard"
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
    response = client.get("/api/streams/harvard/events?date=2026-01-14")
    assert response.status_code == 200

    data = response.json()
    assert data["stream_id"] == "harvard"
    assert data["date"] == "2026-01-14"
    assert "events" in data
    assert len(data["events"]) > 0

    # Check event structure
    event = data["events"][0]
    assert "type" in event
    assert event["type"] in ["arrival", "departure"]
    assert "timestamp" in event
    assert "thumbnail" in event
    assert "clip" in event


def test_get_stream_events_auto_select(override_streams_config):
    """Test auto-selection of most recent date with events."""
    response = client.get("/api/streams/harvard/events")
    assert response.status_code == 200

    data = response.json()
    assert data["stream_id"] == "harvard"
    assert data["date"] is not None


def test_get_stream_stats(override_streams_config):
    """Test GET /api/streams/{stream_id}/stats endpoint."""
    response = client.get("/api/streams/harvard/stats?range=24h")
    assert response.status_code == 200

    data = response.json()
    assert data["stream_id"] == "harvard"
    assert "arrivals" in data
    assert "departures" in data
    assert "visits" in data
    assert data["range"] == "24h"


def test_get_stream_stats_different_ranges(override_streams_config):
    """Test stats with different time ranges."""
    for range_str in ["24h", "2d", "3d"]:
        response = client.get(f"/api/streams/harvard/stats?range={range_str}")
        assert response.status_code == 200
        data = response.json()
        assert data["range"] == range_str
