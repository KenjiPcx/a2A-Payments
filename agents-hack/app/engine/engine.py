import os
from typing import List

from llama_index.core.agent import AgentRunner
from llama_index.core.callbacks import CallbackManager
from llama_index.core.settings import Settings
from llama_index.core.tools import BaseTool

from app.engine.index import IndexConfig, get_index
from app.engine.tools import ToolFactory
from app.engine.tools.query_engine import get_query_engine_tool
from llama_index.core.chat_engine import CondensePlusContextChatEngine
from llama_index.core.memory import ChatMemoryBuffer

def get_chat_engine(params=None, event_handlers=None, **kwargs):
    system_prompt = os.getenv("SYSTEM_PROMPT")
    
    # tools: List[BaseTool] = []
    top_k = int(os.getenv("TOP_K", 0))
    llm = Settings.llm
    memory = ChatMemoryBuffer.from_defaults(
        token_limit=llm.metadata.context_window - 256
    )
    callback_manager = CallbackManager(handlers=event_handlers or [])

    # Add query tool if index exists
    index_config = IndexConfig(callback_manager=callback_manager, **(params or {}))
    index = get_index(index_config)
    # if index is not None:
    #     query_engine_tool = get_query_engine_tool(index, **kwargs)
    #     tools.append(query_engine_tool)

    # Add additional tools
    # configured_tools: List[BaseTool] = ToolFactory.from_env()
    # tools.extend(configured_tools)

    # return AgentRunner.from_llm(
    #     llm=Settings.llm,
    #     tools=tools,
    #     system_prompt=system_prompt,
    #     callback_manager=callback_manager,
    #     verbose=True,
    # )

    retriever = index.as_retriever(similarity_top_k=10,)
    
    return CondensePlusContextChatEngine(
        llm=llm,
        memory=memory,
        retriever=retriever,
        callback_manager=callback_manager,
    )