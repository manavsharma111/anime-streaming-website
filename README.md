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

## ✨ Key Features

- **🎬 Adaptive HLS Video Player**: Custom-built video player using `hls.js` with quality selection, playback speed controls, and auto-skip capabilities for intros/outros.
- **⚡ Dual-Mode Episode Uploads**:
  - **Direct/Bulk Link**: Instantly fetch episodes and skip-times via native Consumet Extensions & Jikan API.
  - **Local Encode**: Upload raw video files, which are processed by FFmpeg in the background into M3U8 HLS format.
- **⚙️ Message Queues**: Background video transcoding managed by **BullMQ** & **Redis** to prevent server blocking.
- **🔄 Real-Time Updates**: Live transcoding progress tracking sent to the Admin Dashboard via **Socket.io**.
- **☁️ Cloud Storage**: Seamlessly uploads processed video chunks to **Cloudflare R2 / AWS S3**.
- **🎨 Premium UI/UX**: Built with **TailwindCSS**, featuring micro-animations, sleek dark mode, and responsive design.

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
