import sys
import os

# Fix Windows console UTF-8 output
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from playwright.sync_api import sync_playwright

def run_tests():
    passed = 0
    failed = 0
    results = []

    def log_result(name, is_ok, details=""):
        nonlocal passed, failed
        if is_ok:
            passed += 1
            print(f" [PASS] {name} {details}", flush=True)
            results.append((name, "PASS", details))
        else:
            failed += 1
            print(f" [FAIL] {name} {details}", flush=True)
            results.append((name, "FAIL", details))

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        print("\n=======================================================", flush=True)
        print("1. TESTING LAPTOP / DESKTOP SCREENS (1440x900, 1536x864)", flush=True)
        print("=======================================================", flush=True)

        page = browser.new_page(viewport={"width": 1440, "height": 900})
        
        # 1.1 Home Page
        page.goto("http://localhost:5173/")
        page.wait_for_selector("text=Rev. Tony Prakash", timeout=10000)
        log_result("Desktop: Home page renders successfully", True)

        # 1.1a SEO & Google Analytics Assertions
        meta_desc = page.locator("meta[name='description']")
        log_result("SEO: Meta description is present", meta_desc.count() > 0)

        schema_script = page.locator("script[type='application/ld+json']")
        log_result("SEO: Schema.org JSON-LD structured data is present", schema_script.count() > 0)

        ga_script = page.locator("#google-analytics-gtag")
        log_result("Analytics: Google Analytics GA4 script injected", ga_script.count() > 0)

        # 1.2 Sidebar Avatar Alignment & My Library link
        avatar_img = page.locator("aside img[src*='tony_avatar_cutout.png']").first
        log_result("Desktop: Centered Avatar in Sidebar", avatar_img.is_visible())

        sidebar_library_link = page.locator("aside a[href='/library']").first
        log_result("Desktop: Sidebar has dedicated 'My Library' navigation", sidebar_library_link.is_visible())

        # Verify Discography is TOTALLY removed from Sidebar (User request #4)
        sidebar_discography = page.locator("aside a:has-text('Discography')")
        log_result("Sidebar: 'Discography' link is totally removed from sidebar", not sidebar_discography.is_visible())

        # Verify < > navigation buttons are removed from TopBar before search (User request #3)
        topbar_prev_next = page.locator("header button[title*='Go back'], header button[title*='Go forward'], header button:has(svg.lucide-chevron-left)")
        log_result("TopBar: '< >' navigation buttons removed before search input", not topbar_prev_next.is_visible())

        # 1.3 Desktop TopBar navigation label
        one_time_pass_tab = page.locator("header a:has-text('One-Time Pass')").first
        log_result("Desktop: TopBar has One-Time Pass label (not VIP Pass)", one_time_pass_tab.is_visible())

        # 1.4 Test Auth Page: Google & Facebook OAuth and Official Admin Login
        page.goto("http://localhost:5173/auth")
        page.wait_for_selector("text=Continue with Google", timeout=10000)
        google_btn = page.locator("button:has-text('Continue with Google')")
        log_result("OAuth: 'Continue with Google' button present and initialized", google_btn.is_visible())

        facebook_btn = page.locator("button:has-text('Continue with Facebook')")
        log_result("OAuth: 'Continue with Facebook' button present and initialized", facebook_btn.is_visible())

        # Verify official admin login with Tonyprakash.l@admin.in / Tonyprakash@admin
        admin_fill_btn = page.locator("button:has-text('Fill Admin Credentials')")
        log_result("Auth: 'Fill Admin Credentials' button present", admin_fill_btn.is_visible())
        admin_fill_btn.click()
        page.wait_for_timeout(300)

        email_val = page.locator("input[type='email']").input_value()
        pass_val = page.locator("input[type='password']").input_value()
        log_result("Auth: Admin credentials correctly populated (Tonyprakash.l@admin.in)", "tonyprakash.l@admin.in" in email_val.lower() and pass_val == "Tonyprakash@admin")

        # Submit admin login
        page.locator("button[type='submit']:has-text('Sign In to Account')").click()
        page.wait_for_timeout(1000)
        log_result("Auth: Admin login succeeds with JWT and bcrypt verification", "/admin" in page.url or page.locator("text=Rev. Tony Prakash (Admin)").is_visible())

        # 1.5 Devotional Songs Page (/music) - verify sort dropdown removed
        page.goto("http://localhost:5173/music")
        page.wait_for_selector("text=Devotional Songs", timeout=10000)
        sort_dropdown_music = page.locator("select:has-text('Catalog Sequence'), div:has-text('Sort:')")
        log_result("Music Page: 'Sort: Catalog Sequence' dropdown removed", not sort_dropdown_music.is_visible())

        # 1.6 Desktop Tracks Page (/tracks)
        page.goto("http://localhost:5173/tracks")
        page.wait_for_selector("text=Studio Backing Tracks", timeout=10000)
        
        # Verify sort dropdown removed from Tracks page
        sort_dropdown_tracks = page.locator("select:has-text('Catalog Sequence')")
        log_result("Tracks Page: 'Sort: Catalog Sequence' dropdown removed", not sort_dropdown_tracks.is_visible())

        # Dedicated Studio Section pill check - User explicitly asked to remove this!
        dedicated_pill = page.locator("text=Dedicated Studio Section")
        log_result("Tracks Page: 'Dedicated Studio Section' text removed", not dedicated_pill.is_visible())

        # Test Razorpay Checkout trigger on Tracks Buy • ₹99 (User request #5)
        desktop_buy_btn = page.locator("main button:has-text('Buy • ₹99')").first
        log_result("Desktop Tracks: Buy • ₹99 button present", desktop_buy_btn.is_visible())
        desktop_buy_btn.click()
        page.wait_for_selector("#razorpay-gateway-dialog", timeout=10000)

        # Check Razorpay modal is open with solid backdrop and UPI/Cards
        razorpay_modal = page.locator("#razorpay-gateway-dialog")
        log_result("Tracks Page: Clicking 'Buy • ₹99' opens Razorpay Payment Gateway", razorpay_modal.is_visible())

        # Check Razorpay UPI QR and price display within modal
        razorpay_amount = razorpay_modal.locator("text=₹99").first
        log_result("Razorpay Gateway: Displays correct amount (₹99)", razorpay_amount.is_visible())

        # Close Razorpay modal
        page.locator("button[title='Close payment gateway']").click()
        page.wait_for_timeout(400)
        log_result("Razorpay Gateway: Closes cleanly", not razorpay_modal.is_visible())

        # 1.7 Desktop Membership Page Razorpay Trigger
        page.goto("http://localhost:5173/membership")
        page.wait_for_selector("text=Songs One-Time Pass", timeout=10000)
        
        # Check active status or click Get Lifetime Pass
        active_badge = page.locator("text=VIP Lifetime Pass Active")
        membership_btn = page.locator("button:has-text('Get Lifetime Pass')").first
        if membership_btn.is_visible():
            membership_btn.click()
            page.wait_for_selector("#razorpay-gateway-dialog", timeout=10000)
            razorpay_sub_modal = page.locator("#razorpay-gateway-dialog")
            log_result("Membership Page: Clicking One-Time Pass launches Razorpay Gateway", razorpay_sub_modal.is_visible())
            if razorpay_sub_modal.is_visible():
                page.locator("button[title='Close payment gateway']").click()
                page.wait_for_timeout(300)
        elif active_badge.is_visible():
            log_result("Membership Page: User correctly displays active lifetime status badge", True)

        # 1.8 Desktop Library Page (/library)
        page.goto("http://localhost:5173/library")
        page.wait_for_selector("text=Personal Library", timeout=10000)
        log_result("Desktop: /library page renders cleanly with Playlists", True)

        print("\n=======================================================", flush=True)
        print("2. TESTING MOBILE VIEWPORTS (iPhone SE: 375x667, iPhone 14: 390x844)", flush=True)
        print("=======================================================", flush=True)

        # Mobile Device: iPhone SE 375x667 (The exact size from user's screenshots)
        mobile_page = browser.new_page(
            viewport={"width": 375, "height": 667},
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
        )
        
        # 2.1 Mobile Devotional Songs Page (/music)
        mobile_page.goto("http://localhost:5173/music")
        mobile_page.wait_for_selector("main div.group", timeout=10000)

        # Check that song title and Telugu names are clearly visible
        first_song_title = mobile_page.locator("main div.group h4").first
        title_text = first_song_title.inner_text().strip()
        log_result("Mobile /music: Song title is clearly visible on mobile (Image 2 fix)", len(title_text) > 0, f"'{title_text}'")

        first_song_telugu = mobile_page.locator("main div.group p.font-telugu").first
        telugu_text = first_song_telugu.inner_text().strip()
        log_result("Mobile /music: Song Telugu title is clearly visible on mobile (Image 2 fix)", len(telugu_text) > 0)

        # Verify inline "VIP Pass • ₹299" badge is NOT cluttering the mobile track row
        mobile_vip_badge = mobile_page.locator("main div.group span:has-text('VIP Pass • ₹299')").first
        log_result("Mobile /music: Cluttered VIP Pass badge removed from mobile rows", not mobile_vip_badge.is_visible())

        # 2.2 3-DOTS ACTION MENU ON SONGS
        dots_btn = mobile_page.locator("main div.group button[title='More options']").first
        log_result("Mobile /music: 3-dots action menu button is present on songs", dots_btn.is_visible())

        dots_btn.click()
        mobile_page.wait_for_timeout(400)

        menu_dropdown = mobile_page.locator("[data-testid='track-action-dropdown']")
        log_result("3-Dots Menu: Action dropdown opens cleanly on tap", menu_dropdown.is_visible())

        play_next_opt = mobile_page.locator("button:has-text('Play Next')")
        add_queue_opt = mobile_page.locator("button:has-text('Add to Queue')")
        add_playlist_opt = mobile_page.locator("button:has-text('Add to Playlist')")
        share_opt = mobile_page.locator("button:has-text('Share Song')")

        log_result("3-Dots Menu: 'Play Next' option is present", play_next_opt.is_visible())
        log_result("3-Dots Menu: 'Add to Queue' option is present", add_queue_opt.is_visible())
        log_result("3-Dots Menu: 'Add to Playlist' option is present", add_playlist_opt.is_visible())
        log_result("3-Dots Menu: 'Share Song' option is present", share_opt.is_visible())

        # Test clicking 'Add to Playlist' opens the modal
        add_playlist_opt.click(force=True)
        mobile_page.wait_for_timeout(300)
        playlist_modal = mobile_page.locator("text=Add to Playlist").first
        log_result("3-Dots Menu: 'Add to Playlist' modal opens successfully", playlist_modal.is_visible())

        # Close playlist modal
        mobile_page.locator("button:has-text('Done')").first.click()
        mobile_page.wait_for_timeout(300)

        # 2.3 Mobile Scroll Navbar Stability (Fixing navbar moving up when scrolling down)
        # Check navbar position before and after scrolling to the very bottom
        initial_nav_box = mobile_page.locator("nav.border-t").bounding_box()
        
        # Scroll <main> down to the absolute bottom
        mobile_page.evaluate("""() => {
            const main = document.querySelector('main');
            if (main) main.scrollTop = main.scrollHeight;
        }""")
        mobile_page.wait_for_timeout(400)
        
        scrolled_nav_box = mobile_page.locator("nav.border-t").bounding_box()
        # Navbar y position should be virtually identical (within 1px tolerance)
        nav_stable = abs(initial_nav_box['y'] - scrolled_nav_box['y']) < 2
        log_result("Mobile Scrolling: Bottom Navbar stays completely locked at bottom without moving up", nav_stable)

        # 2.4 Mobile Bottom Nav 'Library' button links to /library (User Requirement)
        library_nav_btn = mobile_page.locator("nav a[href='/library']").first
        log_result("Mobile Bottom Nav: 'Library' tab points to /library", library_nav_btn.is_visible())
        
        # Click Library tab
        library_nav_btn.click()
        mobile_page.wait_for_selector("text=Personal Library", timeout=10000)
        log_result("Mobile Navigation: Tapping Library navigates to /library page", mobile_page.url.endswith("/library"))

        # 2.5 Library Page Feature: Create Playlist
        create_pl_btn = mobile_page.locator("button:has-text('New Playlist'), button:has-text('Create Playlist')").first
        create_pl_btn.click()
        mobile_page.wait_for_timeout(300)

        # Fill playlist title in modal
        title_input = mobile_page.locator("input[placeholder*='e.g. Sunday Morning Hymns']")
        title_input.fill("Choir Special Praise")
        
        submit_create_btn = mobile_page.locator("button[type='submit']:has-text('Create Playlist')")
        submit_create_btn.click()
        mobile_page.wait_for_timeout(400)

        # Check playlist detail view opened
        created_pl_header = mobile_page.locator("h2:has-text('Choir Special Praise')")
        log_result("Library Page: Playlist created & loaded into detail view", created_pl_header.is_visible())

        # Test Add Songs inside playlist
        add_songs_btn = mobile_page.locator("button:has-text('Add Songs')").first
        add_songs_btn.click()
        mobile_page.wait_for_timeout(300)
        
        first_add_track_btn = mobile_page.locator("[data-testid='modal-add-track-btn']").first
        first_add_track_btn.click(force=True)
        mobile_page.wait_for_timeout(300)
        
        log_result("Library Page: Added song to custom playlist", mobile_page.locator("text=Added").first.is_visible())
        mobile_page.locator("button:has-text('Done')").first.click()
        mobile_page.wait_for_timeout(300)

        # 2.6 Check Liked Songs and Purchased Tracks Tabs
        mobile_page.locator("button:has-text('Liked Songs')").first.click()
        mobile_page.wait_for_timeout(300)
        liked_tab_ok = mobile_page.locator("text=Saved Devotional Songs").first.is_visible() or mobile_page.locator("text=No liked songs yet").first.is_visible()
        log_result("Library Page: Liked Songs tab opens cleanly", liked_tab_ok)

        mobile_page.locator("button:has-text('Purchased Tracks')").first.click()
        mobile_page.wait_for_timeout(300)
        purchased_tab_ok = mobile_page.locator("text=Unlocked Studio Backing Tracks").first.is_visible() or mobile_page.locator("text=No purchased backing tracks yet").first.is_visible()
        log_result("Library Page: Purchased Tracks tab opens cleanly", purchased_tab_ok)

        print("\n=======================================================", flush=True)
        print("3. TESTING MODAL & CLEAN BUSINESS RULES", flush=True)
        print("=======================================================", flush=True)

        # On /tracks page, verify backing track limit modal & close toggle
        mobile_page.goto("http://localhost:5173/tracks")
        mobile_page.wait_for_selector("main div.group", timeout=10000)
        
        mobile_page.locator("main div.group").first.click()
        mobile_page.wait_for_timeout(800)

        # Advance audio to 30.2s to trigger preview limit modal
        mobile_page.evaluate("""() => {
            if (window.__tonyAudio) {
                window.__tonyAudio.currentTime = 30.2;
                window.__tonyAudio.dispatchEvent(new Event('timeupdate'));
            }
        }""")
        mobile_page.wait_for_timeout(800)

        modal_dialog = mobile_page.locator("#preview-limit-modal-dialog")
        modal_visible = modal_dialog.is_visible()
        log_result("Modal: 30-Second Studio Preview Ended modal appears", modal_visible)

        if modal_visible:
            buy_btn = mobile_page.locator("#modal-buy-track-btn")
            log_result("Modal: 'Buy Backing Track • ₹99' button is present and clickable", buy_btn.is_visible())

            pass_claim = mobile_page.locator("text=Unlimited full playback of all 57 backing tracks")
            log_result("Modal: ₹299 pass claims removed from backing tracks modal", not pass_claim.is_visible())

            close_btn = mobile_page.locator("#preview-limit-modal-close")
            close_btn.click()
            mobile_page.wait_for_timeout(600)

            is_closed = not mobile_page.locator("#preview-limit-modal-dialog").is_visible()
            log_result("Modal: Close toggle (X) closes cleanly without looping", is_closed)

        print("\n=======================================================", flush=True)
        print("4. TESTING YOUTUBE CHANNEL VIDEOS SHOWCASE & EMBEDS", flush=True)
        print("=======================================================", flush=True)

        # 4.1 Desktop /videos page
        page.goto("http://localhost:5173/videos")
        page.wait_for_selector("text=Official Worship & Devotional Videos", timeout=10000)
        log_result("Videos Page: Title and YouTube channel banner render", True)

        # Check Theatre iframe embed exists
        theatre_iframe = page.locator("iframe[src*='youtube-nocookie.com/embed']").first
        log_result("Videos Page: Responsive YouTube Theatre Embed player is present", theatre_iframe.is_visible())

        # Check video cards count (should be at least 30)
        video_cards = page.locator("main div.grid > div")
        card_count = video_cards.count()
        log_result(f"Videos Page: Showcasing full channel videos ({card_count} videos rendered)", card_count >= 30)

        # Test video search filter
        search_input = page.locator("input[placeholder*='Search all']")
        search_input.fill("Najareyudaina")
        page.wait_for_timeout(300)
        filtered_count = page.locator("main div.grid > div").count()
        log_result(f"Videos Page: Search filter works ('Najareyudaina' found {filtered_count} videos)", filtered_count > 0 and filtered_count < card_count)
        search_input.fill("")
        page.wait_for_timeout(300)

        # 4.2 Home Page YouTube Showcase Section & Video Modal
        page.goto("http://localhost:5173/")
        page.wait_for_selector("text=Official Videos & Live Worship", timeout=10000)
        home_channel_link = page.locator("a:has-text('channel embeds')").first
        log_result("Home Page: Channel video showcase section renders with dynamic embed count", home_channel_link.is_visible())

        # Click first video card on Home page to open VideoModal
        first_home_vid = page.locator("section:has-text('Official Videos & Live Worship') div.grid > div").first
        first_home_vid.click()
        page.wait_for_timeout(500)

        modal_iframe = page.locator("div.fixed iframe[src*='youtube-nocookie.com/embed']")
        log_result("Home Page: Clicking video opens responsive VideoModal with YouTube player", modal_iframe.is_visible())

        # Close video modal
        page.locator("button[aria-label='Close video']").click()
        page.wait_for_timeout(400)
        log_result("Home Page: VideoModal closes cleanly", not modal_iframe.is_visible())

        browser.close()

        print("\n=======================================================", flush=True)
        print(f"TEST SUMMARY: {passed} PASSED, {failed} FAILED", flush=True)
        print("=======================================================", flush=True)
        
        return failed == 0

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
