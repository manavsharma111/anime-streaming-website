# 🎬 NEWTUBE - Advanced Anime Streaming Platform

NEWTUBE is a high-end, dynamic anime streaming platform (similar to Crunchyroll) designed to handle and stream large muxed `.mkv` and `.mp4` video files. The platform features an advanced video processing pipeline that supports multiple embedded audio tracks (e.g., Japanese, English, Hindi Dubs) and soft subtitles, delivering a seamless HLS (HTTP Live Streaming) experience to users.

## ✨ Features

- **High-Quality Video Streaming:** Stream anime in various resolutions (1080p, 720p, 480p) using HLS.
- **Multi-Audio Support:** Seamlessly switch between multiple audio tracks (Dubs) extracted from the original video files.
- **Soft Subtitles:** Support for embedded soft subtitles toggled directly in the player.
- **Advanced Video Processing:** Asynchronous video transcoding and processing pipeline using BullMQ and FFmpeg.
- **Real-Time Interactions:** WebSockets integration for real-time notifications and updates.
- **Stunning UI/UX:** A visually rich frontend built with React, Tailwind CSS, and smooth animations using Framer Motion and GSAP.
- **Admin Dashboard:** Comprehensive dashboard for managing content, viewing analytics (via Recharts), and monitoring background jobs.

---

## 🏗️ Backend Architecture

The backend is built for scalability and heavy media processing, utilizing a microservices-like approach for background jobs:

1. **Core API (Node.js & Express):** Handles user authentication, content management, and API routing.
2. **Database (MongoDB):** Stores user data, video metadata, and application state (using Mongoose).
3. **Message Broker & Queue (Redis + BullMQ):** Offloads heavy video processing tasks to background workers, ensuring the main API remains responsive.
4. **Video Processing Pipeline (FFmpeg):** 
   - Uses `fluent-ffmpeg` to transcode uploaded `.mkv`/`.mp4` files into HLS format.
   - Intelligently maps all audio streams (`-map 0:a`) and subtitle streams (`-map 0:s?`) to prevent dropping alternative language dubs.
   - Generates optimized MP4 files for download using Constant Rate Factor (`-crf`) and specific encoding presets.
5. **Storage (AWS S3):** Scalable cloud storage for the transcoded video segments and original files.
6. **Real-time Engine (Socket.io):** Pushes live updates about video processing status and platform events to the client.

---

## 📦 Tech Stack & Libraries

### 💻 Frontend
- **Framework:** React 18 (Bootstrapped with Vite)
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`), React Redux
- **Styling:** Tailwind CSS (v4), `clsx`, `tailwind-merge`
- **Animations:** Framer Motion, GSAP
- **Smooth Scrolling:** Lenis (`@studio-freight/lenis`)
- **Video Player:** `hls.js` (For handling HLS streams and multiple audio tracks)
- **Routing:** React Router DOM
- **Icons:** Lucide React
- **Data Fetching:** Axios
- **Charts & Analytics:** Recharts
- **Real-time:** Socket.io-client

### ⚙️ Backend
- **Server:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Caching & Queues:** Redis (ioredis), BullMQ
- **Video Processing:** `ffmpeg-static`, `ffprobe-static`, `fluent-ffmpeg`
- **Cloud Storage:** `@aws-sdk/client-s3`
- **Authentication:** `jsonwebtoken`, `bcryptjs`
- **File Uploads:** Multer
- **Real-time Communication:** Socket.io
- **Security & Utilities:** CORS, Cookie Parser, Dotenv

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB instance
- Redis server
- FFmpeg installed locally or provided via static packages.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/NEWTUBE.git
   cd NEWTUBE
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Variables:**
   Create `.env` files in both `/backend` and `/frontend` directories with your respective database URIs, JWT secrets, and AWS credentials.

5. **Run the Application:**
   - **Backend:** `npm run dev` (Runs on port 5000)
   - **Frontend:** `npm run dev` (Runs on port 5173)

---

## ⚠️ Important Video Processing Guidelines

When contributing to the backend video processing logic:
- **Audio/Subtitle Drop Issue:** Never use `-var_stream_map` with hardcoded single audio streams. Always map all streams using `-map 0:a` and `-map 0:s?`.
- **Download Compression:** When generating downloadable MP4s, do not rely solely on resolution flags. Use Constant Rate Factor (`-crf 22-26`), `-preset fast`, and explicitly map all audio channels to retain dual-audio functionality.

---
*Built with passion for Anime lovers.* 🎌
