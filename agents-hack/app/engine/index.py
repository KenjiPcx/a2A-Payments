import logging
from typing import Optional

from llama_index.core.callbacks import CallbackManager
from llama_index.core.indices import VectorStoreIndex
from pydantic import BaseModel, Field

from app.engine.vectordb import get_vector_store

logger = logging.getLogger("uvicorn")


class IndexConfig(BaseModel):
    callback_manager: Optional[CallbackManager] = Field(
        default=None,
    )


def get_index(config: IndexConfig = None):
    if config is None:
        config = IndexConfig()
    logger.info("Connecting vector store...")
    store = get_vector_store()
    # Load the index from the vector store
    # If you are using a vector store that doesn't store text,
    # you must load the index from both the vector store and the document store
    index = VectorStoreIndex.from_vector_store(
        store, callback_manager=config.callback_manager
    )
    logger.info("Finished load index from vector store.")
    return index

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    from app.settings import init_openai
    init_openai()
    
    index = get_index()
    query_engine = index.as_query_engine()
    response = query_engine.query("Who is working on both blockchain and AI?")
    logger.info(f"Response: {response}")
    print(response)
