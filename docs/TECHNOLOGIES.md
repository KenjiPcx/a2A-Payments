# Technologies Guide

## LlamaIndex
LlamaIndex is a framework for easily building vector search applications.
Here is how we build a simple retriever:

```python
from llama_index.vector_stores import VectorStoreIndex

# Create a vector store index
index = VectorStoreIndex.from_documents(documents)

# Create a retriever
retriever = index.as_retriever(top_k=10)
```

Here is how we customize the documents to decide what to embed:
Read the docs here: https://docs.llamaindex.ai/en/stable/module_guides/loading/documents_and_nodes/usage_documents/
We should only embed fields that can be used as indexes to search for the users, like their skills, interests, story etc.

```python
document = Document(
    text="This is a super-customized document",
    metadata={
        "file_name": "super_secret_document.txt",
        "category": "finance",
        "author": "LlamaIndex",
    },
    excluded_llm_metadata_keys=["file_name"],
    metadata_seperator="::",
    metadata_template="{key}=>{value}",
    text_template="Metadata: {metadata_str}\n-----\nContent: {content}",
)
```

## Qdrant

Qdrant is a vector database that is used to store the vectors and the documents. We can use it as a database, here is how you can use the python client to fetch all documents in a collection:

```python
client.scroll(
    collection_name="{collection_name}",
    scroll_filter=models.Filter(
        must=[
            models.FieldCondition(key="color", match=models.MatchValue(value="red")),
        ]
    ),
    limit=1,
    with_payload=True,
    with_vectors=False,
)
```

We can use it to fetch all the users and let the frontend handle searching since there are only 120 users.

Qdrant llamaIndex integration:

```python
client = qdrant_client.QdrantClient(
    # url="http://<host>:<port>"
    # api_key="<qdrant-api-key>",
)
vector_store = QdrantVectorStore(client=client, collection_name="paul_graham")
storage_context = StorageContext.from_defaults(vector_store=vector_store)
index = VectorStoreIndex.from_documents(
    documents,
    storage_context=storage_context,
)
Query Index
# set Logging to DEBUG for more detailed outputs
query_engine = index.as_query_engine()
response = query_engine.query("What did the author do growing up?")
display(Markdown(f"<b>{response}</b>"))
The author worked on writing and programming before college.
```

## Vercel AI UI SDK

```tsx
'use client';

import { useChat } from 'ai/react';

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({});

  return (
    <>
      {messages.map(message => (
        <div key={message.id}>
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input name="prompt" value={input} onChange={handleInputChange} />
        <button type="submit">Submit</button>
      </form>
    </>
  );
}
```

## Tavily Search

pip install tavily-python

Getting and printing the full Search API response

```python
from tavily import TavilyClient

tavily_client = TavilyClient(api_key="tvly-YOUR_API_KEY")
response = tavily_client.search("Who is Leo Messi?")
print(response)
```

Generating context for a RAG Application

```python
from tavily import TavilyClient

tavily_client = TavilyClient(api_key="tvly-YOUR_API_KEY")
context = tavily_client.get_search_context(query="What happened during the Burning Man floods?")
print(context)
```

## LlamaIndex Chat

```python
import os

os.environ["OPENAI_API_KEY"] = "sk-..."
from llama_index.llms.openai import OpenAI

llm = OpenAI(
    model="gpt-4o-mini",
    # api_key="some key",  # uses OPENAI_API_KEY env var by default
)
```

Call complete with a prompt

```python
from llama_index.llms.openai import OpenAI

resp = llm.complete("Paul Graham is ")
print(resp)
a computer scientist, entrepreneur, and venture capitalist. He is best known for co-founding the startup accelerator Y Combinator and for his work on Lisp, a programming language. Graham has also written several influential essays on startups, technology, and entrepreneurship.
Call chat with a list of messages
from llama_index.core.llms import ChatMessage

messages = [
    ChatMessage(
        role="system", content="You are a pirate with a colorful personality"
    ),
    ChatMessage(role="user", content="What is your name"),
]
resp = llm.chat(messages)
print(resp)
```

Structured output

```python
class LineItem(BaseModel):
    """A line item in an invoice."""

    item_name: str = Field(description="The name of this item")
    price: float = Field(description="The price of this item")


class Invoice(BaseModel):
    """A representation of information from an invoice."""

    invoice_id: str = Field(
        description="A unique identifier for this invoice, often a number"
    )
    date: datetime = Field(description="The date this invoice was created")
    line_items: list[LineItem] = Field(
        description="A list of all the items in this invoice"
    )

from llama_index.llms.openai import OpenAI

llm = OpenAI(model="gpt-4o")
sllm = llm.as_structured_llm(Invoice)

response = sllm.complete(text)
```

## Web Scraper

```python
from llama_index_readers_web import SimpleWebPageReader

documents = SimpleWebPageReader(html_to_text=True).load_data(
    ["http://paulgraham.com/worked.html"]
)
```

## Linkedin Scraper

```python
from apify_client import ApifyClient

# Initialize the ApifyClient with your API token
client = ApifyClient("<YOUR_API_TOKEN>")

# Prepare the Actor input
run_input = { "profileUrls": [
        "https://www.linkedin.com/in/williamhgates",
        "http://www.linkedin.com/in/jeannie-wyrick-b4760710a",
    ] }

# Run the Actor and wait for it to finish
run = client.actor("2SyF0bVxmgGr8IVCZ").call(run_input=run_input)

# Fetch and print Actor results from the run's dataset (if there are any)
for item in client.dataset(run["defaultDatasetId"]).iterate_items():
    print(item)
```
