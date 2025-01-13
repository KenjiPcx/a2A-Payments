import pandas as pd
import logging
from typing import Optional, Dict, List, Any, Literal
from dataclasses import dataclass
import os
from dotenv import load_dotenv
from tavily import TavilyClient
from llama_index.llms.openai import OpenAI
from pydantic import BaseModel, Field
import json
from llama_index.readers.web import SimpleWebPageReader
import re
from apify_client import ApifyClient
import time
import geocoder
from llama_index.core import Document, VectorStoreIndex, StorageContext
from llama_index.vector_stores.qdrant import QdrantVectorStore
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core.settings import Settings
from qdrant_client import QdrantClient

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize clients
tavily_client = TavilyClient(api_key=os.getenv('TAVILY_API_KEY'))
apify_client = ApifyClient(os.getenv('APIFY_API_TOKEN'))

# Initialize LLM and embedding model
llm = OpenAI(model="gpt-4o", api_key=os.getenv('OPENAI_API_KEY'))
embed_model = OpenAIEmbedding(model="text-embedding-3-small", api_key=os.getenv('OPENAI_API_KEY'), dimensions=1536)
Settings.llm = llm
Settings.embed_model = embed_model

class LinkedinScrapedResult(BaseModel):
    summary: str = Field(description="A summary of the person's profile, summarizing their achievements, figure out how to best sell them to the audience, bring up metrics and uniqueness")
    highlights: List[str] = Field(description="A list of highlights from the person's profile, showcasing their work and experience, capture wow and interesting moments, highlight their metrics and uniqueness")
    skills: List[str] = Field(description="A list of top 5 skills from the person's profile, showcasing what they bring to the table")
    interests: List[str] = Field(description="A list of top 5interests from the person's profile, thought leaders or companies they follow")

@dataclass
class UserProfile:
    name: str
    email: str
    location: str
    x_account: str
    linkedin_url: str
    anonymous: bool = False
    coordinates: Optional[tuple[float, float]] = None
    summary: Optional[str] = None
    highlights: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    profile_image_url: Optional[str] = None

def load_users(csv_path: str) -> List[UserProfile]:
    """Load users from CSV with their social profiles"""
    try:
        logger.info(f"Loading CSV file from: {csv_path}")
        df = pd.read_csv(csv_path)
        
        # Fill NaN values with empty strings
        df = df.fillna('')
        
        users = []
        for _, row in df.iterrows():
            user = UserProfile(
                name=str(row['name']).strip(),
                email=str(row['email']).strip(),
                location=str(row['location']).strip(),
                x_account=str(row['x']).strip(),
                linkedin_url=str(row['Linkedin']).strip(),
                # Mark as anonymous if missing crucial fields
                anonymous=not (str(row['Linkedin']).strip() or str(row['x']).strip())
            )
            users.append(user)
            
        logger.info(f"Loaded {len(users)} users")
        return users
        
    except Exception as e:
        logger.error(f"Error loading CSV: {str(e)}")
        raise

def process_users(users: List[UserProfile]) -> List[UserProfile]:
    """Process users to enrich their profiles"""
    processed_users = []
    
    for user in users:
        logger.info(f"Processing user {user.name}")
        try:
            # Get coordinates from location
            lat, lng, city, country = get_location_coordinates(user.location)
            if lat and lng:
                user.coordinates = (lat, lng)
                
            if user.anonymous:
                logger.info(f"User {user.name} is anonymous, skipping")
                processed_users.append(user)
                continue

            # Scrape LinkedIn if URL provided
            if user.linkedin_url:
                profile_data = scrape_linkedin_profile(user.linkedin_url)
                if profile_data:
                    profile_json = json.loads(profile_data)
                    
                    # Extract highlights and summary using LLM
                    highlights_prompt = f"""Extract key professional highlights and a summary from this LinkedIn profile:
                    {json.dumps(profile_json, indent=2)}
                    
                    Focus on:
                    1. Technical achievements
                    2. Leadership roles
                    3. Notable projects
                    4. Skills and expertise
                    
                    Format:
                    - List of 3-8 key highlights
                    - One paragraph summary"""
                    
                    structured_llm = llm.as_structured_llm(LinkedinScrapedResult)
                    response = structured_llm.complete(highlights_prompt)
                    res: LinkedinScrapedResult = response.raw
                    user.highlights = res.highlights
                    user.summary = res.summary
                    user.skills = res.skills
                    user.interests = res.interests
                    user.profile_image_url = profile_json.get('profilePic', '')
                    
            processed_users.append(user)
            logger.info(f"Processed user {user.name}")
                
        except Exception as e:
            logger.error(f"Error processing user {user.name}: {str(e)}")
            processed_users.append(user)
            continue
        
    print(f"Completed processing {len(processed_users)} users")
    return processed_users

def create_user_document(user: UserProfile) -> Document:
    """Create a Document from a UserProfile for vector store ingestion"""
    metadata = {
        "name": user.name,
        "email": user.email,
        "location": user.location,
        "x_account": user.x_account,
        "linkedin_url": user.linkedin_url,
        "profile_image_url": user.profile_image_url or "",
        "anonymous": user.anonymous,
        "summary": user.summary,
        "highlights": user.highlights,
        "skills": user.skills,
        "interests": user.interests,
    }
    
    if user.coordinates:
        metadata.update({
            "latitude": user.coordinates[0],
            "longitude": user.coordinates[1]
        })
        
    text = f"""
    The user is {user.name}, they are based in {user.location}, they are a {user.skills}, they are interested in {user.interests}
    
    Here is a summary of their profile: 
    {user.summary}
    
    These are their highlights: 
    {user.highlights}
    """

    return Document(
        text=text,
        metadata=metadata,
        excluded_embed_metadata_keys=[
            "profile_image_url",
            "latitude",
            "longitude",
            "x_account",
            "linkedin_url",
            "skills",
            "interests"
        ],
        
    )

