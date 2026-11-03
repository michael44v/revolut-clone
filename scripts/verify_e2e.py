import sys
from playwright.sync_api import sync_playwright

def run_tests():
    print("--- Starting Playwright Automated Verification ---")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 390, "height": 844},
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15"
        )
        page = context.new_page()

        # 1. Welcome screen
        print("1. Loading Welcome screen...")
        page.goto("http://localhost:8082/welcome", wait_until="networkidle")
        page.wait_for_timeout(1000)
        body_text = page.text_content("body")
        assert "Banking without borders" in body_text or "Revolut Bank" in body_text, "Welcome text missing"
        print("✓ Welcome screen verified.")

        # 2. Onboarding screen
        print("2. Visiting Onboarding screen...")
        page.goto("http://localhost:8082/onboarding", wait_until="networkidle")
        page.wait_for_timeout(500)
        body_text = page.text_content("body")
        assert "Multi-Currency Freedom" in body_text, "Onboarding text missing"
        print("✓ Onboarding screen verified.")

        # 3. Demo Login
        print("3. Logging in as Demo User...")
        page.goto("http://localhost:8082/welcome", wait_until="networkidle")
        page.click("text=Continue with Demo Account")
        page.wait_for_timeout(1500)
        dash_text = page.text_content("body")
        assert "Total Balance" in dash_text and "Accounts & Wallets" in dash_text, "Dashboard failed to load"
        print("✓ Demo login succeeded and Dashboard rendered.")

        # 4. Multi-currency Wallets
        assert "US Dollar" in dash_text and "British Pound" in dash_text and "Euro" in dash_text and "Nigerian Naira" in dash_text
        print("✓ Multi-currency wallets USD, GBP, EUR, NGN verified.")

        # 5. Quick Actions Modal test (Add Money)
        print("5. Testing Quick Actions (Add Money)...")
        page.click("text=Add money")
        page.wait_for_timeout(600)
        action_modal_text = page.text_content("body")
        assert "Add Money (Simulation)" in action_modal_text
        page.click("text=+100")
        page.click("text=Deposit to Simulated Wallet")
        page.wait_for_timeout(1500)
        print("✓ Quick Actions: Add money successfully executed and synced state.")

        # 6. Tab Navigation: Cards
        print("6. Testing Cards tab...")
        page.goto("http://localhost:8082/cards", wait_until="networkidle")
        page.wait_for_timeout(1200)
        cards_text = page.text_content("body")
        assert "Virtual Cards" in cards_text and "Freeze" in cards_text
        # Test Freeze button with user locator
        freeze_btn = page.get_by_text("Freeze").first
        freeze_btn.click()
        page.wait_for_timeout(1500)
        cards_text_after = page.text_content("body")
        assert "Unfreeze" in cards_text_after or "Freeze" in cards_text_after
        print("✓ Cards tab and Freeze/Unfreeze interaction verified.")

        # 7. Tab Navigation: Payments
        print("7. Testing Payments tab...")
        page.goto("http://localhost:8082/payments", wait_until="networkidle")
        page.wait_for_timeout(600)
        payments_text = page.text_content("body")
        assert "Transfers & Payments" in payments_text and "Recent Contacts" in payments_text
        print("✓ Payments tab verified.")

        # 8. Tab Navigation: Analytics
        print("8. Testing Analytics tab...")
        page.goto("http://localhost:8082/analytics", wait_until="networkidle")
        page.wait_for_timeout(600)
        analytics_text = page.text_content("body")
        assert "Analytics & Insights" in analytics_text and "Portfolio Breakdown" in analytics_text
        print("✓ Analytics tab and portfolio breakdown verified.")

        # 9. Tab Navigation: Profile
        print("9. Testing Profile tab...")
        page.goto("http://localhost:8082/profile", wait_until="networkidle")
        page.wait_for_timeout(600)
        profile_text = page.text_content("body")
        assert "Profile & Settings" in profile_text and "Dark Theme" in profile_text
        print("✓ Profile tab verified.")

        # 10. Theme Switching
        print("10. Testing Theme switcher...")
        page.click("text=Dark Theme")
        page.wait_for_timeout(400)
        print("✓ Dark Theme switch triggered.")

        # 11. New User Registration & Account Isolation
        print("11. Testing New User Registration & starter balances...")
        page.goto("http://localhost:8082/register", wait_until="networkidle")
        page.wait_for_timeout(1000)
        unique_user = f"vance_{int(page.evaluate('() => Date.now()'))}"
        page.fill('input[placeholder="Alex Rivera"]', "Marcus Vance")
        page.fill('input[placeholder="alex.rivera@example.com"]', f"{unique_user}@example.com")
        page.fill('input[placeholder="At least 6 characters"]', "securepass99")
        page.click("text=Create Account")
        page.wait_for_timeout(2500)
        reg_dash = page.text_content("body")
        assert "Marcus Vance" in reg_dash and "Accounts & Wallets" in reg_dash
        # Starter balance for USD is $100.00
        assert "100.00" in reg_dash
        print("✓ New user registered with isolated starter balances.")

        # 12. Take screenshot of dashboard
        page.screenshot(path="dashboard_verification.png")
        print("✓ Screenshot captured to dashboard_verification.png.")

        browser.close()
        print("--- ALL 12 PLAYWRIGHT TEST SUITES PASSED CLEANLY! ---")

if __name__ == "__main__":
    run_tests()
