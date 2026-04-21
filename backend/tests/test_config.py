"""Tests for config module."""
import tempfile
from pathlib import Path
import yaml
from app.config import Settings


def test_settings_initialization():
    """Test Settings initialization."""
    settings = Settings()
    assert settings.APP_NAME == "Kanyo Viewer"
    assert settings.VERSION == "1.0.0"
    assert settings.API_PREFIX == "/api"


def test_streams_property_caching(override_streams_config):
    """Test that streams property caches result after first access."""
    settings = override_streams_config
    streams1 = settings.streams
    streams2 = settings.streams
    assert streams1 is streams2


def test_auto_discovery_finds_streams_with_config():
    """Directories containing config.yaml are discovered as streams."""
    with tempfile.TemporaryDirectory() as tmpdir:
        data_dir = Path(tmpdir)
        stream_dir = data_dir / "kanyo-testcam"
        stream_dir.mkdir()
        (stream_dir / "config.yaml").write_text(
            yaml.dump({"stream_name": "Test Cam", "timezone": "UTC"})
        )

        settings = Settings()
        settings.DATA_DIR = data_dir
        streams = settings.streams

    assert "kanyo-testcam" in streams
    assert streams["kanyo-testcam"]["name"] == "Test Cam"
    assert streams["kanyo-testcam"]["data_path"] == str(stream_dir)


def test_auto_discovery_skips_dirs_without_config():
    """Directories without config.yaml are silently ignored."""
    with tempfile.TemporaryDirectory() as tmpdir:
        data_dir = Path(tmpdir)
        (data_dir / "no-config-here").mkdir()

        settings = Settings()
        settings.DATA_DIR = data_dir
        streams = settings.streams

    assert len(streams) == 0


def test_auto_discovery_empty_data_dir():
    """Missing DATA_DIR returns empty dict rather than raising."""
    settings = Settings()
    settings.DATA_DIR = Path("/nonexistent/path/that/cannot/exist")
    assert settings.streams == {}


def test_auto_discovery_extracts_youtube_id():
    """YouTube video_source URL is parsed into youtube_id."""
    with tempfile.TemporaryDirectory() as tmpdir:
        data_dir = Path(tmpdir)
        stream_dir = data_dir / "kanyo-yt"
        stream_dir.mkdir()
        (stream_dir / "config.yaml").write_text(
            yaml.dump({
                "stream_name": "YT Cam",
                "timezone": "UTC",
                "video_source": "https://www.youtube.com/watch?v=abc123XYZ",
            })
        )

        settings = Settings()
        settings.DATA_DIR = data_dir
        streams = settings.streams

    assert streams["kanyo-yt"]["youtube_id"] == "abc123XYZ"


def test_auto_discovery_handles_malformed_config(tmp_path):
    """A stream directory with unparseable config.yaml is skipped without crashing."""
    stream_dir = tmp_path / "kanyo-broken"
    stream_dir.mkdir()
    (stream_dir / "config.yaml").write_bytes(b"\xff\xfe invalid utf-8 \x00\x01")

    good_dir = tmp_path / "kanyo-good"
    good_dir.mkdir()
    (good_dir / "config.yaml").write_text(yaml.dump({"stream_name": "Good", "timezone": "UTC"}))

    settings = Settings()
    settings.DATA_DIR = tmp_path
    streams = settings.streams

    assert "kanyo-broken" not in streams
    assert "kanyo-good" in streams


def test_auto_discovery_discovery_order(tmp_path):
    """Streams are discovered in sorted directory order."""
    for name in ["kanyo-zzz", "kanyo-aaa", "kanyo-mmm"]:
        d = tmp_path / name
        d.mkdir()
        (d / "config.yaml").write_text(yaml.dump({"stream_name": name, "timezone": "UTC"}))

    settings = Settings()
    settings.DATA_DIR = tmp_path
    keys = list(settings.streams.keys())

    assert keys == sorted(keys)
