"""
price_tool.py — PokeTrace version.
Gets current market price for a Pokémon card, with variant/condition accuracy.

Setup:
  1. Get a free API key at poketrace.com (free tier ~250 requests/day).
  2. Add to your .env:   POKETRACE_API_KEY=your_key
  3. VERIFY the search endpoint + params below against https://poketrace.com/docs
     (the response parsing matches their documented schema; the query path is the
     one thing to confirm for your account/version).

The agent calls get_price(card_name, set_name, number) — passing set + number lets
it pick the EXACT card when several share a name (e.g. Mega Lucario ex #160 vs #179).
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "https://api.poketrace.com/v1/cards"   # <-- verify against poketrace.com/docs


def _best_price(card: dict) -> dict | None:
    """Pull a usable near-mint market price from a PokeTrace card object."""
    prices = card.get("prices") or {}
    # Prefer TCGplayer near-mint, fall back to eBay near-mint.
    for source in ("tcgplayer", "ebay"):
        nm = (prices.get(source) or {}).get("NEAR_MINT") or {}
        if nm.get("avg") or nm.get("low"):
            return {
                "source": source,
                "market_price_usd": nm.get("avg") or nm.get("low"),
                "low_price_usd": nm.get("low"),
                "high_price_usd": nm.get("high"),
                "sale_count": nm.get("saleCount"),
            }
    return None


def get_price(card_name: str, set_name: str = "", number: str = "") -> dict:
    """Get the current market price for a Pokémon card from PokeTrace.

    Use this when the user asks what a card is worth or to value their collection.
    Pass set_name and number when known to pick the exact card among same-named ones.

    Args:
        card_name: The card name, e.g. "Mega Lucario ex".
        set_name:  Optional set name to disambiguate, e.g. "Mega Evolution".
        number:    Optional collector number to pin the exact variant, e.g. "160".

    Returns:
        Dict with name, set, number, variant, market/low/high price (USD) and sale
        count — or an 'error' key if not found / no price available.
    """
    api_key = os.environ.get("POKETRACE_API_KEY")
    if not api_key:
        return {"error": "No POKETRACE_API_KEY set in environment."}

    try:
        resp = requests.get(
            BASE_URL,
            params={"search": card_name},          # <-- confirm param name in their docs
            headers={"X-API-Key": api_key},
            timeout=10,
        )
        resp.raise_for_status()
        results = resp.json().get("data", [])
    except Exception as e:
        return {"error": f"Price lookup failed: {e}"}

    if not results:
        return {"error": f"No results for '{card_name}'."}

    # Narrow to the exact card if set / number were given.
    def matches(c):
        ok = True
        if number:
            ok = ok and str(number).lstrip("0") in str(c.get("cardNumber", "")).lstrip("0")
        if set_name:
            ok = ok and set_name.lower() in (c.get("set") or {}).get("name", "").lower()
        return ok

    candidates = [c for c in results if matches(c)] or results
    card = candidates[0]

    price = _best_price(card)
    if not price:
        return {"error": f"No current price for '{card.get('name')}' "
                         f"({(card.get('set') or {}).get('name')} {card.get('cardNumber')})."}

    return {
        "name": card.get("name"),
        "set": (card.get("set") or {}).get("name"),
        "number": card.get("cardNumber"),
        "variant": card.get("variant"),
        "rarity": card.get("rarity"),
        **price,
    }


if __name__ == "__main__":
    import json, sys
    # Usage: python price_tool_poketrace.py "Mega Lucario ex" "Mega Evolution" 160
    name = sys.argv[1] if len(sys.argv) > 1 else "Charizard"
    setn = sys.argv[2] if len(sys.argv) > 2 else ""
    num  = sys.argv[3] if len(sys.argv) > 3 else ""
    print(json.dumps(get_price(name, setn, num), indent=2))