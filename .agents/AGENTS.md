# FFmpeg & HLS Multi-Audio Processing Architecture

**Critical Context for Video Processing and Transcoding**:
This project is a high-end dynamic anime streaming platform (similar to Crunchyroll) which processes large muxed `.mkv` or `.mp4` video files containing multiple embedded audio tracks (e.g., Japanese, English, Hindi Dubs) and soft subtitles using Node.js, Express, BullMQ, Redis, Fluent-FFmpeg, and HLS (hls.js on the React frontend).

**Whenever modifying controllers, services, or models related to video processing, adhere to these strict rules**:

1. **Audio/Subtitle Drop Issue (HLS Transcoding)**:
   - **DO NOT** use `-var_stream_map` with hardcoded single audio streams (e.g., `v:0,a:0 v:1,a:0`) as it drops all other embedded audio tracks (a:1, a:2, etc.).
   - **INSTEAD**, you must map all streams using `-map 0:a` and `-map 0:s?` globally.
   - Let FFmpeg intelligently pass audio matrices by using `-select_streams v,a,s`.

2. **Download Compression Issue (MP4 Generation)**:
   - When generating downloadable MP4s (1080p, 720p, 480p), **DO NOT** rely solely on the `-s` resolution flag, as it fails to properly compress files if the original bitrate is too high.
   - **INSTEAD**, you must explicitly force Constant Rate Factor (`-crf 22-26`) and encoding presets (`-preset fast`).
   - You must also map all audio channels (`-map 0:a`) so the downloaded file is compressed but retains all dual-audio language toggles.
