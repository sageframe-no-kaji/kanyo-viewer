"""Tests for clips router."""
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_serve_clip_valid(override_streams_config):
    """Test serving a valid clip file."""
    response = client.get("/api/clips/kanyo-harvard/2026-01-14/falcon_072315_arrival.mp4")
    assert response.status_code == 200
    assert response.headers["content-type"] == "video/mp4"


def test_serve_thumbnail_valid(override_streams_config):
    """Test serving a valid thumbnail file."""
    response = client.get("/api/clips/kanyo-harvard/2026-01-14/falcon_072315_arrival.jpg")
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/jpeg"


def test_serve_clip_invalid_stream(override_streams_config):
    """Test serving clip from non-existent stream."""
    response = client.get("/api/clips/nonexistent/2026-01-14/falcon_072315_arrival.mp4")
    assert response.status_code == 404


def test_serve_clip_invalid_date_format(override_streams_config):
    """Test serving clip with invalid date format."""
    response = client.get("/api/clips/kanyo-harvard/20260114/falcon_072315_arrival.mp4")
    assert response.status_code == 400


def test_serve_clip_invalid_filename(override_streams_config):
    """Test serving clip with invalid filename."""
    # Try path traversal - should return 400 or 404
    response = client.get("/api/clips/kanyo-harvard/2026-01-14/../../../etc/passwd")
    assert response.status_code in [400, 404]
    response = client.get("/api/clips/kanyo-harvard/2026-01-14/malicious.exe")
    assert response.status_code == 400


def test_serve_clip_not_found(override_streams_config):
    """Test serving non-existent clip file."""
    response = client.get("/api/clips/kanyo-harvard/2026-01-14/falcon_999999_arrival.mp4")
    assert response.status_code == 404
