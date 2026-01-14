"""Main FastAPI application for Kanyo Viewer."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

from app.config import settings
from app.routers import streams, clips, visitor


# Create FastAPI app
app = FastAPI(title=settings.APP_NAME, version=settings.VERSION, debug=settings.DEBUG)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(streams.router, prefix=f"{settings.API_PREFIX}/streams", tags=["streams"])
app.include_router(clips.router, prefix=f"{settings.API_PREFIX}/clips", tags=["clips"])
app.include_router(visitor.router, prefix=f"{settings.API_PREFIX}/visitor", tags=["visitor"])

# Serve frontend static files (built by Vite)
static_dir = Path(__file__).parent.parent / "frontend" / "dist"
if static_dir.exists():
    app.mount("/assets", StaticFiles(directory=static_dir / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve React app for all non-API routes."""
        # Return index.html for all routes (React Router handles routing)
        if full_path.startswith("api/"):
            return {"error": "Not found"}

        file_path = static_dir / full_path
        if file_path.is_file():
            return FileResponse(file_path)

        # Default to index.html for React Router
        return FileResponse(static_dir / "index.html")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "env": settings.ENV,
    }
