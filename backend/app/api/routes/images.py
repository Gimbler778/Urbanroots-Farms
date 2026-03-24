from typing import Dict, List

import httpx
from fastapi import APIRouter, Query

from app.core.config import settings


router = APIRouter(prefix="/images", tags=["images"])

# Lightweight in-memory cache to reduce repeated Pexels requests.
_image_cache: Dict[str, List[str]] = {}

_fallback_icons = [
    "https://cdn-icons-png.flaticon.com/512/747/747376.png",  # Mouse cursor
    "https://cdn-icons-png.flaticon.com/512/2292/2292039.png",  # Sensor/tool
]


def _build_fallback_images(search_query: str, count: int) -> List[str]:
    seed = sum(ord(ch) for ch in search_query) % len(_fallback_icons)
    return [_fallback_icons[(seed + i) % len(_fallback_icons)] for i in range(count)]


@router.get("/search")
async def search_images(
    query: str = Query(..., min_length=2),
    count: int = Query(2, ge=1, le=5),
):
    cache_key = f"{query.lower().strip()}::{count}"
    if cache_key in _image_cache:
        return {"images": _image_cache[cache_key], "source": "cache"}

    if not settings.pexels_api_key:
        fallback = _build_fallback_images(query, count)
        return {"images": fallback, "source": "fallback"}

    try:
        params = {
            "query": query,
            "per_page": count,
            "orientation": "landscape",
        }
        headers = {
            "Authorization": settings.pexels_api_key,
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://api.pexels.com/v1/search",
                params=params,
                headers=headers,
            )
            response.raise_for_status()
            payload = response.json()

        results = payload.get("photos", [])
        images = [
            item.get("src", {}).get("large2x")
            or item.get("src", {}).get("large")
            or item.get("src", {}).get("medium")
            for item in results
            if item.get("src", {}).get("large2x")
            or item.get("src", {}).get("large")
            or item.get("src", {}).get("medium")
        ][:count]

        if not images:
            images = _build_fallback_images(query, count)
            source = "fallback"
        else:
            source = "pexels"

        if source == "pexels":
            _image_cache[cache_key] = images
        return {"images": images, "source": source}
    except Exception:
        fallback = _build_fallback_images(query, count)
        return {"images": fallback, "source": "fallback"}
