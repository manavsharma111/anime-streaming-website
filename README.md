<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=timeGradient&height=200&section=header&text=Anime%20Streaming%20Platform&fontSize=50&animation=fadeIn&fontAlignY=38&desc=A%20Next-Gen%20Anime%20Platform%20Built%20with%20MERN&descAlignY=55&descAlign=50" />
</div>

<div align="center">
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#backend-overview">Backend</a> •
  <a href="#frontend--state-management">Frontend</a>
</div>

<br/>

## 🚀 Overview

Welcome to the **Next-Generation Anime Streaming Platform with Adaptive HLS Playback**, a highly scalable, full-stack web application designed to deliver a seamless and premium anime viewing experience. Built with modern web technologies, this platform features an ultra-fast HLS video player, an intelligent bulk episode fetcher, real-time transcoding queues, and a stunning glassmorphism user interface.

Whether you're streaming via third-party providers or encoding raw `.mp4`/`.mkv` files locally into adaptive bitrates (1080p, 720p, 480p), this platform is engineered for high performance and minimal latency.

---

## 🌟 Comprehensive Feature List

### 🔐 Authentication & Security
- **Google OAuth2 SSO**: Implemented native OAuth2 flow via Google APIs without heavy libraries like Passport.js.
- **JWT Token Strategy**: Highly secure stateless authentication using **Access Tokens (15m)** and **Refresh Tokens (7 days)**.
- **Secure Cookie Storage**: Tokens are stored in `httpOnly`, `secure`, and `sameSite: strict` cookies to prevent XSS and CSRF attacks.
- **Role-Based Access Control (RBAC)**: Custom middleware to differentiate between `user` and `admin` permissions. Auto-admin assignment based on secure `.env` variables.

### 🎥 Adaptive Video Processing (Backend Pipeline)
- **Local Encode Engine**: Upload raw `.mp4` / `.mkv` files via **Multer** and transcode them into HLS (`.m3u8`) adaptive bitrates (1080p, 720p, 480p) using **Fluent-FFmpeg**.
- **Intelligent Audio & Subtitle Mapping**: Explicitly maps all embedded audio tracks (e.g., dual-audio English/Japanese) and soft-subs so they are perfectly preserved in the final HLS stream.
- **Optimized MP4 Compression**: Utilizes Constant Rate Factor (CRF) for generating highly compressed, high-quality MP4s for direct user downloads.
- **Message Queues (BullMQ & Redis)**: Background transcoding is fully decoupled from the main thread using Redis-backed queues to prevent server blocking.
- **Real-Time Progress Tracking**: Emits live encoding metrics to the Admin Dashboard via **Socket.io**.
- **Cloud Object Storage**: Automatically uploads processed video chunks to **Cloudflare R2 / AWS S3** via `@aws-sdk/client-s3`.

### ⚡ Dual-Mode Episode Management
- **Bulk Link Fetcher**: Integrates `@consumet/extensions` directly into the backend to instantly scrape streaming sources and skip-times.
- **Manual Uploads**: Allows admins to upload custom episodes and track their encoding status.

### 🧑‍💻 User Experience & Personalization
- **Watch History & Resumption**: Tracks user watch timestamps precisely so they can resume episodes seamlessly across devices.
- **Favorites & Wishlist**: Users can manage a personalized watchlist of their favorite anime.
- **Reviews & Ratings**: Interactive review system for users to rate and comment on anime.
- **In-App Notifications**: Real-time notification system (mark as read, delete) for users.
- **Profile Customization**: Users can update their avatars and usernames.

### 🎨 Premium Frontend UI/UX
- **Adaptive HLS Player**: Custom React video player using `hls.js` with quality selection, playback speed controls, and auto-skip.
- **Immersive Design**: Built with **TailwindCSS** featuring glassmorphism, sleek dark mode, and vibrant gradients.
- **Fluid Animations**: Scroll-based micro-animations powered by **Framer Motion** & **GSAP**.
- **Smooth Scrolling**: Implemented **Lenis** for a butter-smooth scroll experience.
- **Intelligent State Management**: Uses **Redux Toolkit** (Slices & Thunks) to manage complex global states (Auth, Catalog, Player).
- **Admin Dashboard**: Comprehensive control panel featuring analytics (via **Recharts**), server resource tracking, and queue monitoring.

