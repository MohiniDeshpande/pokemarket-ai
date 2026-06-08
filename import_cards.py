"""
import_sets.py
Imports specific Pokémon TCG sets from TCGdex into MongoDB with FULL detail:
set name, card number, rarity, types, HP, and image.

Run from the project root with your venv active:
    python import_sets.py
"""

import os
import time
from dotenv import load_dotenv
from pymongo import MongoClient, UpdateOne
from tcgdexsdk import TCGdex

load_dotenv()
client = MongoClient(os.environ["MDB_MCP_CONNECTION_STRING"])
cards = client["pokemon"]["cards"]
sdk = TCGdex("en")

# ---------------------------------------------------------------------------
# The sets you want, matched by NAME (case-insensitive substring).
# After the first run, look at the printed set list. If a match is wrong or
# too broad, replace the matching below with EXACT set ids (see note at bottom).
# ---------------------------------------------------------------------------
TARGET_NAMES = [
    "Mega Evolution",
    "Phantasmal Flames",
    "Ascended Heroes",
    "Perfect Order",
]


def list_all_sets():
    """Print every set TCGdex has, so you can see what's actually available."""
    sets = sdk.set.listSync()
    print(f"\n=== TCGdex has {len(sets)} sets. Showing all (id - name): ===")
    for s in sets:
        print(f"  {s.id:<12} {s.name}")
    return sets


def find_target_sets(all_sets):
    """Match TARGET_NAMES against the real set names; report hits and misses."""
    matched = {}          # set_id -> set_name
    for target in TARGET_NAMES:
        hits = [s for s in all_sets if target.lower() in (s.name or "").lower()]
        if hits:
            for s in hits:
                matched[s.id] = s.name
            print(f"[FOUND]   '{target}' -> " + ", ".join(f"{s.name} ({s.id})" for s in hits))
        else:
            print(f"[MISSING] '{target}' is not in TCGdex yet (or is named differently).")
    return matched


def enrich_set(set_id, set_name):
    """Fetch full detail for every card in a set and upsert into MongoDB."""
    s = sdk.set.getSync(set_id)
    briefs = getattr(s, "cards", []) or []
    print(f"\nImporting '{set_name}' ({set_id}) — {len(briefs)} cards...")

    ops = []
    for i, brief in enumerate(briefs, start=1):
        try:
            full = sdk.card.getSync(brief.id)
            ops.append(UpdateOne(
                {"_id": full.id},
                {"$set": {
                    "name":     full.name,
                    "set":      getattr(getattr(full, "set", None), "name", set_name),
                    "number":   getattr(full, "localId", None),   # e.g. "020"
                    "rarity":   getattr(full, "rarity", None),
                    "types":    getattr(full, "types", None),     # e.g. ["Fire"]
                    "category": getattr(full, "category", None),  # Pokemon / Trainer / Energy
                    "hp":       getattr(full, "hp", None),
                    "image":    getattr(full, "image", None),
                }},
                upsert=True,   # insert the card if it isn't already in the DB
            ))
        except Exception as e:
            print(f"  skipped {brief.id}: {e}")
        if i % 25 == 0:
            print(f"  ...processed {i}/{len(briefs)}")
        time.sleep(0.05)   # be polite to the free API

    if ops:
        cards.bulk_write(ops)
    print(f"  done: upserted {len(ops)} cards for '{set_name}'.")


if __name__ == "__main__":
    all_sets = list_all_sets()
    print("\n=== Matching your requested sets ===")
    targets = find_target_sets(all_sets)

    if not targets:
        print("\nNone of your requested sets were found. Check the set list above "
              "and update TARGET_NAMES (or use exact ids).")
    else:
        for set_id, set_name in targets.items():
            enrich_set(set_id, set_name)
        print(f"\nAll done. Total cards now in DB: {cards.count_documents({})}")