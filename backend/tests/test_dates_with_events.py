"""Tests for dates-with-events endpoint."""
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_get_dates_with_events(override_streams_config):
    """Test getting dates with events in a range."""
    response = client.get(
        "/api/streams/kanyo-harvard/dates-with-events" "?start_date=2026-01-14&end_date=2026-01-14"
    )
    assert response.status_code == 200
    data = response.json()
    assert "dates" in data
    assert isinstance(data["dates"], list)
    # Should have the test date since we created visit clips
    assert "2026-01-14" in data["dates"]


def test_get_dates_with_events_no_clips(override_streams_config):
    """Test getting dates when no clips exist."""
    response = client.get(
        "/api/streams/kanyo-harvard/dates-with-events" "?start_date=2026-01-01&end_date=2026-01-05"
    )
    assert response.status_code == 200
    data = response.json()
    assert data["dates"] == []


def test_get_dates_with_events_multiple_days(override_streams_config, test_data_dir):
    """Test getting dates across multiple days with clips."""
    # Create additional visit clips for another date
    harvard_clips = test_data_dir / "harvard" / "clips"
    other_date_dir = harvard_clips / "2026-01-15"
    other_date_dir.mkdir()

    # Create visit clip
    visit_clip = other_date_dir / "falcon_123456_visit.mp4"
    visit_clip.write_text("dummy video")

    response = client.get(
        "/api/streams/kanyo-harvard/dates-with-events" "?start_date=2026-01-14&end_date=2026-01-15"
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["dates"]) == 2
    assert "2026-01-14" in data["dates"]
    assert "2026-01-15" in data["dates"]


def test_get_dates_with_events_invalid_stream(override_streams_config):
    """Test with invalid stream ID."""
    response = client.get(
        "/api/streams/invalid-stream/dates-with-events" "?start_date=2026-01-14&end_date=2026-01-14"
    )
    assert response.status_code == 404
