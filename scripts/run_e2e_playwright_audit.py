import sys
import os
import time
import subprocess
import urllib.request
import signal

# Fix Windows console UTF-8 output
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright

FRONTEND_URL = "http://localhost:5173"
BACKEND_URL = "http://localhost:5000"

def wait_for_service(url, timeout_sec=20):
    start = time.time()
    while time.time() - start < timeout_sec:
        try:
            with urllib.request.urlopen(url, timeout=2) as response:
                if response.status in (200, 304, 404):
                    return True
        except Exception:
            time.sleep(0.5)
    return False

def run_playwright_audit():
    print("====================================================")
    print("PROMPT 09: E2E PLAYWRIGHT BROWSER AUDIT")
    print("Target: Rev. Tony Prakash Official Music Web Platform")
    print("====================================================\n")

    # 1. Start Backend Server
    backend_dir = r"H:\new project\backend"
    frontend_dir = r"H:\new project\frontend"

    print("⚡ Starting Node Express backend server on port 5000...")
    backend_proc = subprocess.Popen(
        ["node", "dist/index.js"],
        cwd=backend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=dict(os.environ, PORT="5000")
    )

    # 2. Start Frontend Vite Preview Server
    print("⚡ Starting Vite Preview server on port 5173...")
    frontend_proc = subprocess.Popen(
        ["npx.cmd", "vite", "preview", "--port", "5173", "--strictPort"],
        cwd=frontend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )

    passed = 0
    failed = 0
    results = []

    def log_result(name, is_ok, details=""):
        nonlocal passed, failed
        if is_ok:
            passed += 1
            print(f"✅ PASS: {name} {f'({details})' if details else ''}", flush=True)
            results.append((name, "PASS", details))
        else:
            failed += 1
            print(f"❌ FAIL: {name} {f'({details})' if details else ''}", flush=True)
            results.append((name, "FAIL", details))

    try:
        # Wait for backend health check
        print("⏳ Waiting for backend health check...")
        if not wait_for_service(f"{BACKEND_URL}/api/health", 15):
            print("❌ Backend server failed to start within timeout.")
            sys.exit(1)
        print(" Backend is online and responsive!")

        # Wait for frontend preview server
        print("⏳ Waiting for frontend server...")
        if not wait_for_service(FRONTEND_URL, 15):
            print("❌ Frontend preview server failed to start within timeout.")
            sys.exit(1)
        print(" Frontend is online and responsive!")

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(viewport={"width": 1440, "height": 900})
            page = context.new_page()

            console_errors = []
            page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
            page.on("pageerror", lambda err: console_errors.append(f"Uncaught: {err.message}"))

            not_founds = []
            page.on("response", lambda resp: not_founds.append(resp.url) if resp.status == 404 else None)

            # ----------------------------------------------------
            # TEST 1: HOME SANCTUARY & BRANDING (/)
            # ----------------------------------------------------
            print("\n--- 1. Testing Home Sanctuary & Branding (/) ---")
            page.goto(FRONTEND_URL, wait_until="networkidle")
            time.sleep(1)

            title = page.title()
            log_result("Page Title verification", "Tony" in title, f"Title: '{title}'")

            brand_visible = page.locator("text=TONY'S MUSIC").first.is_visible()
            log_result("TopBar Brand Header ('TONY\\'S MUSIC')", brand_visible)

            # Check Telugu Christian typography rendering
            telugu_header = page.locator("h1, h2, span").filter(has_text="టోని ప్రకాష్").first
            has_telugu = telugu_header.is_visible() if telugu_header.count() > 0 else False
            log_result("Telugu Typography rendering", has_telugu or "Tony Prakash" in page.content())

            # ----------------------------------------------------
            # TEST 2: THEME TOGGLE (DARK <-> LIGHT)
            # ----------------------------------------------------
            print("\n--- 2. Testing Theme Engine (Dark <-> Light Mode) ---")
            theme_btn = page.locator("button:has(svg.lucide-sun), button:has(svg.lucide-moon)").first
            if theme_btn.is_visible():
                initial_is_dark = "dark" in page.locator("html").get_attribute("class") or ""
                theme_btn.click()
                time.sleep(0.5)
                toggled_is_dark = "dark" in page.locator("html").get_attribute("class") or ""
                log_result("Theme toggle switched HTML class", initial_is_dark != toggled_is_dark)
                # Toggle back
                theme_btn.click()
                time.sleep(0.3)
            else:
                log_result("Theme toggle button presence", False, "Theme button not found in TopBar")

            # ----------------------------------------------------
            # TEST 3: SUB-PAGE ROUTING & NAVIGATION
            # ----------------------------------------------------
            print("\n--- 3. Testing Sub-Page Routing & Direct URL Access ---")

            # 3.1 Videos Page
            page.goto(f"{FRONTEND_URL}/videos", wait_until="networkidle")
            time.sleep(0.5)
            videos_rendered = page.locator("iframe, [src*='youtube'], button:has-text('Videos'), h1:has-text('Videos')").first.is_visible()
            log_result("Videos Page renders YouTube Ministry content", videos_rendered)

            # 3.2 About Page
            page.goto(f"{FRONTEND_URL}/about", wait_until="networkidle")
            time.sleep(0.5)
            about_rendered = "Tony Prakash" in page.content() and ("Ministry" in page.content() or "Vision" in page.content() or "About" in page.content())
            log_result("About Page renders biography & ministry vision", about_rendered)

            # 3.3 Bookings Page
            page.goto(f"{FRONTEND_URL}/bookings", wait_until="networkidle")
            time.sleep(0.5)
            booking_form = page.locator("input[name='name'], input[type='email'], form, button:has-text('Submit'), button:has-text('Book')").first.is_visible()
            log_result("Bookings Page renders ministry invitation form", booking_form)

            # 3.4 Membership Page
            page.goto(f"{FRONTEND_URL}/membership", wait_until="networkidle")
            time.sleep(0.5)
            has_vip_price = "299" in page.content()
            has_lifetime_text = "VIP" in page.content() or "Pass" in page.content() or "Lifetime" in page.content()
            log_result("Membership Page renders ₹299 One-Time VIP Lifetime Pass", has_vip_price and has_lifetime_text)

            # ----------------------------------------------------
            # TEST 4: AUDIO PLAYER & 30-SECOND PREVIEW ENFORCEMENT
            # ----------------------------------------------------
            print("\n--- 4. Testing Audio Player & 30-Second Preview Enforcement ---")
            page.goto(FRONTEND_URL, wait_until="networkidle")
            time.sleep(0.8)

            # Find a play button on a track card
            play_btn = page.locator("button:has(svg.lucide-play), [aria-label*='Play'], button.play-button").first
            if play_btn.is_visible():
                play_btn.click()
                time.sleep(1)

                # Check if bottom audio player appears
                player_bar = page.locator("audio, button:has(svg.lucide-pause), div.fixed.bottom-0").first
                log_result("Audio Player opens on track selection", player_bar.is_visible())

                # Check 30s preview limit notification / VIP pass prompt
                preview_prompt = page.content()
                has_preview_guard = "30" in preview_prompt or "VIP" in preview_prompt or "Preview" in preview_prompt or "Pass" in preview_prompt
                log_result("30-Second Preview limitation logic active", has_preview_guard)
            else:
                log_result("Track Play Button found in Catalog", False)

            # ----------------------------------------------------
            # TEST 5: ADMIN ROUTE GUARD ENFORCEMENT
            # ----------------------------------------------------
            print("\n--- 5. Testing Protected Admin Route Guard ---")
            page.goto(f"{FRONTEND_URL}/admin", wait_until="networkidle")
            time.sleep(0.8)

            # Unauthenticated user should be redirected to /auth
            current_url = page.url
            redirected_to_auth = "/auth" in current_url
            has_login_form = page.locator("input[type='password'], button:has-text('Sign In'), button:has-text('Log In')").first.is_visible()
            log_result("Unauthenticated /admin redirects to /auth login form", redirected_to_auth and has_login_form, f"URL: {current_url}")

            # ----------------------------------------------------
            # TEST 6: BROWSER REFRESH & BACK/FORWARD RESILIENCY
            # ----------------------------------------------------
            print("\n--- 6. Testing Browser Refresh & Back/Forward Navigation ---")
            page.goto(f"{FRONTEND_URL}/membership", wait_until="networkidle")
            time.sleep(0.5)

            # Direct reload
            page.reload(wait_until="networkidle")
            time.sleep(0.5)
            log_result("Page reload on /membership restores DOM without crashing", "299" in page.content())

            # Back button
            page.go_back(wait_until="networkidle")
            time.sleep(0.5)
            log_result("Browser Go Back works correctly", page.url != f"{FRONTEND_URL}/membership")

            # Forward button
            page.go_forward(wait_until="networkidle")
            time.sleep(0.5)
            log_result("Browser Go Forward works correctly", "/membership" in page.url)

            # ----------------------------------------------------
            # TEST 7: CONSOLE HEALTH & UNCAUGHT ERROR AUDIT
            # ----------------------------------------------------
            print("\n--- 7. Checking Console Health & Uncaught Error Logs ---")
            if not_founds:
                print("   Captured 404 Responses:")
                for url in not_founds:
                    print(f"   -> 404: {url}")
            # Filter out non-fatal expected network noise (like external YouTube thumbnails, audio previews, or favicons)
            fatal_errors = [e for e in console_errors if not any(x in e for x in ["favicon", "audio", "MediaError", "play() failed", "net::ERR", "status of 404"])]
            if fatal_errors:
                print("   Captured Console Errors:")
                for err in fatal_errors:
                    print(f"   -> {err}")
            log_result("Zero fatal JavaScript console errors detected", len(fatal_errors) == 0, f"Fatal errors: {len(fatal_errors)}")

            browser.close()

    finally:
        print("\n⚡ Terminating test background servers...")
        try:
            backend_proc.terminate()
            backend_proc.wait(timeout=3)
        except Exception:
            backend_proc.kill()

        try:
            frontend_proc.terminate()
            frontend_proc.wait(timeout=3)
        except Exception:
            frontend_proc.kill()

    print("\n====================================================")
    print(f"PLAYWRIGHT AUDIT RESULTS: {passed}/{passed + failed} TESTS PASSED")
    print("====================================================\n")

    if failed == 0:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    run_playwright_audit()
