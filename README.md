# TONY PRAKASH OFFICIAL — TONY'S MUSIC PLATFORM

A production-oriented, visually stunning, fully responsive Telugu Christian devotional music platform, subscription system, and secure admin dashboard for **Tony Prakash**—singer, lyricist, and composer.

---

## 1. Creative Direction & Brand Identity: TONY'S MUSIC

The platform is designed as a digital music sanctuary combining 3D environments, spiritual reverence, editorial typography, and high-performance streaming.

- **Color Palette:**
  - **Midnight Black (`#090A0D`):** Deep stage horizon & infinite background.
  - **Espresso Brown (`#211A16`):** Warm atmospheric undertones & acoustic hall resonance.
  - **Antique Gold (`#C6A565` / `#DFC38A` / `#8F7138`):** Sacred halos, primary actions, and membership badges.
  - **Warm Ivory (`#F4EBDD`):** Headings and high-contrast typography.
  - **Deep Charcoal (`#121318` / `#161820`):** Frosted glass surfaces and card backdrops.
- **Typography:**
  - **Headings:** *Cormorant Garamond* (Editorial serif)
  - **Body & Controls:** *Inter* (Clean, legible sans-serif)
  - **Telugu Titles & Lyrics:** *Noto Serif Telugu* (Full Unicode devotional support)

---

## 2. Key Architecture & Features

