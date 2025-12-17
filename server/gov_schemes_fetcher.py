"""
Government Schemes Fetcher/Reader backed by MongoDB.

Actions:
  - fetch_schemes     : pull from data.gov.in and upsert into Mongo
  - get_schemes       : return schemes with filters
  - get_scheme        : return a single scheme by scheme_id
  - get_stats         : summary counts
  - get_states        : distinct states (if present)
"""

import argparse
import json
import logging
import os
from datetime import datetime
from typing import Dict, List, Optional

import requests
from pymongo import MongoClient, UpdateOne

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.FileHandler("gov_schemes_fetcher.log"), logging.StreamHandler()],
)
logger = logging.getLogger(__name__)

DEFAULT_API_KEY = "579b464db66ec23bdd000001cdd3946e44de4f064641eaf0bc5473fa"
API_ENDPOINTS = [
    "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
    "https://api.data.gov.in/resource/agriculture-schemes",
    "https://api.data.gov.in/resource/farmer-schemes",
]


def get_db():
    mongo_uri = os.environ.get("MONGO_URI")
    if not mongo_uri:
        raise RuntimeError("MONGO_URI is required")
    client = MongoClient(mongo_uri, tlsAllowInvalidCertificates=True)
    db_name = os.environ.get("MONGO_DB", "agriai")
    return client[db_name]


def fetch_from_api() -> Optional[List[Dict]]:
    api_key = os.environ.get("GOV_SCHEMES_API_KEY", DEFAULT_API_KEY)
    for api_url in API_ENDPOINTS:
        try:
            params = {"api-key": api_key, "format": "json", "limit": 1000, "offset": 0}
            logger.info("Fetching schemes from %s", api_url)
            response = requests.get(api_url, params=params, timeout=30)
            if response.status_code != 200:
                logger.warning("Non-200 from %s: %s", api_url, response.status_code)
                continue
            data = response.json()
            records = data.get("records") or data.get("data") or []
            if records:
                logger.info("Fetched %s records from %s", len(records), api_url)
                return records
        except Exception as exc:  # noqa: BLE001
            logger.warning("Fetch failed for %s: %s", api_url, exc)
            continue
    return None


def parse_records(raw: List[Dict]) -> List[Dict]:
    parsed = []
    for rec in raw:
        scheme_id = str(rec.get("scheme_id") or rec.get("id") or "").strip()
        scheme_name = str(
            rec.get("scheme_name") or rec.get("scheme") or rec.get("title") or ""
        ).strip()
        if not scheme_id and scheme_name:
            scheme_id = scheme_name.lower().replace(" ", "-")

        parsed.append(
            {
                "schemeId": scheme_id,
                "schemeName": scheme_name,
                "description": str(rec.get("description", "")).strip(),
                "ministry": str(
                    rec.get("implementing_ministry", rec.get("ministry", ""))
                ).strip(),
                "startDate": rec.get("start_date"),
                "eligibility": str(
                    rec.get("eligibility_criteria", rec.get("eligibility", ""))
                ).strip(),
                "region": str(rec.get("region", "Central")).strip(),
                "state": str(rec.get("state", "")).strip(),
                "lastUpdated": datetime.utcnow(),
            }
        )
    return parsed


def save_to_mongo(db, schemes: List[Dict]) -> int:
    if not schemes:
        return 0
    ops = []
    for scheme in schemes:
        if not scheme.get("schemeId"):
            continue
        ops.append(
            UpdateOne(
                {"schemeId": scheme["schemeId"]},
                {"$set": scheme, "$setOnInsert": {"createdAt": datetime.utcnow()}},
                upsert=True,
            )
        )
    if not ops:
        return 0
    result = db.schemes.bulk_write(ops, ordered=False)
    return result.upserted_count + result.modified_count


def handle_fetch():
    records = fetch_from_api()
    if records is None:
        return {"success": False, "message": "Fetch failed from all endpoints"}
    parsed = parse_records(records)
    db = get_db()
    saved = save_to_mongo(db, parsed)
    return {
        "success": True,
        "message": f"Upserted {saved} schemes",
        "count": saved,
        "timestamp": datetime.utcnow().isoformat(),
    }


def handle_get_schemes(region: Optional[str], ministry: Optional[str], state: Optional[str]):
    db = get_db()
    query: Dict[str, Dict] = {}
    if region:
        query["region"] = region
    if ministry:
        query["ministry"] = ministry
    if state:
        query["state"] = state
    schemes = list(db.schemes.find(query, {"_id": 0}).sort("lastUpdated", -1))
    return schemes


def handle_get_scheme(scheme_id: str):
    db = get_db()
    return db.schemes.find_one({"schemeId": scheme_id}, {"_id": 0})


def handle_get_stats():
    db = get_db()
    total = db.schemes.count_documents({})
    by_region = {
        doc["_id"]: doc["count"]
        for doc in db.schemes.aggregate(
            [{"$group": {"_id": "$region", "count": {"$count": {}}}}]
        )
    }
    by_ministry = {
        doc["_id"]: doc["count"]
        for doc in db.schemes.aggregate(
            [{"$group": {"_id": "$ministry", "count": {"$count": {}}}}]
        )
    }
    return {
        "total": total,
        "byRegion": by_region,
        "byMinistry": by_ministry,
        "lastUpdated": datetime.utcnow().isoformat(),
    }


def handle_get_states():
    db = get_db()
    states = db.schemes.distinct("state")
    return sorted([s for s in states if s])


def main():
    parser = argparse.ArgumentParser(description="Government Schemes Fetcher (Mongo)")
    sub = parser.add_subparsers(dest="command")
    sub.add_parser("fetch_schemes")
    gp = sub.add_parser("get_schemes")
    gp.add_argument("--region")
    gp.add_argument("--ministry")
    gp.add_argument("--state")
    gid = sub.add_parser("get_scheme")
    gid.add_argument("--id", required=True)
    sub.add_parser("get_stats")
    sub.add_parser("get_states")
    args = parser.parse_args()

    try:
        if args.command == "fetch_schemes":
            result = handle_fetch()
        elif args.command == "get_schemes":
            result = handle_get_schemes(args.region, args.ministry, args.state)
        elif args.command == "get_scheme":
            result = handle_get_scheme(args.id)
        elif args.command == "get_stats":
            result = handle_get_stats()
        elif args.command == "get_states":
            result = handle_get_states()
        else:
            parser.print_help()
            return
        print(json.dumps(result, default=str))
    except Exception as exc:  # noqa: BLE001
        logger.exception("Unhandled error")
        print(json.dumps({"success": False, "error": str(exc)}))
        raise


if __name__ == "__main__":
    main()

