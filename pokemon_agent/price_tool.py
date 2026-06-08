import os
import requests
from dotenv import load_dotenv

load_dotenv()

def get_price(card_name: str) -> dict:
    """Look up the current market price for a Pokémon card by name.

    Use this when the user asks what a card is worth or for its price.

    Args:
        card_name: The card's name to search for, e.g. "Charizard ex".

    Returns:
        A dict with the card name, market price (USD), low price, 7-day
        change, and number of listings — or an 'error' key if not found.
    """
    api_key = os.environ.get("TCG_API_KEY")
    if not api_key:
        return {"error": "No TCG_API_KEY set in environment."}

    try:
        resp = requests.get(
            "https://api.tcgapi.dev/v1/search",
            params={"q": card_name, "game": "pokemon"},
            headers={"X-API-Key": api_key},
            timeout=20,
        )
        resp.raise_for_status()
        results = resp.json().get("data", [])
        if not results:
            return {"error": f"No price found for '{card_name}'."}

        c = results[0]   # take the top match
        return {
            "name": c.get("name"),
            "set": c.get("set_name"),
            "market_price_usd": c.get("price"),
            "low_price_usd": c.get("low_price"),
            "change_7d_percent": c.get("price_change_7d"),
            "listings": c.get("total_listings"),
        }
    except Exception as e:
        return {"error": f"Price lookup failed: {e}"}


if __name__ == "__main__":
    # lets you run this file directly to test the function alone
    import json
    print(json.dumps(get_price("Charizard ex"), indent=2))