def scrape_linkedin_profile(url: str) -> Optional[str]:
    """
    Scrape a LinkedIn profile using Apify and return stringified JSON data
    """
    try:
        logger.info(f"Scraping LinkedIn profile: {url}")
        
        # Prepare the Actor input
        run_input = {
            "profileUrls": [url],
        }

        # Run the Actor and wait for it to finish
        run = apify_client.actor("2SyF0bVxmgGr8IVCZ").call(run_input=run_input, wait_secs=60)
        
        # Wait for results
        for _ in range(30):  # timeout after 30 seconds
            success = False
            try:
                # Try to get the first result
                result = next(apify_client.dataset(run["defaultDatasetId"]).iterate_items())
                success = True
                logger.info(f"Successfully scraped LinkedIn profile")
                return json.dumps(result, indent=2)
                
            except StopIteration:
                if success:
                    break
                time.sleep(1)
                continue
            
        logger.error("Timeout waiting for LinkedIn scraping results")
        return None
        
    except Exception as e:
        logger.error(f"Error scraping LinkedIn profile: {str(e)}")
        return None

def get_location_coordinates(location_str: str) -> tuple[Optional[float], Optional[float], Optional[str], Optional[str]]:
    """
    Get coordinates for a location, falling back to country center if city not found
    """
    # Set up geocoder with user agent
    headers = {
        'User-Agent': 'HackathonUserMapper/1.0 (ken.pcx@outlook.com)'  # Replace with your email
    }
    
    # Try specific location first
    g = geocoder.osm(location_str, headers=headers)
    
    if g.ok:
        return g.lat, g.lng, g.city, g.country
    
    # If failed and looks like a country name, try country lookup
    g = geocoder.osm(location_str, method='country', headers=headers)
    if g.ok:
        return g.lat, g.lng, None, g.country
    
    # Hardcoded fallbacks for common countries
    country_centers = {
        'Canada': (56.1304, -106.3468),
        'United States': (37.0902, -95.7129),
        'India': (20.5937, 78.9629),
        'United Kingdom': (55.3781, -3.4360),
    }
    
    # Check if the location matches any country names (case insensitive)
    location_lower = location_str.lower()
    for country, coords in country_centers.items():
        if country.lower() in location_lower:
            logger.info(f"Using hardcoded coordinates for {country}")
            return coords[0], coords[1], None, country
    
    logger.warning(f"Could not geocode location: {location_str}")
    return None, None, None, None

def ingest_to_qdrant(users: List[UserProfile]):
    """
    Ingest processed users into Qdrant vector store
    """
    try:
        # Initialize Qdrant client
        client = QdrantClient(
            url=os.getenv('QDRANT_URL'),
            api_key=os.getenv('QDRANT_API_KEY')
        )
        
        # Create Qdrant vector store
        vector_store = QdrantVectorStore(
            client=client,
            collection_name=os.getenv('QDRANT_COLLECTION')
        )
        
        # Create storage context
        storage_context = StorageContext.from_defaults(
            vector_store=vector_store
        )
        
        # Create documents from users
        documents = []
        for user in users:
            try:
                doc = create_user_document(user)
                documents.append(doc)
                logger.info(f"Created document for user: {user.name}")
            except Exception as e:
                logger.error(f"Error creating document for user {user.name}: {str(e)}")
                continue
        
        # Create index and ingest documents
        logger.info(f"Ingesting {len(documents)} documents to Qdrant")
        index = VectorStoreIndex.from_documents(
            documents,
            storage_context=storage_context,
            show_progress=True
        )
        
        logger.info("Successfully ingested documents to Qdrant")
        
        return index
    except Exception as e:
        logger.error(f"Error ingesting to Qdrant: {str(e)}")
        raise

if __name__ == "__main__":
    
    csv_path = "/home/kenji/agents-community/a2A-Payments/Agent to Agent PAYMENT$ hackathon - Guests - 2025-01-11-16-27-14 - Agent to Agent PAYMENT$ hackathon - Guests - 2025-01-11-16-27-14.csv.csv"
    users = load_users(csv_path)[50:]
    
    processed_users = process_users(users)
    logger.info(f"Processing complete. {len(processed_users)} users passed confidence threshold") 
    
    # Log processed users
    for user in processed_users:
        logger.info("----------------User Processed -----------------")
        logger.info(f"User: {user.name}")
        logger.info(f"Profile Image URL: {user.profile_image_url}")
        logger.info(f"LinkedIn URL: {user.linkedin_url}")
        logger.info(f"X Account: {user.x_account}")
        if user.location:
            logger.info(f"Location: {user.location}")
            logger.info(f"Coordinates: ({user.coordinates[0]}, {user.coordinates[1]})")
        logger.info(f"Summary: {user.summary}")
        logger.info(f"Highlights: {user.highlights}")
        logger.info(f"Skills: {user.skills}")
        logger.info(f"Interests: {user.interests}")
        logger.info("--------------------------------\n\n")
    
    # Ingest to Qdrant
    logger.info("Starting Qdrant ingestion...")
    index = ingest_to_qdrant(processed_users)
    logger.info("Qdrant ingestion complete")
    logger.info(f"Testing index...")
    query_engine = index.as_query_engine()
    response = query_engine.query("Who is working on both blockchain?")
    logger.info(f"Response: {response}")