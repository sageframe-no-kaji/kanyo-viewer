"""Visitor timezone detection endpoint."""
from fastapi import APIRouter, Request
import requests
from typing import Optional

router = APIRouter()


def get_client_ip(request: Request) -> str:
    """Extract client IP from request headers."""
    # Check for forwarded IP (if behind proxy/load balancer)
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()

    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip

    # Fallback to direct connection
    if request.client:
        return request.client.host

    return "unknown"


def detect_timezone_from_ip(ip: str) -> Optional[str]:
    """Detect timezone from IP address using external API."""
    if ip == "unknown" or ip.startswith("127.") or ip.startswith("192.168.") or ip.startswith("10."):
        # Local/private IP - can't geolocate
        return None

    # Try ipapi.co first (150 req/day free)
    try:
        response = requests.get(f"https://ipapi.co/{ip}/timezone/", timeout=2)
        if response.status_code == 200:
            timezone = response.text.strip()
            if timezone and not timezone.startswith("Undefined"):
                return timezone
    except Exception:
        pass

    # Fallback to geojs.io
    try:
        response = requests.get(f"https://get.geojs.io/v1/ip/timezone/{ip}.json", timeout=2)
        if response.status_code == 200:
            data = response.json()
            timezone = data.get("timezone")
            if timezone:
                return timezone
    except Exception:
        pass

    return None


@router.get("/timezone")
async def get_visitor_timezone(request: Request):
    """
    Detect visitor's timezone from IP address.

    This is a fallback for when JavaScript Intl API fails.
    Returns timezone in IANA format (e.g., "America/New_York").
    """
    ip = get_client_ip(request)
    timezone = detect_timezone_from_ip(ip)

    return {
        "ip": ip,
        "timezone": timezone,
        "detected": timezone is not None
    }
