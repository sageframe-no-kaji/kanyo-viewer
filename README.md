# Kanyo Viewer

Public-facing viewer for the Kanyo falcon monitoring system. Displays live streams, event timelines, and archived clips from falcon camera feeds.

## Overview

This is a standalone React + FastAPI application that reads clip data from the Kanyo detection pipeline and presents it in a clean, HKSV-inspired dark theme interface.

## Features

- **Live Stream Viewing** - Watch YouTube live feeds with one-click toggle
- **Event Timeline** - HKSV-style horizontal timeline with thumbnails positioned by actual event time
- **Dual Timezone Display** - Shows both stream local time and visitor timezone
- **Event Archives** - Browse arrivals and departures by date
- **Statistics** - View visit counts over configurable time ranges (24h, 2d, 3d, etc.)
- **Mobile Responsive** - Fully responsive with touch-optimized timeline scrolling
- **Share & Download** - Direct download links and shareable URLs for specific events

## Architecture

### Backend (`/backend`)
- FastAPI (Python 3.11)
- Serves API endpoints and static frontend files
- Reads events from `events_YYYY-MM-DD.json` files
- Timezone-aware date handling with `pytz`
- Secure file serving with path traversal protection

### Frontend (`/frontend`)
- React 18 + Vite
- Tailwind CSS 4 (dark theme)
- React Router for navigation
- Client-side timezone detection

### Deployment
- Multi-stage Docker build (Node → Python)
- Mounts clip directories read-only from detection containers
- Runs on port 3000

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker (for production deployment)

### Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 5000
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

Frontend dev server runs on http://localhost:5173 and proxies API requests to backend.

## Production Deployment

### On kanyo.lan

The viewer is deployed to `/opt/services/kanyo-viewer` on the production server.

### Initial Setup
```bash
# On kanyo.lan
cd /opt/services
git clone <repo-url> kanyo-viewer
cd kanyo-viewer
docker compose up -d --build
```

### Quick Updates

From your local machine:

```bash
# Full deployment (stop, rebuild, restart)
./scripts/deploy-viewer.sh

# Quick update (just rebuild viewer container)
./scripts/update-viewer.sh
```

### Manual Commands

```bash
# SSH to server
ssh kanyo.lan

# Navigate to viewer directory
cd /opt/services/kanyo-viewer

# Pull latest code
git pull

# Rebuild and restart
docker compose up -d --build

# View logs
docker compose logs -f viewer

# Stop
docker compose down
```

## Configuration

### Stream Registry (`backend/streams.yaml`)

Add new streams by editing the YAML config:

```yaml
streams:
  stream_id:
    name: "Stream Display Name"
    youtube_id: "YouTube_Video_ID"
    data_path: "/data/stream_id"
    timezone: "America/New_York"
    display:
      short_name: "Short Name"
      location: "Location Description"
      species: "Species Name"
      maintainer: "Maintainer Name"
      telegram_channel: "telegram_channel_name"
      thumbnail_url: "https://example.com/thumbnail.jpg"  # Optional
```

### Landing Page Thumbnails

The landing page displays stream thumbnails with a 3-level fallback system:

1. **Static images** (highest priority) - Place JPG files in `frontend/public/thumbnails/`:
   ```bash
   frontend/public/thumbnails/
     ├── kanyo-harvard.jpg
     └── kanyo-nsw.jpg
   ```
   The filename must match the stream ID from `streams.yaml`.

   **Recommended size**: 1280×720 pixels (16:9 aspect ratio)
   - Minimum: 640×360 pixels
   - Maximum: 1920×1080 pixels
   - Format: JPG (recommended) or PNG
   - File size: Keep under 500KB for fast loading

2. **URL from config** - Add `thumbnail_url` to the stream's `display` section in `streams.yaml`:
   ```yaml
   display:
     thumbnail_url: "https://example.com/stream-thumbnail.jpg"
   ```

3. **Recent snapshot** - The viewer will automatically try to fetch a recent snapshot from the API at `/api/streams/{stream_id}/snapshot`.

4. **Default icon** - If all else fails, displays an orange circle with the white Kanyo falcon logo.

**Recommended**: Use static images for best performance. Simply drop a JPG file into `frontend/public/thumbnails/` with the stream ID as the filename.

### Data Paths

The viewer expects the following directory structure for each stream:

```
/data/{stream_id}/clips/
  ├── 2026-01-14/
  │   ├── events_2026-01-14.json
  │   ├── falcon_072315_arrival.mp4
  │   ├── falcon_072315_arrival.jpg
  │   ├── falcon_074530_departure.mp4
  │   └── falcon_074530_departure.jpg
  └── 2026-01-15/
      └── ...
```

## API Endpoints

- `GET /api/streams` - List all streams with stats
- `GET /api/streams/{id}` - Stream detail
- `GET /api/streams/{id}/events?date=YYYY-MM-DD` - Events for date
- `GET /api/streams/{id}/stats?range=24h|2d|3d` - Stats for range
- `GET /api/clips/{stream}/{date}/{filename}` - Serve media files
- `GET /api/visitor/timezone` - Detect visitor timezone from IP

## Technology Stack

- **Backend**: FastAPI, Python 3.11, PyYAML, pytz
- **Frontend**: React 18, Vite, React Router, Tailwind CSS 4
- **Deployment**: Docker, docker-compose
- **Server**: kanyo.lan (self-hosted)

## Related Projects

- **kanyo-contemplating-falcons** - Detection pipeline (separate repo)
- **kanyo-admin** - Admin interface for managing streams

## License

[Add license information]
