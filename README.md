<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=f33767,9333ea&height=220&section=header&text=Adaptive%20Bitrate%20HLS%20Streaming&fontSize=42&animation=fadeIn&fontAlignY=38&desc=A%20Next-Gen%20Premium%20Anime%20Streaming%20Platform%20Built%20with%20MERN&descAlignY=56&descAlign=50&fontColor=ffffff" />
</div>

<div align="center">

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-anime--streaming--website--seven.vercel.app-f33767?style=for-the-badge)](https://anime-streaming-website-seven.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-manavsharma111-181717?style=for-the-badge&logo=github)](https://github.com/manavsharma111/anime-streaming-website)

</div>

<div align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-backend-architecture">Backend</a> •
  <a href="#-redux-state-management">Frontend</a> •
  <a href="#-getting-started">Setup</a>
</div>

<br/>

---

## 🚀 Overview

**Adaptive Bitrate HLS Streaming Platform** is a highly scalable, full-stack **premium anime streaming platform** with a complete monetization system. Built from scratch with modern web technologies, it features:

- ⚡ Ultra-fast **adaptive HLS video streaming** (1080p / 720p / 480p)
- 💳 Full **Razorpay payment gateway** integration with subscription tiers
- 🤖 **Intelligent bulk episode fetcher** using `@consumet/extensions`
- 🔴 **Real-time transcoding queues** via BullMQ + Socket.io
- 🎨 Stunning **glassmorphism dark UI** with cinematic landing page
- 🔒 **Protected routes** — watch access requires authentication

---

## 🌟 Features

### 🔐 Authentication & Security

- **Google OAuth2 SSO** — Native OAuth2 flow via Google APIs (no Passport.js).
- **JWT Token Strategy** — Stateless auth using **Access Tokens (15m)** + **Refresh Tokens (7 days)**.
- **Secure Cookie Storage** — Tokens stored in `httpOnly`, `secure`, `sameSite: strict` cookies.
- **Role-Based Access Control (RBAC)** — Differentiates `user` and `admin` with custom middleware.
- **Protected Watch Routes** — Unauthenticated users are redirected away from the video player.
- **Profile Customization** — Users can update their username and upload a custom avatar.

---

### 💳 Monetization & Subscriptions

- **Razorpay Payment Gateway** — End-to-end integration with **HMAC SHA256 signature verification** to prevent fraudulent activations.
- **Subscription Tiers** — Multiple plans (e.g., Super Saiyan, Mastered Ultra) with different perks:
  - Max video resolution unlocked (480p → 720p → 1080p)
  - Offline download access
  - Priority server routing
- **Pricing Page** — Beautiful, animated plan comparison page with Razorpay checkout flow.
- **Auto Status Management** — Subscriptions are automatically tracked and expired via scheduled cron jobs.
- **Automated Cron Jobs** — Daily midnight job (`node-cron`) checks for subscriptions expiring in 3 days and auto-updates statuses.
- **Email Notifications** — Nodemailer sends expiration reminders and purchase confirmations to users.
- **Admin Revenue Dashboard** — View total active subscriptions, total revenue, and filter/sort users by status and days remaining.

---

### 🎥 Adaptive Video Processing (Backend Pipeline)

- **Local Encode Engine** — Upload raw `.mp4` / `.mkv` via **Multer** and transcode to HLS using **Fluent-FFmpeg**.
- **Multi-Bitrate Output** — Generates 1080p, 720p, 480p renditions with a master `.m3u8` playlist.
- **Intelligent Audio & Subtitle Mapping** — Preserves all embedded audio tracks (dual-audio Japanese/English) and soft-subs.
- **Optimized MP4 Compression** — CRF-based compression for high-quality downloads.
- **Message Queues (BullMQ & Redis)** — Transcoding decoupled from main thread to prevent server blocking.
- **Real-Time Progress Tracking** — Live encoding metrics pushed to Admin Dashboard via **Socket.io**.
- **Cloud Object Storage** — Processed HLS chunks uploaded to **Cloudflare R2 / AWS S3**.

---

### ⚡ Dual-Mode Episode Management

- **Bulk Link Fetcher** — Integrates `@consumet/extensions` to instantly scrape streaming sources + skip-times.
- **Manual Uploads** — Admins can upload custom episodes and track encoding status in real-time.
- **Admin Catalog** — Full CRUD for anime: create, edit, delete series and episodes.
- **Upload Queue** — Real-time BullMQ queue panel showing job progress, success, and failures.

---

### 🧑‍💻 User Experience & Personalization

- **Watch History & Resumption** — Precise per-episode timestamp tracking; resumes exactly where left off.
- **Favorites & Wishlist** — Personalized watchlist management.
- **Reviews & Ratings** — Star rating + comment system with replies.
- **In-App Notifications** — Real-time Socket.io notifications (mark read, delete).
- **Surprise Me** — Random anime/episode picker.
- **Auto-Next & Auto-Skip** — Automatically plays next episode and skips OP/ED segments.

---

### 🎨 Premium Frontend UI/UX

- **Custom HLS Video Player** — Built from scratch using `hls.js` with quality selector, speed controls, PiP, fullscreen, and keyboard shortcuts.
- **Cinematic Landing Page** — Eye-catching hero with parallax scrolling, animated typography, horizontal lookbook, and GSAP effects.
- **Glassmorphism Dark Mode** — Sleek UI with gradients, frosted glass panels, and vibrant accents.
- **Fluid Animations** — Scroll-based micro-animations via **Framer Motion** & **GSAP**.
- **Smooth Scrolling** — **Lenis** for butter-smooth inertia scrolling.
- **Custom Cursor** — Premium interactive custom cursor animation.
- **Responsive Design** — Fully mobile-optimized: bottom-sheet mobile menus, responsive tables, adaptive layouts.
- **Admin Dashboard** — Analytics (Recharts), queue monitoring, and full user + subscription management panel.

---

## 🛠️ Tech Stack

### Frontend

| Library | Purpose |
|---|---|
| **React 18** (Vite) | Core UI framework |
| **Redux Toolkit** | Global state (Auth, Anime, History, Subscriptions) |
| **TailwindCSS** | Utility-first responsive styling |
| **Framer Motion** | Page transitions & micro-animations |
| **GSAP** | Scroll-based cinematic animations |
| **HLS.js** | `.m3u8` adaptive video playback |
| **React Router DOM** | Client-side SPA routing with protected routes |
| **Axios** | HTTP client with interceptors |
| **Socket.io-client** | Real-time notifications & encoding progress |
| **Lenis** | Smooth scroll library |
| **Recharts** | Analytics charts in Admin Dashboard |
| **Lucide React** | Modern SVG icon set |

### Backend

| Library | Purpose |
|---|---|
| **Node.js & Express.js** | REST API server |
| **MongoDB (Mongoose)** | Primary NoSQL database |
| **Redis & BullMQ** | Background job queues |
| **Fluent-FFmpeg** | Video transcoding to HLS |
| **@aws-sdk/client-s3** | Cloudflare R2 / S3 object storage |
| **@consumet/extensions** | Anime source scraping |
| **Socket.io** | Real-time bi-directional events |
| **Razorpay SDK** | Payment processing & signature verification |
| **Node-Cron** | Scheduled subscription expiry jobs |
| **Nodemailer** | Transactional email delivery |
| **Multer** | File & avatar upload middleware |

---

## ⚙️ Backend Architecture

The backend uses an **event-driven, queue-based architecture** separating heavy compute from API logic.

```
Client Request
     │
     ▼
Express REST API (Controllers → Services → MongoDB)
     │
     ├── Video Upload → Cloudflare R2 (raw file)
     │        └── BullMQ Job Added
     │                 └── Worker picks up job
     │                          └── FFmpeg encodes (1080p / 720p / 480p)
     │                                   └── HLS chunks → Cloudflare R2
     │                                            └── Socket.io Progress → Admin
     │
     ├── Payment → Razorpay Order → Frontend Checkout
     │        └── Verify Signature → Activate Subscription in DB
     │
     └── Cron (Midnight) → Check expiring subs → Send Email → Update Status
```

### Key Design Decisions

1. **Memory-Safe FFmpeg** — Videos are streamed to disk locally before FFmpeg to avoid `SIGSEGV` crashes on 512MB RAM servers.
2. **Stateless Auth** — JWT in httpOnly cookies; no server-side sessions.
3. **Payment Security** — Razorpay signatures verified server-side using HMAC SHA256 before any subscription activates.
4. **Decoupled Workers** — BullMQ workers run as a separate process to prevent event loop blocking.

---

## 🏆 Engineering Challenges Solved

| Challenge | Solution |
|---|---|
| FFmpeg crashing on 512MB RAM server | "Local-first" download stream before encoding to avoid OOM |
| HLS keyframe sync crashes | Strict `-g 48 -keyint_min 48` across all resolutions |
| AAC NaN crash on MKV files | Downmix FLAC/TrueHD to 48kHz stereo before encoding |
| Razorpay payment fraud prevention | Server-side HMAC SHA256 signature verification |
| Mobile table layout overflow | `min-w-0` + `overflow-x-auto` flex containment fix |
| Mongoose silently dropping avatar data | Added missing `avatar` field to User schema |

---

## 🧠 Redux State Management

```
store/
├── authSlice         → User session, JWT, roles, notifications
├── animeSlice        → Catalog, search results, trending
├── episodeSlice      → Active episode, skip times, source URLs
├── historySlice      → Watch timestamps, resume positions
├── wishlistSlice     → User saved anime list
├── reviewSlice       → Reviews & ratings
└── subscriptionSlice → Subscription plans & loading state
```

Each slice uses **Redux Thunks** for async API calls with proper `pending / fulfilled / rejected` states.

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB instance
- Redis Server
- FFmpeg installed
- Razorpay account (for payments)

### Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/manavsharma111/anime-streaming-website.git
   cd anime-streaming-website
   ```

2. **Install Backend**
   ```bash
   cd backend && npm install
   ```

3. **Install Frontend**
   ```bash
   cd ../frontend && npm install
   ```

4. **Environment Variables** — Create `backend/.env`:
   ```env
   PORT=4000
   MONGO_URI=your_mongodb_uri
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   JWT_SECRET=your_super_secret_key
   REFRESH_TOKEN_SECRET=your_refresh_secret

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Cloudflare R2 / S3
   R2_ENDPOINT=your_r2_endpoint
   R2_ACCESS_KEY_ID=your_access_key
   R2_SECRET_ACCESS_KEY=your_secret_key
   R2_BUCKET_NAME=your_bucket_name

   # Razorpay
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret

   # Email (Gmail App Password)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password

   # URLs
   FRONTEND_URL=http://localhost:5173
   SERVER_URL=http://localhost:4000
   ```

5. **Run the App**

   ```bash
   # Terminal 1 — Backend
   cd backend && npm run dev

   # Terminal 2 — Frontend
   cd frontend && npm run dev
   ```

---

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=f33767,9333ea&height=120&section=footer" />
  <br/>
  <i>Built with ❤️ for Anime Lovers by <a href="https://github.com/manavsharma111">Manav Sharma</a></i>
</div>
