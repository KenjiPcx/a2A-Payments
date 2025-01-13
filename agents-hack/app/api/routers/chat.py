import logging

from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, status
from llama_index.core.llms import MessageRole
from qdrant_client import QdrantClient
import os
from typing import List, Optional, Tuple
from pydantic import BaseModel

from app.api.routers.events import EventCallbackHandler
from app.api.routers.models import (
    ChatData,
    Message,
    Result,
    SourceNodes,
)
from app.api.routers.vercel_response import VercelStreamResponse
from app.engine.engine import get_chat_engine
from app.engine.query_filter import generate_filters

chat_router = r = APIRouter()

logger = logging.getLogger("uvicorn")


# streaming endpoint - delete if not needed
@r.post("")
async def chat(
    request: Request,
    data: ChatData,
    background_tasks: BackgroundTasks,
):
    try:
        last_message_content = data.get_last_message_content()
        messages = data.get_history_messages()

        doc_ids = data.get_chat_document_ids()
        filters = generate_filters(doc_ids)
        params = data.data or {}
        logger.info(
            f"Creating chat engine with filters: {str(filters)}",
        )
        event_handler = EventCallbackHandler()
        chat_engine = get_chat_engine(
            filters=filters, params=params, event_handlers=[event_handler]
        )
        response = chat_engine.astream_chat(last_message_content, messages)

        return VercelStreamResponse(
            request, event_handler, response, data, background_tasks
        )
    except Exception as e:
        logger.exception("Error in chat engine", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error in chat engine: {e}",
        ) from e


# non-streaming endpoint - delete if not needed
@r.post("/request")
async def chat_request(
    data: ChatData,
) -> Result:
    last_message_content = data.get_last_message_content()
    messages = data.get_history_messages()

    doc_ids = data.get_chat_document_ids()
    filters = generate_filters(doc_ids)
    params = data.data or {}
    logger.info(
        f"Creating chat engine with filters: {str(filters)}",
    )

    chat_engine = get_chat_engine(filters=filters, params=params)

    response = await chat_engine.achat(last_message_content, messages)
    return Result(
        result=Message(role=MessageRole.ASSISTANT, content=response.response),
        nodes=SourceNodes.from_source_nodes(response.source_nodes),
    )

class Coordinates(BaseModel):
    latitude: float
    longitude: float

class User(BaseModel):
    id: str
    name: str
    email: str
    location: str
    coordinates: Optional[Coordinates] = None
    x_account: str
    linkedin_url: str
    highlights: Optional[List[str]] = []
    summary: Optional[str] = None
    profile_image_url: Optional[str] = None
    anonymous: bool
    skills: Optional[List[str]] = []
    interests: Optional[List[str]] = []

class UsersResponse(BaseModel):
    users: List[User]
    total: int
    message: Optional[str] = None

# Add the new endpoint
@r.get("/users", response_model=UsersResponse)
async def get_users():
    try:
        client = QdrantClient(
            url=os.getenv("QDRANT_URL"),
            api_key=os.getenv("QDRANT_API_KEY"),
        )
        
        response = client.scroll(
            collection_name=os.getenv("QDRANT_COLLECTION"),
            limit=1000,
        )
        
        logger.info(f"Found {len(response[0])} users")
        
        users = []
        for point in response[0]:
            user = User(
                id=point.id,
                name=point.payload.get("name", ""),
                email=point.payload.get("email", ""),
                location=point.payload.get("location", ""),
                coordinates=Coordinates(
                    latitude=point.payload.get("latitude", 0.0),
                    longitude=point.payload.get("longitude", 0.0),
                ),
                x_account=point.payload.get("x_account", ""),
                linkedin_url=point.payload.get("linkedin_url", ""),
                highlights=point.payload.get("highlights", []),
                summary=point.payload.get("summary", ""),
                profile_image_url=point.payload.get("profile_image_url"),
                anonymous=point.payload.get("anonymous", False),
                skills=point.payload.get("skills", []),
                interests=point.payload.get("interests", []),
            )
            users.append(user)
                
        return UsersResponse(users=users, total=len(users), message=None)
    except Exception as e:
        logger.exception("Error fetching users from Qdrant", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching users: {str(e)}",
        )
