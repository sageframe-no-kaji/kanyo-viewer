"""Tests for visitor timezone detection."""
import pytest
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_visitor_timezone_detection():
    """Test timezone detection from IP."""
    # Mock a real IP (not localhost)
    response = client.get(
        "/api/visitor/timezone",
        headers={"X-Forwarded-For": "8.8.8.8"}
    )
    assert response.status_code == 200

    data = response.json()
    # May return timezone or null depending on API availability
    assert "timezone" in data or "error" in data


def test_visitor_timezone_localhost():
    """Test timezone detection with localhost IP."""
    response = client.get("/api/visitor/timezone")
    assert response.status_code == 200

    data = response.json()
    # Localhost should return null
    assert data.get("timezone") is None
