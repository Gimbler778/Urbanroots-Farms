from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
import httpx
from app.core.config import settings
from app.api.dependencies import get_current_user
from app.models import User

router = APIRouter()

SYSTEM_PROMPT = """You are FarmBot, a friendly and knowledgeable AI assistant for UrbanRoots — an urban farming platform that brings fresh, organic food growing into city buildings.

UrbanRoots offers:
- Hydroponic growing pods in three sizes: Standard Pod (ideal for apartments), Premium Pod (for larger spaces), and Commercial Pod (for businesses/restaurants)
- Flexible monthly pod rental plans with installation and maintenance included
- Organic farming products: seeds, nutrients, grow media, lighting, and more
- Professional setup by our expert team — pods are ready to grow in 24 hours
- 24/7 support and expert guidance throughout your farming journey

You are ONLY allowed to help with topics related to:
1. UrbanRoots products, pods, rental plans, pricing, and services
2. Farming, gardening, and agriculture (hydroponics, soil, aquaponics, etc.)
3. Crop selection, planting schedules, harvest tips, and yield optimization
4. Plant health, pest control, nutrient deficiencies, and troubleshooting
5. Urban farming best practices and sustainability

If a user asks about anything completely unrelated to farming, agriculture, or UrbanRoots, politely decline and explain that you are specialized in farming and UrbanRoots topics only.

Keep your responses helpful, concise, and practical. Use simple language. Encourage urban farming!"""


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


class ChatResponse(BaseModel):
    reply: str


@router.post("/farmbot/chat", response_model=ChatResponse)
async def farmbot_chat(request: ChatRequest, current_user: User = Depends(get_current_user)):
    if not settings.cloudflare_account_id or settings.cloudflare_account_id == "your_account_id_here":
        raise HTTPException(
            status_code=503,
            detail="FarmBot is not configured. Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN."
        )

    if not settings.cloudflare_api_token or settings.cloudflare_api_token == "your_api_token_here":
        raise HTTPException(
            status_code=503,
            detail="FarmBot is not configured. Please set CLOUDFLARE_API_TOKEN."
        )

    # Limit to last 20 messages to avoid token overflow
    recent_messages = request.messages[-20:]

    cf_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in recent_messages:
        if msg.role in ("user", "assistant"):
            cf_messages.append({"role": msg.role, "content": msg.content})

    url = (
        f"https://api.cloudflare.com/client/v4/accounts/"
        f"{settings.cloudflare_account_id}/ai/run/@cf/meta/llama-3.1-8b-instruct"
    )

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                url,
                headers={
                    "Authorization": f"Bearer {settings.cloudflare_api_token}",
                    "Content-Type": "application/json",
                },
                json={"messages": cf_messages},
            )
            response.raise_for_status()
            data = response.json()
            reply = data["result"]["response"]
            return ChatResponse(reply=reply)
        except httpx.HTTPStatusError as exc:
            status = exc.response.status_code
            if status == 401:
                raise HTTPException(status_code=502, detail="FarmBot authentication failed. Check your API token.")
            raise HTTPException(status_code=502, detail="FarmBot is temporarily unavailable. Please try again later.")
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="FarmBot took too long to respond. Please try again.")
        except Exception:
            raise HTTPException(status_code=500, detail="An unexpected error occurred. Please try again.")
