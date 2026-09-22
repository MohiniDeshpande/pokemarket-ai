"""Unit tests for pokemon_agent/price_tool.py.

price_tool is loaded straight from its file so the tests don't import
pokemon_agent/__init__.py, which pulls in google-adk and needs MongoDB creds.
All PokeTrace HTTP calls are mocked — no network or API key required.
"""

import importlib.util
from pathlib import Path
from unittest.mock import MagicMock

import pytest

_spec = importlib.util.spec_from_file_location(
    "price_tool", Path(__file__).parent / "pokemon_agent" / "price_tool.py"
)
price_tool = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(price_tool)


def _card(name="Charizard", set_name="Base Set", number="4", tcg=None, ebay=None):
    prices = {}
    if tcg is not None:
        prices["tcgplayer"] = {"NEAR_MINT": tcg}
    if ebay is not None:
        prices["ebay"] = {"NEAR_MINT": ebay}
    return {
        "name": name,
        "set": {"name": set_name},
        "cardNumber": number,
        "variant": "holo",
        "rarity": "Rare Holo",
        "prices": prices,
    }


@pytest.fixture
def api_key(monkeypatch):
    monkeypatch.setenv("POKETRACE_API_KEY", "test-key")


@pytest.fixture
def mock_get(monkeypatch):
    """Patch requests.get to return the given list of cards as PokeTrace data."""
    def _install(cards):
        resp = MagicMock()
        resp.json.return_value = {"data": cards}
        resp.raise_for_status.return_value = None
        get = MagicMock(return_value=resp)
        monkeypatch.setattr(price_tool.requests, "get", get)
        return get
    return _install


# ---------------------------------------------------------------- _best_price

def test_best_price_prefers_tcgplayer():
    card = _card(tcg={"avg": 100, "low": 80, "high": 120, "saleCount": 5},
                 ebay={"avg": 90, "low": 70})
    assert price_tool._best_price(card) == {
        "source": "tcgplayer",
        "market_price_usd": 100,
        "low_price_usd": 80,
        "high_price_usd": 120,
        "sale_count": 5,
    }


def test_best_price_falls_back_to_ebay():
    card = _card(tcg={}, ebay={"avg": 90, "low": 70})
    assert price_tool._best_price(card)["source"] == "ebay"


def test_best_price_uses_low_when_no_avg():
    card = _card(tcg={"low": 42})
    assert price_tool._best_price(card)["market_price_usd"] == 42


def test_best_price_none_when_no_prices():
    assert price_tool._best_price({"prices": None}) is None
    assert price_tool._best_price({}) is None


# ------------------------------------------------------------------ get_price

def test_get_price_requires_api_key(monkeypatch):
    monkeypatch.delenv("POKETRACE_API_KEY", raising=False)
    assert "error" in price_tool.get_price("Charizard")


def test_get_price_returns_card_details(api_key, mock_get):
    get = mock_get([_card(tcg={"avg": 250.0, "low": 200.0})])
    result = price_tool.get_price("Charizard")
    assert result["name"] == "Charizard"
    assert result["set"] == "Base Set"
    assert result["market_price_usd"] == 250.0
    assert get.call_args.kwargs["headers"] == {"X-API-Key": "test-key"}


def test_get_price_filters_by_set_and_number(api_key, mock_get):
    mock_get([
        _card(name="Mega Lucario ex", set_name="Other", number="160", tcg={"avg": 1}),
        _card(name="Mega Lucario ex", set_name="Mega Evolution", number="179", tcg={"avg": 2}),
        _card(name="Mega Lucario ex", set_name="Mega Evolution", number="160", tcg={"avg": 3}),
    ])
    result = price_tool.get_price("Mega Lucario ex", "Mega Evolution", "160")
    assert result["market_price_usd"] == 3


def test_get_price_falls_back_to_first_result_when_no_match(api_key, mock_get):
    mock_get([_card(number="4", tcg={"avg": 10})])
    assert price_tool.get_price("Charizard", number="999")["market_price_usd"] == 10


def test_get_price_no_results(api_key, mock_get):
    mock_get([])
    assert "No results" in price_tool.get_price("Missingno")["error"]


def test_get_price_no_price_available(api_key, mock_get):
    mock_get([_card()])
    assert "No current price" in price_tool.get_price("Charizard")["error"]


def test_get_price_handles_request_errors(api_key, monkeypatch):
    monkeypatch.setattr(price_tool.requests, "get",
                        MagicMock(side_effect=ConnectionError("boom")))
    assert "Price lookup failed" in price_tool.get_price("Charizard")["error"]


# ----------------------------------------------------------- get_prices_batch

def test_get_prices_batch_dedupes_and_maps_names(monkeypatch):
    calls = []

    def fake_get_price(name):
        calls.append(name)
        return {"name": name, "market_price_usd": len(name)}

    monkeypatch.setattr(price_tool, "get_price", fake_get_price)
    result = price_tool.get_prices_batch(["Pikachu", "Charizard", "Pikachu", ""])
    assert sorted(calls) == ["Charizard", "Pikachu"]
    assert result == {
        "Pikachu": {"name": "Pikachu", "market_price_usd": 7},
        "Charizard": {"name": "Charizard", "market_price_usd": 9},
    }


def test_get_prices_batch_empty():
    assert price_tool.get_prices_batch([]) == {}
