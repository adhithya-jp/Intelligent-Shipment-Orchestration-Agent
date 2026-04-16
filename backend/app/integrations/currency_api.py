"""
Integration: ExchangeRate-API
Purpose: Real-time currency conversion for normalizing shipment costs to USD.
API Docs: https://www.exchangerate-api.com/docs/overview
Free Tier: 1,500 requests/month
Sign up: https://app.exchangerate-api.com/sign-up
"""
import httpx
from app.core.config import settings
from app.core.logger import log

BASE_URL = "https://v6.exchangerate-api.com/v6"


async def get_exchange_rate(from_currency: str, to_currency: str = "USD") -> float:
    """
    Get the conversion rate from one currency to another.
    Example: get_exchange_rate("EUR", "USD") → 1.08
    """
    if not settings.EXCHANGE_RATE_API_KEY:
        raise ValueError("EXCHANGE_RATE_API_KEY is not configured in .env")

    from_currency = from_currency.upper()
    to_currency = to_currency.upper()

    log.info(f"Fetching exchange rate: {from_currency} → {to_currency}")

    url = f"{BASE_URL}/{settings.EXCHANGE_RATE_API_KEY}/pair/{from_currency}/{to_currency}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url)

        if response.status_code == 404:
            raise ValueError(f"Currency pair {from_currency}/{to_currency} not found.")
        if response.status_code == 403:
            raise ValueError("Invalid EXCHANGE_RATE_API_KEY. Check your .env file.")

        response.raise_for_status()
        data = response.json()

    if data.get("result") != "success":
        error_type = data.get("error-type", "unknown error")
        raise ValueError(f"ExchangeRate-API error: {error_type}")

    rate = data["conversion_rate"]
    log.info(f"Rate {from_currency} → {to_currency}: {rate}")
    return rate


async def convert_to_usd(amount: float, from_currency: str) -> dict:
    """
    Convert a monetary amount from a given currency to USD.
    Returns the converted amount and the rate used.
    """
    if from_currency.upper() == "USD":
        return {"original_amount": amount, "currency": "USD", "usd_amount": amount, "rate": 1.0}

    rate = await get_exchange_rate(from_currency, "USD")
    usd_amount = round(amount * rate, 2)

    return {
        "original_amount": amount,
        "currency": from_currency.upper(),
        "usd_amount": usd_amount,
        "rate": rate,
    }


async def get_supported_currencies() -> list[str]:
    """
    Return the list of supported currency codes from ExchangeRate-API.
    """
    if not settings.EXCHANGE_RATE_API_KEY:
        raise ValueError("EXCHANGE_RATE_API_KEY is not configured in .env")

    url = f"{BASE_URL}/{settings.EXCHANGE_RATE_API_KEY}/codes"

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url)
        response.raise_for_status()
        data = response.json()

    if data.get("result") != "success":
        raise ValueError("Failed to fetch supported currency codes.")

    return [code for code, _ in data.get("supported_codes", [])]
