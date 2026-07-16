#!/usr/bin/env python3
"""
stream_watch.py
---------------
Pretty-print the FOID Open Banking SSE event stream in the terminal.

Usage
-----
    uv run python stream_watch.py              # watch ada_001 (default)
    uv run python stream_watch.py bode_001     # watch a specific user
    uv run python stream_watch.py ada_001 bode_001  # watch multiple users

Press Ctrl+C to stop.
"""

import sys
import json
import urllib.request
from datetime import datetime

# ── Colour codes ──────────────────────────────────────────────────────────────
RESET  = "\033[0m"
BOLD   = "\033[1m"
DIM    = "\033[2m"
GREEN  = "\033[32m"
RED    = "\033[31m"
YELLOW = "\033[33m"
CYAN   = "\033[36m"
BLUE   = "\033[34m"
MAGENTA= "\033[35m"
WHITE  = "\033[97m"

BANK_COLOURS = {
    "ACCESS": "\033[38;5;202m",   # orange-red
    "GTB":    "\033[38;5;214m",   # amber
    "ZENITH": "\033[38;5;27m",    # deep blue
    "FBN":    "\033[38;5;20m",    # navy
    "UBA":    "\033[38;5;160m",   # red
    "WEMA":   "\033[38;5;127m",   # purple
    "OB":     "\033[38;5;244m",   # grey (seed / unknown)
}

CATEGORY_ICONS = {
    "income":         "💰",
    "loan_repayment": "🏦",
    "utilities":      "💡",
    "groceries":      "🛒",
    "food":           "🍽️",
    "transport":      "🚗",
    "housing":        "🏠",
    "health":         "💊",
    "education":      "📚",
    "transfer":       "↔️",
    "income_missing": "⚠️",
    "other":          "•",
}

BASE_URL = "http://localhost:8000"


def now() -> str:
    return datetime.now().strftime("%H:%M:%S")


def bank_colour(code: str) -> str:
    return BANK_COLOURS.get(code, BANK_COLOURS["OB"])


def fmt_amount(amount: int) -> str:
    if amount > 0:
        return f"{GREEN}+₦{amount:>12,.0f}{RESET}"
    elif amount < 0:
        return f"{RED} ₦{abs(amount):>12,.0f}{RESET}"
    else:
        return f"{DIM}  ₦{'0':>12}{RESET}"


def fmt_balance(balance: int) -> str:
    colour = GREEN if balance >= 0 else RED
    return f"{colour}₦{balance:,.0f}{RESET}"


def print_separator(char: str = "─", width: int = 72) -> None:
    print(f"{DIM}{char * width}{RESET}")


def handle_new_transaction(ev: dict) -> None:
    txn   = ev.get("transaction", {})
    bank  = ev.get("bank", txn.get("bank", "Open Banking"))
    bcode = ev.get("bank_code", txn.get("bank_code", "OB"))
    bal   = ev.get("balance", 0)
    amt   = txn.get("amount", 0)
    cat   = txn.get("category", "other")
    desc  = txn.get("description", "—")
    stat  = txn.get("status", "completed")
    ts    = now()

    icon    = CATEGORY_ICONS.get(cat, "•")
    bcolour = bank_colour(bcode)
    status_tag = f"{YELLOW}[{stat.upper()}]{RESET}" if stat != "completed" else ""

    print(
        f"  {DIM}{ts}{RESET}  "
        f"{bcolour}{BOLD}{bank:<16}{RESET}  "
        f"{icon} {WHITE}{desc:<38}{RESET}  "
        f"{fmt_amount(amt)}  "
        f"bal: {fmt_balance(bal)}  "
        f"{status_tag}"
    )


def handle_state_change(ev: dict) -> None:
    claim     = ev.get("claim", "?")
    old_state = ev.get("old_state", "?")
    new_state = ev.get("new_state", "?")
    message   = ev.get("message", "")
    ts        = now()

    state_colour = RED if new_state in ("downgraded", "revoked") else (
                   YELLOW if new_state == "under_review" else GREEN)

    print()
    print_separator("═")
    print(
        f"  {BOLD}{YELLOW}⚡ CREDENTIAL STATE CHANGE{RESET}  "
        f"{DIM}{ts}{RESET}"
    )
    print(
        f"  Claim : {BOLD}{claim}{RESET}\n"
        f"  Change: {DIM}{old_state}{RESET} → "
        f"{state_colour}{BOLD}{new_state.upper()}{RESET}"
    )
    print(f"  {DIM}{message}{RESET}")
    print_separator("═")
    print()


def handle_connected(ev: dict) -> None:
    user_id = ev.get("user_id", "?")
    print()
    print_separator()
    print(
        f"  {BOLD}{CYAN}● Connected{RESET}  "
        f"watching {BOLD}{user_id}{RESET}  "
        f"{DIM}({BASE_URL}){RESET}"
    )
    print(f"  {DIM}{'TIME':8}  {'BANK':<16}  {'DESCRIPTION':<38}  "
          f"{'AMOUNT':>15}  {'BALANCE'}{RESET}")
    print_separator()


def watch(user_id: str) -> None:
    url = f"{BASE_URL}/api/events/stream?user_id={user_id}"
    req = urllib.request.Request(url, headers={"Accept": "text/event-stream"})

    with urllib.request.urlopen(req) as resp:
        for raw_line in resp:
            line = raw_line.decode("utf-8").rstrip("\n")

            # SSE comment (heartbeat) — print a small tick so you know it's alive
            if line.startswith(":"):
                print(f"  {DIM}· {now()}{RESET}", end="\r")
                continue

            if not line.startswith("data:"):
                continue

            payload = line[5:].strip()
            if not payload:
                continue

            try:
                ev = json.loads(payload)
            except json.JSONDecodeError:
                continue

            ev_type = ev.get("type", "")

            if ev_type == "connected":
                handle_connected(ev)
            elif ev_type == "new_transaction":
                handle_new_transaction(ev)
            elif ev_type == "credential_state_change":
                handle_state_change(ev)


def main() -> None:
    users = sys.argv[1:] if len(sys.argv) > 1 else ["ada_001"]

    if len(users) == 1:
        print(f"{BOLD}FOID Open Banking Stream Watcher{RESET}  "
              f"— press {BOLD}Ctrl+C{RESET} to stop")
        try:
            watch(users[0])
        except KeyboardInterrupt:
            print(f"\n{DIM}Disconnected.{RESET}")
    else:
        # Multiple users — run each in a thread so they interleave
        import threading
        print(f"{BOLD}FOID Open Banking Stream Watcher{RESET}  "
              f"watching: {', '.join(users)}  "
              f"— press {BOLD}Ctrl+C{RESET} to stop")
        threads = [threading.Thread(target=watch, args=(u,), daemon=True) for u in users]
        for t in threads:
            t.start()
        try:
            for t in threads:
                t.join()
        except KeyboardInterrupt:
            print(f"\n{DIM}Disconnected.{RESET}")


if __name__ == "__main__":
    main()
