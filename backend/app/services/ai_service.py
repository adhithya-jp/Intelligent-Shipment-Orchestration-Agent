from openai import AsyncOpenAI
from app.core.config import settings
from app.core.logger import log
import json

# Ensure we have the API key
if not settings.OPENAI_API_KEY:
    log.warning("OPENAI_API_KEY is not set in the environment variables.")

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

async def parse_natural_language_routing(prompt: str) -> dict:
    log.info(f"Parsing natural language routing prompt...")
    
    system_prompt = """
    You are an AI logistics parser for the Intelligent Shipment Orchestration Agent.
    The user will give you a natural language command to ship cargo.
    You must extract the following exact keys and return them as a valid JSON object ONLY:
    - "origin": The starting city or port (string)
    - "destination": The ending city or port (string)
    - "cargo_type": What kind of shipment it is (e.g. Perishables, Hazardous Materials, General Cargo, Electronics, etc). Default to "General Cargo" if not specified. (string)
    - "weight": The weight of the cargo explicitly in numbers only (e.g. 500) (string)
    - "sla": The deadline in days explicitly in numbers only (e.g. 5) (string)
    - "budget": The maximum budget explicitly in numbers only, ignoring currencies (e.g. 4000) (string)
    - "currency": The explicitly mentioned currency code (e.g. USD, EUR, GBP). Default to "USD" if not mentioned. (string)
    
    If any field is completely missing, return an empty string for it.
    Output ONLY raw JSON code. Do not include markdown blocks.
    """

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            response_format={ "type": "json_object" },
            temperature=0.0
        )
        
        result_text = response.choices[0].message.content
        parsed_data = json.loads(result_text)
        log.info(f"Successfully extracted logistics parameters from AI.")
        return parsed_data
        
    except Exception as e:
        log.error(f"OpenAI Parsing Error: {str(e)}", exc_info=True)
        raise ValueError("Failed to process natural language input.")
