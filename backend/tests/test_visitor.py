"""Tests for visitor timezone detection."""
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.routers.visitor import detect_timezone_from_ip


client = TestClient(app)


def test_visitor_timezone_detection():
    """Test timezone detection from IP."""
    # Mock a real IP (not localhost)
    response = client.get("/api/visitor/timezone", headers={"X-Forwarded-For": "8.8.8.8"})
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


def test_visitor_timezone_x_real_ip():
    """Test IP extraction via X-Real-IP header."""
    response = client.get("/api/visitor/timezone", headers={"X-Real-IP": "10.0.0.1"})
    assert response.status_code == 200
    # 10.x.x.x is private, so timezone should be None
    assert response.json()["timezone"] is None


def test_detect_timezone_from_ip_private():
    """Private IPs return None without making API calls."""
    assert detect_timezone_from_ip("127.0.0.1") is None
    assert detect_timezone_from_ip("192.168.1.1") is None
    assert detect_timezone_from_ip("10.0.0.1") is None
    assert detect_timezone_from_ip("unknown") is None


def test_detect_timezone_from_ip_ipapi_success():
    """detect_timezone_from_ip returns timezone from ipapi.co."""
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.text = "America/New_York"

    with patch("app.routers.visitor.requests.get", return_value=mock_response):
        result = detect_timezone_from_ip("8.8.8.8")

    assert result == "America/New_York"


def test_detect_timezone_from_ip_ipapi_fails_geojs_succeeds():
    """Falls back to geojs.io when ipapi.co fails."""

    def side_effect(url, timeout):
        if "ipapi.co" in url:
            raise Exception("timeout")
        mock = Mock()
        mock.status_code = 200
        mock.json.return_value = {"timezone": "Europe/London"}
        return mock

    with patch("app.routers.visitor.requests.get", side_effect=side_effect):
        result = detect_timezone_from_ip("1.2.3.4")

    assert result == "Europe/London"


def test_detect_timezone_from_ip_both_fail():
    """Returns None when both APIs fail."""
    with patch("app.routers.visitor.requests.get", side_effect=Exception("error")):
        result = detect_timezone_from_ip("1.2.3.4")

    assert result is None
