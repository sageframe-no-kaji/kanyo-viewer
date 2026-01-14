# Kanyo Viewer Development Guide

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (for production deployment)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd kanyo-viewer
   ```

2. **Backend setup**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Frontend setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Start development servers**

   Terminal 1 (Backend):
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn app.main:app --reload --port 5000
   ```

   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```

   Or use Make:
   ```bash
   make dev-backend  # Terminal 1
   make dev-frontend # Terminal 2
   ```

5. **Access the app**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api
   - API Docs: http://localhost:5000/docs

## Development Workflow

### Making Changes

1. **Backend changes** (Python/FastAPI)
   - Edit files in `backend/app/`
   - Uvicorn auto-reloads on changes
   - Test endpoints at http://localhost:5000/docs

2. **Frontend changes** (React)
   - Edit files in `frontend/src/`
   - Vite HMR updates instantly
   - API calls proxy to backend at :5000

3. **Configuration changes**
   - Edit `backend/streams.yaml` for stream configs
   - Edit `frontend/tailwind.config.js` for styling
   - Edit `.env` for environment variables

### Testing Without Real Data

Create mock data for development:

```bash
mkdir -p test-data/harvard/clips/2026-01-14
```

Create `test-data/harvard/clips/2026-01-14/events_2026-01-14.json`:
```json
[
  {
    "id": "20260114_072315",
    "start_time": "2026-01-14T07:23:15-05:00",
    "end_time": "2026-01-14T07:45:30-05:00",
    "duration_seconds": 1335,
    "peak_confidence": 0.847,
    "thumbnail_path": "falcon_072315_arrival.jpg",
    "arrival_clip_path": "falcon_072315_arrival.mp4",
    "departure_clip_path": "falcon_074530_departure.mp4"
  }
]
```

Add sample clip files (can be any MP4/JPG for testing).

Then update `backend/streams.yaml` to point to `test-data`:
```yaml
streams:
  harvard:
    data_path: "./test-data/harvard"  # Relative path for dev
```

## Docker Development

### Build and test locally

```bash
# Build image
docker compose build

# Run with test data
docker compose -f docker-compose.dev.yml up

# View logs
docker compose logs -f viewer
```

### Test production build locally

```bash
# Build production image
docker compose build

# Run
docker compose up -d

# Check
curl http://localhost:3000/api/streams

# Stop
docker compose down
```

## Deployment to kanyo.lan

### First-time setup on server

```bash
# SSH to server
ssh kanyo.lan

# Clone repo
cd /opt/services
git clone <repo-url> kanyo-viewer
cd kanyo-viewer

# Verify volume mounts exist
ls /opt/services/kanyo-harvard/clips
ls /opt/services/kanyo-nsw/clips

# Build and start
docker compose up -d --build

# Check status
docker compose ps
docker compose logs -f viewer
```

### Deploying updates

From your local machine:

```bash
# Full deployment (rebuilds everything)
./scripts/deploy-viewer.sh

# Quick update (just pulls code and rebuilds)
./scripts/update-viewer.sh

# Or use Make
make deploy
make update
```

### Manual deployment

```bash
ssh kanyo.lan
cd /opt/services/kanyo-viewer
git pull
docker compose down
docker compose up -d --build
```

## Troubleshooting

### Backend issues

**Import errors**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

**Can't find streams.yaml**
- Check `backend/streams.yaml` exists
- Verify paths in `backend/app/config.py`

**No clips found**
- Check `data_path` in `streams.yaml`
- Verify directory structure: `/data/{stream}/clips/YYYY-MM-DD/`
- Check file permissions (read access)

### Frontend issues

**Module not found**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**API calls fail**
- Check backend is running on port 5000
- Verify proxy config in `vite.config.js`
- Check CORS settings in `backend/app/main.py`

**Build fails**
```bash
cd frontend
npm run build
# Check for errors
```

### Docker issues

**Build fails**
- Check Dockerfile syntax
- Verify all files exist
- Check .dockerignore isn't excluding needed files

**Container won't start**
```bash
docker compose logs viewer
# Check for errors
```

**Can't access clips**
- Verify volume mounts in `docker-compose.yml`
- Check paths exist on host
- Verify read permissions: `ls -la /opt/services/kanyo-harvard/clips`

## Code Structure

```
kanyo-viewer/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app entry point
│   │   ├── config.py         # Settings and stream loader
│   │   └── routers/
│   │       ├── streams.py    # Stream endpoints
│   │       ├── clips.py      # File serving
│   │       └── visitor.py    # Timezone detection
│   ├── requirements.txt
│   └── streams.yaml          # Stream configuration
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Router setup
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   └── utils/            # API client, timezone utils
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── scripts/
│   ├── deploy-viewer.sh      # Full deployment
│   └── update-viewer.sh      # Quick update
├── Dockerfile                # Multi-stage build
├── docker-compose.yml        # Production config
├── docker-compose.dev.yml    # Dev config
└── Makefile                  # Convenience commands
```

## Making Changes

### Adding a new stream

1. Add entry to `backend/streams.yaml`:
   ```yaml
   streams:
     new_stream:
       name: "New Stream Name"
       youtube_id: "YouTube_Video_ID"
       data_path: "/data/new_stream"
       timezone: "America/Los_Angeles"
       display:
         short_name: "New"
         location: "Location"
         species: "Species Name"
         telegram_channel: "channel_name"
   ```

2. Add volume mount in `docker-compose.yml`:
   ```yaml
   volumes:
     - /opt/services/kanyo-new-stream:/data/new_stream:ro
   ```

3. Deploy changes

### Adding a new API endpoint

1. Add route in appropriate router (`backend/app/routers/`)
2. Test locally with FastAPI docs
3. Add client method in `frontend/src/utils/api.js`
4. Use in React components

### Styling changes

1. Edit Tailwind classes in components
2. Or add custom colors in `frontend/tailwind.config.js`
3. Or add custom CSS in `frontend/src/index.css`

## Useful Commands

```bash
# View all available commands
make help

# Development
make dev-backend
make dev-frontend

# Docker
make build
make up
make down
make logs

# Deployment
make deploy
make update

# Maintenance
make clean
```

## Environment Variables

### Backend (.env)
- `KANYO_ENV` - development or production

### Frontend (.env)
- `VITE_API_BASE` - API base URL (default: /api)

## Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com
- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Docker Compose**: https://docs.docker.com/compose/
