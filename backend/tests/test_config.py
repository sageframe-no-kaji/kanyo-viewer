"""Tests for config module."""
import pytest
from app.config import Settings


def test_settings_initialization():
    """Test Settings initialization."""
    settings = Settings()
    assert settings.APP_NAME == "Kanyo Viewer"
    assert settings.VERSION == "1.0.0"
    assert settings.API_PREFIX == "/api"


def test_streams_property_caching():
    """Test that streams property caches config."""
    settings = Settings()

    # First access should load config
    streams1 = settings.streams

    # Second access should return cached value
    streams2 = settings.streams

    assert streams1 is streams2