---

## 🛠️ Tech Stack & Libraries

### **Frontend**

- **React 18** (Vite) - Core framework for fast rendering.
- **Redux Toolkit** - Centralized state management for users, anime catalogs, and watch history.
- **TailwindCSS** - Utility-first styling for a beautiful, responsive layout.
- **HLS.js** - For parsing and streaming `.m3u8` video playlists.
- **React Router DOM** - For seamless SPA navigation.
- **Lucide React** - Clean and modern SVG iconography.
- **Axios** - For robust HTTP requests.
- **Socket.io-client** - Real-time websocket connection for dashboard analytics and encode progress.

### **Backend**

- **Node.js & Express.js** - High-performance server environment.
- **MongoDB (Mongoose)** - NoSQL database for flexible data modeling (Anime, Episodes, Users).
- **Redis & BullMQ** - Robust background job queue for processing heavy FFmpeg tasks.
- **Fluent-FFmpeg** - A Node.js wrapper around FFmpeg to transcode videos into multi-bitrate HLS segments.
- **@aws-sdk/client-s3** - For uploading video chunks to Cloudflare R2 object storage.
- **@consumet/extensions** - Native web-scraping library for bulk fetching episode links directly on the backend.
- **Socket.io** - Real-time bi-directional communication.

---

## ⚙️ Backend Architecture

The backend is designed using an event-driven, queue-based architecture to handle heavy computational tasks (like video encoding) without slowing down the main API thread.

1. **RESTful API**: Clean architecture separating Controllers, Services, and Routes.
2. **Video Processing Pipeline**:
   - When a user uploads a video via "Local Encode", the file is saved temporarily.
   - A job is added to **BullMQ** (backed by Redis).
   - A background worker picks up the job and uses **FFmpeg** to convert the video into 3 resolutions (1080p, 720p, 480p) and generates a master `.m3u8` playlist.
   - Progress is emitted via **Socket.io** back to the admin frontend.
   - Once completed, the files are streamed to **Cloudflare R2** and local temp files are deleted.
3. **Automated Fetching**: Uses `@consumet/extensions` natively to bypass rate limits and fetch streaming sources directly from providers.
4. **Authentication**: Secured using **JWT** (JSON Web Tokens) and **Bcrypt** for password hashing.

---

## 🧠 Frontend & State Management (Redux)

The frontend is structured to be highly maintainable. **Redux Toolkit** is utilized to handle complex global state effortlessly.

- **`authSlice`**: Manages user sessions, JWT tokens, and role-based access (Admin vs User).
- **`animeSlice`**: Caches the main anime catalog, search results, and trending lists to reduce unnecessary API calls.
- **`episodeSlice`**: Manages the currently playing episode data, skip times (Intro/Outro), and source URLs.
- **`historySlice`**: Tracks user watch history and timestamps to resume playback exactly where they left off.

Each slice is paired with dedicated Redux Thunks or RTK Query for asynchronous API communication.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB instance
- Redis Server (Running locally or via Docker)
- FFmpeg installed on your machine/server

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/anime-platform.git
   cd anime-platform
   ```

2. **Install Backend Dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Variables**
   Create a `.env` file in the `backend` directory:

   ```env
   PORT=4000
   MONGO_URI=your_mongodb_uri
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   JWT_SECRET=your_super_secret_key
   R2_ENDPOINT=your_cloudflare_r2_endpoint
   R2_ACCESS_KEY_ID=your_access_key
   R2_SECRET_ACCESS_KEY=your_secret_key
   R2_BUCKET_NAME=your_bucket_name
   ```

5. **Run the Application**
   Open two terminals:

   _Terminal 1 (Backend)_

   ```bash
   cd backend
   npm run dev
   ```

   _Terminal 2 (Frontend)_

   ```bash
   cd frontend
   npm run dev
   ```

---

<div align="center">
  <i>Built with ❤️ for Anime Lovers</i>
</div>
