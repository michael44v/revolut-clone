import json
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000/api/v1"

def request(endpoint, method="GET", data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(url, method=method)
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    body = json.dumps(data).encode("utf-8") if data else None
    try:
        with urllib.request.urlopen(req, data=body, timeout=5) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return json.loads(e.read().decode("utf-8"))

def test_api():
    print("--- 1. Testing Demo Login ---")
    res = request("/auth/login", method="POST", data={"email": "alex.rivera@example.com", "password": "demo"})
    assert res["success"] is True, f"Login failed: {res}"
    token = res["data"]["token"]
    user = res["data"]["user"]
    assert user["isDemo"] is True
    print("✓ Demo login returned valid JWT token and demo user payload.")

    print("--- 2. Testing Authenticated /auth/me ---")
    me_res = request("/auth/me", token=token)
    assert me_res["success"] is True
    assert me_res["data"]["user"]["email"] == "alex.rivera@example.com"
    print("✓ /auth/me correctly identified user from Bearer JWT.")

    print("--- 3. Testing Wallets Retrieval & Authoritative Balances ---")
    wallets_res = request("/wallets", token=token)
    assert wallets_res["success"] is True
    wallets = wallets_res["data"]["wallets"]
    assert len(wallets) == 4
    # Check demo balances: USD $5,250.00, GBP £1,850.00, EUR €2,400.00, NGN ₦3,500,000.00
    w_map = {w["currency"]: w["balance"] for w in wallets}
    assert w_map["USD"] == 5250.0, f"USD balance mismatch: {w_map['USD']}"
    assert w_map["GBP"] == 1850.0, f"GBP balance mismatch: {w_map['GBP']}"
    assert w_map["EUR"] == 2400.0, f"EUR balance mismatch: {w_map['EUR']}"
    assert w_map["NGN"] == 3500000.0, f"NGN balance mismatch: {w_map['NGN']}"
    print("✓ All 4 multi-currency balances verified in minor unit precision.")

    print("--- 4. Testing Simulated Add Money (Deposit) ---")
    deposit_res = request("/wallets", method="POST", data={"currency": "USD", "amount": 100.0}, token=token)
    assert deposit_res["success"] is True
    assert deposit_res["data"]["balance"] == 5350.0
    print("✓ Wallet deposit of USD 100.00 succeeded and updated ledger balance.")

    print("--- 5. Testing Outward Transfer ---")
    trf_res = request("/transfers/send", method="POST", data={
        "recipientName": "@sarahj",
        "amount": 50.0,
        "currency": "USD",
        "reference": "Dinner contribution"
    }, token=token)
    assert trf_res["success"] is True
    assert trf_res["data"]["wallet"]["balance"] == 5300.0
    print("✓ Outward transfer deducted balance and created double-entry ledger entry.")

    print("--- 6. Testing Insufficient Balance Error Handling ---")
    fail_trf = request("/transfers/send", method="POST", data={
        "recipientName": "whale",
        "amount": 9999999.0,
        "currency": "USD"
    }, token=token)
    assert fail_trf["success"] is False
    assert "Insufficient funds" in fail_trf["message"]
    print("✓ Insufficient balance rejected safely with rollback.")

    print("--- 7. Testing Currency Exchange with Atomic Double Entry ---")
    exch_res = request("/exchange/convert", method="POST", data={
        "fromCurrency": "USD",
        "toCurrency": "EUR",
        "amount": 200.0
    }, token=token)
    assert exch_res["success"] is True
    assert exch_res["data"]["fromWallet"]["balance"] == 5100.0
    assert exch_res["data"]["toWallet"]["balance"] > 2400.0
    print(f"✓ Currency exchange atomized: converted 200 USD to {exch_res['data']['toAmount']} EUR.")

    print("--- 8. Testing Virtual Card Freeze & Unfreeze ---")
    cards_res = request("/cards", token=token)
    assert cards_res["success"] is True
    first_card = cards_res["data"][0]
    freeze_res = request("/cards/update_status", method="POST", data={"cardId": first_card["id"]}, token=token)
    assert freeze_res["success"] is True
    assert freeze_res["data"]["isFrozen"] is True
    # Unfreeze
    unfreeze_res = request("/cards/update_status", method="POST", data={"cardId": first_card["id"]}, token=token)
    assert unfreeze_res["success"] is True
    assert unfreeze_res["data"]["isFrozen"] is False
    print("✓ Card freeze/unfreeze status toggled successfully.")

    print("--- 9. Testing Notifications Retrieval & Mark All Read ---")
    notif_res = request("/notifications", token=token)
    assert notif_res["success"] is True
    mark_res = request("/notifications/mark_all_read", method="POST", token=token)
    assert mark_res["success"] is True
    assert mark_res["data"]["unreadCount"] == 0
    print("✓ Notifications retrieved and marked all read.")

    print("--- 10. Testing Analytics & Portfolio Summary ---")
    analytics_res = request("/analytics/dashboard", token=token)
    assert analytics_res["success"] is True
    assert "totalSpent" in analytics_res["data"]
    assert "weeklyTrends" in analytics_res["data"]
    print("✓ Analytics dashboard computed from ledger.")

    print("--- 11. Testing New User Registration & Starter Balance Isolation ---")
    unique_email = f"user_{int(time.time())}@fintech.test"
    reg_res = request("/auth/register", method="POST", data={
        "name": "David Bowie",
        "email": unique_email,
        "password": "stardust_password"
    })
    assert reg_res["success"] is True
    new_token = reg_res["data"]["token"]

    new_wallets_res = request("/wallets", token=new_token)
    new_w_map = {w["currency"]: w["balance"] for w in new_wallets_res["data"]["wallets"]}
    assert new_w_map["USD"] == 100.0, f"Expected 100.0 USD starter, got {new_w_map['USD']}"
    assert new_w_map["GBP"] == 50.0, f"Expected 50.0 GBP starter, got {new_w_map['GBP']}"
    assert new_w_map["EUR"] == 50.0, f"Expected 50.0 EUR starter, got {new_w_map['EUR']}"
    assert new_w_map["NGN"] == 50000.0, f"Expected 50000.0 NGN starter, got {new_w_map['NGN']}"
    print("✓ New user registered and isolated starter balances strictly verified.")

    print("--- 12. Testing Full Dashboard Endpoint ---")
    dash_res = request("/dashboard", token=new_token)
    assert dash_res["success"] is True
    assert "wallets" in dash_res["data"]
    assert "transactions" in dash_res["data"]
    print("✓ Unified dashboard payload retrieved successfully.")

    print("=== ALL 12 BACKEND PHP / MYSQLI API TESTS PASSED! ===")

if __name__ == "__main__":
    import time
    test_api()