### 1. Cinematic 3D Hero Section
- Built with **Three.js** and **React Three Fiber / Drei**
- Sculptural golden light ring, abstract sacred cross geometry, volumetric spotlights, and floating golden dust particles
- Smooth mouse parallax and responsive camera adjustments
- Hardware-accelerated CSS/WebGL graceful fallback for low-power devices
- Verified Eyebrow: `TONY PRAKASH OFFICIAL`
- Headline: *"A Voice of Worship. A Heart for His Glory."*
- CTAs: `EXPLORE MUSIC` and direct link to official YouTube channel [`https://www.youtube.com/@TonyPrakashOfficial`](https://www.youtube.com/@TonyPrakashOfficial)

### 2. Complete Music Catalogue & Audio Player
- **Catalogue:**
  - Real database-driven tracks: *"శ్రీ యేసు నీ పాద సేవ"*, *"అబ్రహాము దేవుడవు"*, *"విడువని నా యేసయ్య"*, *"అమ్మ ప్రేమ విలువైనది"*, *"నజరేయుడైన యేసయ్య"*, *"క్రొత్త పాట పాడనా నా యేసు కోసం"*, and more.
  - Genre filters: All, Worship, Devotional, Praise, Gospel
  - Access filters: Free Public Streaming, Subscriber Exclusives, Downloadable tracks
  - Search bar supporting Telugu script and English transliteration
  - Lyrics & Track Detail Modal: full Telugu lyrics (*సాహిత్యం*), English translations, composer/lyricist/singer credits, and release year
- **Persistent Audio Player:**
  - Sticky bottom player bar persists across all route navigation
  - Play, pause, seekbar, volume control, mute, skip forward/backward
  - Interactive playback queue
  - Animated equalizer wave bars in sync with playback
  - Mobile compact player drawer

### 3. Albums & Discography
- Dedicated release pages with cover-art hero, full tracklist, and play-album controls
- Featured collections:
  - *Neetho (నీతో)* — 2023
  - *Deva Sannidhi (దేవ సన్నిధి)* — 2024
  - *A Journey of Praise (కీర్తనల యాత్ర)* — 2022

### 4. Official YouTube Visuals: "Watch. Listen. Worship."
- Verified YouTube integration featuring embeds from `@TonyPrakashOfficial`
- Responsive 16:9 lightbox modal player with direct YouTube links

### 5. Membership & Download Access
- **Pricing Structure:**
  - **Free Public Streaming:** ₹0 (Explore catalog, listen to public releases, watch YouTube embeds)
  - **Tony's VIP Pass Membership:** ₹299 / month (29,900 integer paise) — Unlocks all subscriber-exclusive tracks and member downloads
  - **Single Track Download:** ₹99 one-time (9,900 integer paise) — Permanent offline audio access
- **Razorpay Integration:**
  - Server-side order creation (`/api/payments/create-order`)
  - Server-side signature verification with SHA-256 HMAC
  - Webhook processing with raw body validation and idempotency
  - Clear test-mode handling with setup instructions for live keys

### 6. Secure Authenticated Downloads
- Audio files protected behind private storage tokens
- Server-side entitlement verification (active subscription OR verified track purchase)
- Rights verification enforcement (`rightsConfirmed === true`)
- Short-lived HMAC-signed tokens (`/api/downloads/serve/:token`) with `Content-Disposition: attachment`

### 7. Worship Event Bookings Workflow
- Heading: *"Let’s Make Your Event a Time of Worship"*
- Validated form collecting: Full name, email, phone, event type, organization, proposed date, time, location, audience size, and consent
- Generates unique reference code (e.g. `TP-BK-2026-XXXX`)
- Stored directly in the database with status workflow: `NEW`, `CONTACTED`, `UNDER_DISCUSSION`, `CONFIRMED`, `COMPLETED`, `CANCELLED`
- Direct WhatsApp enquiry option

### 8. Private Admin Dashboard (`/admin`)
- Real database-backed statistics (tracks, albums, registered listeners, active subscriptions, revenue in rupees and paise, booking counts)
- **Track Manager:** CRUD operations, rights verification toggle, publish/unpublish, subscriber-only toggle, download pricing
- **Album Manager:** Discography administration
- **Video Manager:** YouTube video library controls
- **Bookings Management:** Status changes, internal notes, search, filter, and 1-click **CSV export**
- **Payments Audit:** Transaction and subscription records
- **Settings Editor:** Artist quote, WhatsApp number, pricing, hero copy

---

## 3. Demo Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@tonyprakash.com` | `SacredLight2026!` | Full access to `/admin` dashboard & catalogue controls |
| **Premium Member** | `member@tonyprakash.com` | `Worship2026!` | Active ₹299/mo subscription with exclusive song downloads |

*Fast 1-click login buttons are provided on the `/auth` page.*

---

## 4. Local Installation & Development

### Prerequisites
- Node.js v18+ or v22+
- npm v9+

### Backend Setup
```bash
cd backend
npm install
npx prisma db push
npm run prisma:seed   # Seeds verified Tony Prakash tracks, albums & admin
npm run dev           # Starts API server on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev           # Starts Vite app on http://localhost:5173 (or 5174)
```

---

## 5. Environment Variables (`backend/.env`)

```env
PORT=5000
DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.mongodb.net/tony_prakash_music?retryWrites=true&w=majority"
JWT_SECRET="sacred_light_jwt_secret_tony_prakash_2026_super_secure"
ADMIN_INVITE_KEY="tony_prakash_sacred_light_admin_2026"
CLIENT_URL="http://localhost:5173"

# Razorpay Configuration (Paise integers: 9900 = Rs 99, 29900 = Rs 299)
RAZORPAY_KEY_ID="rzp_test_placeholder_key_id"
RAZORPAY_KEY_SECRET="rzp_test_placeholder_secret"
RAZORPAY_WEBHOOK_SECRET="rzp_webhook_secret_key"

# Storage Configuration for protected downloads
DOWNLOAD_TOKEN_SECRET="sacred_download_token_secret_key_88990"
DOWNLOAD_EXPIRY_SECONDS=3600
```

---

## 6. Deployment to Vercel & GitHub

1. **GitHub Repository (Audio files excluded)**:
   - The repository has `.gitignore` pre-configured to strictly ignore audio tracks (`Tony Prakash songs/`, `.wav`, `.mp3`) to keep Git under Vercel & GitHub size limits.
   - Simply connect your GitHub repository to Vercel.

2. **Vercel Deployment**:
   - `vercel.json` is ready at the root and inside `frontend/`.
   - Build Command: `npm --prefix frontend run build` (or `npm run build` if root is set to `frontend`)
   - Output Directory: `frontend/dist` (or `dist` if root is `frontend`)
   - SPA rewrites and clean routing are pre-configured.

3. **Google Search Indexing (Make it come in Google)**:
   - **Sitemap**: Available at `/sitemap.xml` with priority and daily/weekly change frequencies.
   - **Robots.txt**: Available at `/robots.txt` granting full access to Googlebot and crawler agents.
   - **Schema.org Structured Data**: Rich JSON-LD snippet for `MusicGroup` and `WebSite` included on every page.
   - **Google Search Console**: Once deployed on Vercel (or with custom domain), add your Vercel URL (e.g. `https://tony-music.vercel.app`) to [Google Search Console](https://search.google.com/search-console), submit the sitemap URL (`/sitemap.xml`), and Google will crawl and index your site!

4. **MongoDB Atlas Database**:
   - Built on Prisma with MongoDB native provider (`provider = "mongodb"`).
   - Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), copy your connection string, and set it as `DATABASE_URL` in your backend environment variables.
