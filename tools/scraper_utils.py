"""
Shared utilities for all admission-master scrapers.
Provides caching, retry, date parsing, and file I/O helpers.
"""
import hashlib
import json
import os
import re
import time
from datetime import datetime
from pathlib import Path

import requests
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT / "src" / "data"
CACHE_DIR = Path(__file__).parent / "_cache"
DEBUG_DIR = Path(__file__).parent / "_debug"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
}


# ── Date Utilities ──

def roc_to_iso(roc_str: str) -> str:
    """'115/01/13' → '2026-01-13'"""
    m = re.match(r'(\d+)/(\d+)/(\d+)', roc_str.strip())
    if not m:
        return ""
    y, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
    return f"{y + 1911:04d}-{mo:02d}-{d:02d}"


def iso_to_roc(iso_str: str) -> str:
    """'2026-01-13' → '115/01/13'"""
    d = datetime.strptime(iso_str, "%Y-%m-%d")
    return f"{d.year - 1911}/{d.month:02d}/{d.day:02d}"


def parse_roc_date_range(text: str, base_year: int = 0) -> dict:
    """Parse techadmi date format: '115.5.15(五)~5.22(五)' or '115.5.12'

    Returns {"start": "2026-05-15", "end": "2026-05-22"} or {"date": "2026-05-12"}
    """
    pattern = r'(\d{3})\.(\d{1,2})\.(\d{1,2})(?:\([^)]+\))?(?:[~\-—](\d{1,2})\.(\d{1,2})\([^)]+\))?'
    m = re.search(pattern, text)
    if not m:
        return {}

    year = int(m.group(1))
    iso_year = year + 1911
    start_m, start_d = int(m.group(2)), int(m.group(3))
    start = f"{iso_year:04d}-{start_m:02d}-{start_d:02d}"

    if m.group(4) and m.group(5):
        end_m, end_d = int(m.group(4)), int(m.group(5))
        end = f"{iso_year:04d}-{end_m:02d}-{end_d:02d}"
        return {"start": start, "end": end}

    return {"date": start}


def parse_roc_dot_date(text: str) -> str:
    """Parse '115.5.15(五)' → '2026-05-15'"""
    m = re.search(r'(\d{3})\.(\d{1,2})\.(\d{1,2})', text)
    if not m:
        return ""
    y, mo, d = int(m.group(1)), int(m.group(2)), int(m.group(3))
    return f"{y + 1911:04d}-{mo:02d}-{d:02d}"


# ── HTTP Utilities ──

def fetch_with_retry(url: str, max_retries: int = 3, backoff: float = 5.0,
                     encoding: str = "utf-8", verify: bool = False) -> str:
    """Fetch URL with retry logic and optional caching."""
    cache_key = hashlib.md5(url.encode()).hexdigest()
    cache_path = CACHE_DIR / f"_http_{cache_key}.txt"

    # Check cache (24h TTL)
    if cache_path.exists():
        age = time.time() - cache_path.stat().st_mtime
        if age < 86400:
            with open(cache_path, "r", encoding="utf-8") as f:
                return f.read()

    for attempt in range(max_retries):
        try:
            resp = requests.get(url, headers=HEADERS, timeout=30, verify=verify)
            resp.encoding = encoding
            resp.raise_for_status()
            text = resp.text

            # Cache the response
            CACHE_DIR.mkdir(parents=True, exist_ok=True)
            with open(cache_path, "w", encoding="utf-8") as f:
                f.write(text)

            return text
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            wait = backoff * (2 ** attempt)
            print(f"    Retry {attempt + 1}/{max_retries} in {wait:.0f}s: {e}")
            time.sleep(wait)

    return ""


def fetch_raw(url: str, verify: bool = False) -> bytes:
    """Fetch raw bytes (for PDFs etc)."""
    cache_key = hashlib.md5(url.encode()).hexdigest()
    cache_path = CACHE_DIR / f"_raw_{cache_key}.bin"

    if cache_path.exists():
        age = time.time() - cache_path.stat().st_mtime
        if age < 86400 * 7:  # 7-day TTL for binary
            with open(cache_path, "rb") as f:
                return f.read()

    resp = requests.get(url, headers=HEADERS, timeout=60, verify=verify)
    resp.raise_for_status()
    data = resp.content

    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    with open(cache_path, "wb") as f:
        f.write(data)

    return data


# ── File I/O ──

def save_json(filename: str, data):
    """Save JSON to src/data/"""
    path = DATA_DIR / filename
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    count = len(data) if isinstance(data, list) else len(data.keys())
    print(f"  → {filename} ({count} records)")


def save_ts(filename: str, content: str):
    """Save TypeScript file to src/data/"""
    path = DATA_DIR / filename
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  → {filename}")


def log_debug(filename: str, content: str):
    """Write debug log"""
    DEBUG_DIR.mkdir(parents=True, exist_ok=True)
    with open(DEBUG_DIR / filename, "w", encoding="utf-8") as f:
        f.write(content)


def load_cache(filename: str) -> dict | None:
    """Load JSON cache from tools/_cache/"""
    path = CACHE_DIR / filename
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return None


def save_cache(filename: str, data):
    """Save JSON cache to tools/_cache/"""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    path = CACHE_DIR / filename
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# ── techadmi Session ──

_techadmi_session = None

def get_techadmi_session() -> requests.Session:
    """Get a warmed-up session for techadmi.edu.tw"""
    global _techadmi_session
    if _techadmi_session is not None:
        return _techadmi_session

    session = requests.Session()
    session.verify = False
    session.headers.update(HEADERS)

    # Warm up session by visiting group page
    try:
        session.get("https://www.techadmi.edu.tw/schools.php?group_id=03", timeout=30)
        print("  techadmi session warmed up")
    except Exception as e:
        print(f"  [WARN] techadmi warmup failed: {e}")

    _techadmi_session = session
    return session
