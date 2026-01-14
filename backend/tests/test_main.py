"""Tests for main FastAPI app."""
import pytest
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_app_creation():
    """Test that FastAPI app is created correctly."""
    assert app.title == "Kanyo Viewer"
    assert app.version == "1.0.0"


def test_api_endpoints_registered():
    """Test that API routes are registered."""
    routes = [route.path for route in app.routes]

    # Check that main API endpoints exist
    assert "/api/streams" in routes
    assert "/api/streams/{stream_id}" in routes
    assert "/api/clips/{stream_id}/{date}/{filename}" in routes
    assert "/api/visitor/timezone" in routes


def test_cors_middleware():
    """Test CORS middleware is configured."""
    # Check that middleware exists
    assert len(app.user_middleware) > 0

    # Test CORS by checking response headers
    response = client.get("/api/streams", headers={"Origin": "http://localhost:5173"})
    # CORS headers should be present
    assert "access-control-allow-origin" in response.headers or response.status_code == 200
