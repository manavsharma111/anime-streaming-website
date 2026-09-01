const fs = require("fs")
const path = require("path")
const ffmpeg = require("fluent-ffmpeg")
const ffmpegStatic = require("@ffmpeg-installer/ffmpeg")
const ffprobeStatic = require("@ffprobe-installer/ffprobe")

// ffmpeg service
const processAnimeVideo = async (
  ffmpegPath,
  inputPath,
  audioPaths,
  subtitlePaths,
  outputDir,
  job,
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const finalFfmpegPath = ffmpegPath || ffmpegStatic.path
      ffmpeg.setFfmpegPath(finalFfmpegPath)
      ffmpeg.setFfprobePath(ffprobeStatic.path)

      if (!fs.existsSync(outputDir))
        fs.mkdirSync(outputDir, { recursive: true })

      const streamDir = path.join(outputDir, "streaming")
      const thumbDir = path.join(outputDir, "thumbnails")
      const downloadDir = path.join(outputDir, "downloads")

      if (!fs.existsSync(streamDir))
        fs.mkdirSync(streamDir, { recursive: true })
      if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true })
      if (!fs.existsSync(downloadDir))
        fs.mkdirSync(downloadDir, { recursive: true })

      // ==========================================
      // STEP 1: INITIAL SETUP & DIRECTORY CREATION
      // ==========================================
      // Create isolated resolution folders for HLS variants
      // FFmpeg 4.0.2 does not support 'name:' in var_stream_map, so %v resolves to 0, 1, 2, 3, etc.
      const resolutions = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "audio_0", "audio_1", "audio_2", "audio_3", "audio_4", "audio_5", "audio_6", "audio_7"]
      resolutions.forEach((res) => {
        if (!fs.existsSync(path.join(streamDir, res)))
          fs.mkdirSync(path.join(streamDir, res), { recursive: true })
      })

      // ==========================================
      // STEP 2: PROBE VIDEO FOR AUDIO & SUBTITLES
      // ==========================================
      // We use ffprobe to analyze the input video file. 
      // This tells us exactly how many audio tracks (e.g., English, Japanese) 
      // and subtitle tracks (e.g., ASS, SRT) are embedded inside the MKV/MP4 file.
      // Probe input to dynamically count audio/subtitle streams
      const streamCounts = await new Promise((res, rej) => {
        ffmpeg.ffprobe(inputPath, (err, metadata) => {
          if (err) return rej(err)
          let aCount = 0
          let sCount = 0
          let subStreams = []
          let audioStreams = []
          metadata.streams.forEach((s) => {
            if (s.codec_type === "audio") {
              aCount++
              audioStreams.push({
                index: s.index,
                lang:
                  s.tags && s.tags.language
                    ? s.tags.language
                    : `Audio${aCount}`,
              })
            }
            if (s.codec_type === "subtitle") {
              sCount++
              // Only keep text-based subtitles for VTT extraction
              if (["subrip", "ass", "ssa", "mov_text"].includes(s.codec_name)) {
                subStreams.push({
                  index: s.index,
                  lang:
                    s.tags && s.tags.language
                      ? s.tags.language
                      : `Track ${sCount}`,
                })
              }
            }
          })
          res({ aCount, sCount, subStreams, audioStreams })
        })
      })

      // ==========================================
      // STEP 3: EXTRACT & CLEAN INTERNAL SUBTITLES
      // ==========================================
      // If the video has built-in text subtitles, we extract them as .vtt files.
      // We also clean out any complex formatting tags (like ASS styling) so they render perfectly on the web player.
      
      // Extract subtitles if any text-based subs exist
      let extractedSubs = []
      
      const subsDir = path.join(outputDir, "subtitles")
      if (streamCounts.subStreams.length > 0 || (subtitlePaths && subtitlePaths.length > 0)) {
        if (!fs.existsSync(subsDir)) fs.mkdirSync(subsDir, { recursive: true })
      }

      if (streamCounts.subStreams.length > 0) {

        await new Promise((resSub, rejSub) => {
          const subCommand = ffmpeg(inputPath)
          console.log(
            `[FFmpeg] Extracting ${streamCounts.subStreams.length} text subtitles... (This may take a few seconds)`,
          )
          streamCounts.subStreams.forEach((sub, i) => {
            const vttPath = path.join(subsDir, `sub_${i}.vtt`)
            subCommand
              .output(vttPath)
              .outputOptions([`-map 0:${sub.index}`, "-c:s webvtt"])

            const folderId = path.basename(outputDir)
            extractedSubs.push({
              lang: sub.lang,
              url: `/uploads/processed/${folderId}/subtitles/sub_${i}.vtt`,
            })
          })
          subCommand
            .on("end", () => {
              console.log(
                `[FFmpeg] Subtitles successfully extracted! Starting video encoding...`,
              )
              // Clean up extracted VTT files to remove ASS formatting tags
              streamCounts.subStreams.forEach((sub, i) => {
                const vttPath = path.join(subsDir, `sub_${i}.vtt`)
                if (fs.existsSync(vttPath)) {
                  let content = fs.readFileSync(vttPath, "utf8")
                  // Remove ASS tags like {\an8}
                  content = content.replace(/\{[^}]+\}/g, "")
                  // Remove HTML-like tags (some players don't support them well)
                  content = content.replace(/<\/?(?:font|b|i|u|c)[^>]*>/g, "")
                  // Fix multiple blank lines
                  content = content.replace(/\n{3,}/g, "\n\n")
                  fs.writeFileSync(vttPath, content, "utf8")
                }
              })
              resSub()
            })
            .on("error", (err) => {
              console.error(
                "[FFmpeg] Subtitle extraction failed, skipping...",
                err.message,
              )
              resSub() // Skip on error so main video doesn't fail
            })
            .run()
        })
      }

      // ==========================================
      // STEP 4: PROCESS EXTERNAL SUBTITLES
      // ==========================================
      // If the admin manually uploaded external subtitle files (e.g., a custom Hindi SRT),
      // we copy them over and clean them just like the internal ones.

      // Process manually uploaded external subtitles
      if (subtitlePaths && subtitlePaths.length > 0) {
        subtitlePaths.forEach((subPath, i) => {
          if (fs.existsSync(subPath)) {
            const newVttPath = path.join(subsDir, `ext_sub_${i}.vtt`)
            fs.copyFileSync(subPath, newVttPath)
            const folderId = path.basename(outputDir)

            // Try to extract language from filename, fallback to generic name
            let lang = `External ${i + 1}`
            const baseName = path.basename(subPath, path.extname(subPath))
            if (baseName.includes("_")) lang = baseName.split("_").pop()
            else if (baseName.includes("-")) lang = baseName.split("-").pop()

            // Also clean external subs just in case
            let content = fs.readFileSync(newVttPath, "utf8")
            content = content.replace(/\{[^}]+\}/g, "").replace(/<\/?(?:font|b|i|u|c)[^>]*>/g, "").replace(/\n{3,}/g, "\n\n")
            fs.writeFileSync(newVttPath, content, "utf8")

            extractedSubs.push({
              lang: lang,
              url: `/uploads/processed/${folderId}/subtitles/ext_sub_${i}.vtt`,
            })
          }
        })
      }

      // Helper function to run an ffmpeg command as a Promise
      const runFfmpegCommand = (cmd, taskName, weight, overallProgress) => {
        return new Promise((res, rej) => {
          let lastLoggedFrame = 0

          cmd
            .on("progress", (p) => {
              let percent = p.percent ? parseFloat(p.percent.toFixed(2)) : 0
              if (percent >= 100) percent = 99.9

              const totalPercent = overallProgress.base + (percent * weight)
              const formattedPercent = parseFloat(totalPercent.toFixed(2))

              let etaStr = "Calculating..."
              if (formattedPercent > 0) {
                const elapsedSec = (Date.now() - overallProgress.startTime) / 1000
                const estimatedTotalSec = elapsedSec / (formattedPercent / 100)
                const remainingSec = Math.max(0, estimatedTotalSec - elapsedSec)
                const mins = Math.floor(remainingSec / 60)
                const secs = Math.floor(remainingSec % 60)
                etaStr = `${mins}m ${secs}s`
              }

              if (p.frames - lastLoggedFrame >= 50 || p.frames < lastLoggedFrame) {
                console.log(`[FFmpeg - ${taskName}] Encoding: ${percent}% | Frames: ${p.frames} | Speed: ${p.currentFps} fps | ETA: ${etaStr}`)
                lastLoggedFrame = p.frames
              }

              if (job && percent > 0) {
                job.updateProgress(formattedPercent)
                if (global.io) {
                  global.io.emit("video_progress", {
                    episodeId: job.data.episodeId,
                    percent: formattedPercent,
                    eta: etaStr,
                    taskName: taskName
                  })
                }
              }
            })
            .on("error", (err, stdout, stderr) => {
              console.error(`❌ FFmpeg pipeline failure [${taskName}]:`, err.message)
              console.error(`[FFmpeg STDERR]:`, stderr)
              // Modify error message so it gets saved in BullMQ and shown on frontend
              err.message = `[${taskName}] ${err.message} | Details: ${stderr ? stderr.substring(stderr.length - 1500) : "No stderr"}`
              rej(err)
            })
            .on("end", () => {
              console.log(`[FFmpeg] Finished task: ${taskName}`)
              res()
            })
            .run()
        })
      }

      let overallProgress = { base: 0, startTime: Date.now() }

      try {
        // ==========================================
        // STEP 5: EXTRACT & ENCODE AUDIO TRACKS
        // ==========================================
        // We separate audio completely from the video stream. This is crucial for multi-language support.
        // It converts each audio track into AAC format and creates its own HLS chunks (`audio_0`, `audio_1`).
        // It processes internal tracks first, then adds any external audio tracks uploaded by the user.
        
        // Audio Tasks
        let audioPlaylists = []
        let audioIndex = 0;

        if (streamCounts.aCount > 0) {
          for (let i = 0; i < streamCounts.audioStreams.length; i++) {
            const a = streamCounts.audioStreams[i];
            const audioCmd = ffmpeg().input(inputPath);
            audioCmd.output(path.join(streamDir, `audio_${audioIndex}/manifest.m3u8`)).outputOptions([
              `-map 0:${a.index}`,
              "-c:a", "aac", "-b:a", "128k", "-ar", "48000", "-ac", "2",
              "-f", "hls", "-hls_time", "6", "-hls_playlist_type", "vod",
              "-hls_segment_filename", path.join(streamDir, `audio_${audioIndex}/segment%03d.ts`)
            ]);
            await runFfmpegCommand(audioCmd, `Audio Track ${audioIndex + 1}`, 0.05, overallProgress);
            overallProgress.base += 5;
            audioPlaylists.push({ id: audioIndex, name: a.lang || `Audio ${audioIndex + 1}` });
            audioIndex++;
          }
        }

        for (let i = 0; i < audioPaths.length; i++) {
          const audioPath = audioPaths[i];
          const audioCmd = ffmpeg().input(audioPath);
          audioCmd.output(path.join(streamDir, `audio_${audioIndex}/manifest.m3u8`)).outputOptions([
            `-map 0:a:0`,
            "-c:a", "aac", "-b:a", "128k", "-ar", "48000", "-ac", "2",
            "-f", "hls", "-hls_time", "6", "-hls_playlist_type", "vod",
            "-hls_segment_filename", path.join(streamDir, `audio_${audioIndex}/segment%03d.ts`)
          ]);
          
          let langName = `Extra Audio ${i + 1}`;
          if (audioPath) {
            const baseName = path.basename(audioPath, path.extname(audioPath)).toLowerCase();
            if (baseName.includes("hin")) langName = "Hindi";
            else if (baseName.includes("eng")) langName = "English";
            else if (baseName.includes("jap") || baseName.includes("jpn")) langName = "Japanese";
            else if (baseName.includes("_")) langName = baseName.split("_").pop();
            else if (baseName.includes("-")) langName = baseName.split("-").pop();
            else langName = baseName; // use full filename if no separator
            
            // capitalize first letter for cleanliness
            langName = langName.charAt(0).toUpperCase() + langName.slice(1);
          }

          await runFfmpegCommand(audioCmd, `Audio: ${langName}`, 0.05, overallProgress);
          overallProgress.base += 5;
          audioPlaylists.push({ id: audioIndex, name: langName });
          audioIndex++;
        }

        let baseHlsOptions = [
          "-c:v libx264", // Use H.264 video codec for maximum compatibility
          "-profile:v main", // Use Main profile for broad device support (older phones/TVs)
          "-pix_fmt yuv420p", // Standard pixel format widely supported by web players
          "-preset ultrafast", // Video transfer and process speed (fastest encoding, larger file size)
          "-threads 2", // Limit to 2 CPU threads to prevent server overload
          "-g 48", // Force a keyframe every 48 frames (Group of Pictures size)
          "-keyint_min 48", // Minimum distance between keyframes
          "-sc_threshold 0", // Disable scene change detection to keep strict and predictable segment times
          "-f", "hls", // Output format as HTTP Live Streaming (HLS)
          "-hls_time", "6", // Duration of each video segment in seconds (6s chunks)
          "-hls_playlist_type", "vod" // Video on Demand playlist type (tells player it's not a live stream)
        ]

        // Adjust remaining weight for video tasks
        let remainingWeight = 100 - overallProgress.base - 5 - 5; // 5 for thumbnails, 5 for mp4s
        let w1080 = (remainingWeight * 0.45) / 100;
        let w720 = (remainingWeight * 0.35) / 100;
        let w480 = (remainingWeight * 0.20) / 100;

        // ==========================================
        // STEP 6: ENCODE VIDEO INTO MULTIPLE RESOLUTIONS
        // ==========================================
        // Now that audio is handled, we process ONLY the video stream (`-map 0:v:0` and `-an` to drop audio).
        // We create 3 different quality tiers (1080p, 720p, 480p) to allow the player to adapt based on internet speed.

        // 1. HLS 1080p Task
        const hls1080Cmd = ffmpeg().input(inputPath)
        hls1080Cmd.output(path.join(streamDir, "0/manifest.m3u8")).outputOptions([
          "-map 0:v:0", // Select only the first video stream from input
          "-an", // Remove audio (audio is processed separately)
          "-s:v:0 1920x1080", // Scale video to 1080p resolution
          "-b:v:0 3000k", // Set video bitrate to 3000 kbps for high quality
          ...baseHlsOptions,
          "-hls_segment_filename", // Naming pattern for the video chunks
          path.join(streamDir, "0/segment%03d.ts")
        ])
        await runFfmpegCommand(hls1080Cmd, "HLS 1080p", w1080, overallProgress)
        overallProgress.base += w1080 * 100

        // 2. HLS 720p Task
        const hls720Cmd = ffmpeg().input(inputPath)
        hls720Cmd.output(path.join(streamDir, "1/manifest.m3u8")).outputOptions([
          "-map 0:v:0", // Select only the first video stream from input
          "-an", // Remove audio
          "-s:v:0 1280x720", // Scale video to 720p resolution
          "-b:v:0 1500k", // Set video bitrate to 1500 kbps for medium quality
          ...baseHlsOptions,
          "-hls_segment_filename", // Naming pattern for the video chunks
          path.join(streamDir, "1/segment%03d.ts")
        ])
        await runFfmpegCommand(hls720Cmd, "HLS 720p", w720, overallProgress)
        overallProgress.base += w720 * 100

        // 3. HLS 480p Task
        const hls480Cmd = ffmpeg().input(inputPath)
        hls480Cmd.output(path.join(streamDir, "2/manifest.m3u8")).outputOptions([
          "-map 0:v:0", // Select only the first video stream from input
          "-an", // Remove audio
          "-s:v:0 854x480", // Scale video to 480p resolution
          "-b:v:0 800k", // Set video bitrate to 800 kbps for data saving
          ...baseHlsOptions,
          "-hls_segment_filename", // Naming pattern for the video chunks
          path.join(streamDir, "2/segment%03d.ts")
        ])
        await runFfmpegCommand(hls480Cmd, "HLS 480p", w480, overallProgress)
        overallProgress.base += w480 * 100

        // ==========================================
        // STEP 7: GENERATE MASTER PLAYLIST
        // ==========================================
        // This is the brain of the HLS stream. `master.m3u8` tells the video player (like Hls.js)
        // what resolutions are available (1080p, 720p, 480p) and what audio tracks it can switch between.
        
        // Manually write master.m3u8
        let masterPlaylist = "#EXTM3U\n"
        if (audioPlaylists.length > 0) {
          audioPlaylists.forEach((ap, idx) => {
            masterPlaylist += `#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",NAME="${ap.name}",DEFAULT=${idx === 0 ? 'YES' : 'NO'},AUTOSELECT=YES,URI="audio_${ap.id}/manifest.m3u8"\n`
          })
        }
        let audioStr = audioPlaylists.length > 0 ? ',AUDIO="audio"' : '';
        masterPlaylist += `#EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1920x1080${audioStr}\n0/manifest.m3u8\n`
        masterPlaylist += `#EXT-X-STREAM-INF:BANDWIDTH=1500000,RESOLUTION=1280x720${audioStr}\n1/manifest.m3u8\n`
        masterPlaylist += `#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=854x480${audioStr}\n2/manifest.m3u8\n`
        fs.writeFileSync(path.join(streamDir, "master.m3u8"), masterPlaylist)


        // ==========================================
        // STEP 8: GENERATE DOWNLOADABLE MP4 FILES
        // ==========================================
        // Since HLS creates hundreds of tiny .ts chunk files, users can't easily download the video.
        // Here, we take the processed HLS streams and mux them back into single .mp4 files 
        // (combining video and the primary audio track) so users can download them for offline viewing.

        // MP4 Tasks
        const setupMp4Cmd = (cmd, manifestPath) => {
          cmd.input(path.join(streamDir, manifestPath))
          if (audioPlaylists.length > 0) {
            cmd.input(path.join(streamDir, "audio_0/manifest.m3u8"))
            cmd.outputOptions(["-c", "copy", "-bsf:a", "aac_adtstoasc", "-map 0:v:0", "-map 1:a:0"])
          } else {
            cmd.outputOptions(["-c", "copy"])
          }
        }

        // 4. 1080p MP4 Task (Lightning Fast Copy from HLS)
        const mp41080Cmd = ffmpeg()
        setupMp4Cmd(mp41080Cmd, "0/manifest.m3u8")
        mp41080Cmd.output(path.join(downloadDir, "1080p.mp4"))
        await runFfmpegCommand(mp41080Cmd, "MP4 1080p", 0.02, overallProgress)
        overallProgress.base += 2

        // 5. 720p MP4 Task (Lightning Fast Copy from HLS)
        const mp4720Cmd = ffmpeg()
        setupMp4Cmd(mp4720Cmd, "1/manifest.m3u8")
        mp4720Cmd.output(path.join(downloadDir, "720p.mp4"))
        await runFfmpegCommand(mp4720Cmd, "MP4 720p", 0.02, overallProgress)
        overallProgress.base += 2

        // 6. 480p MP4 Task (Lightning Fast Copy from HLS)
        const mp4480Cmd = ffmpeg()
        setupMp4Cmd(mp4480Cmd, "2/manifest.m3u8")
        mp4480Cmd.output(path.join(downloadDir, "480p.mp4"))
        await runFfmpegCommand(mp4480Cmd, "MP4 480p", 0.01, overallProgress)
        overallProgress.base += 1

        // ==========================================
        // STEP 9: GENERATE THUMBNAIL SPRITE SHEET
        // ==========================================
        // We capture frames from the video at regular intervals (e.g. 1 frame every 60 seconds).
        // These can be used for thumbnail previews when hovering over the video player scrubber.
        
        // 7. Thumbnails Task
        const thumbCmd = ffmpeg().input(inputPath)
        thumbCmd
          .output(path.join(thumbDir, "thumb_%04d.png"))
          .outputOptions(["-vf fps=1/60", "-vframes 5", "-threads 1"])
        await runFfmpegCommand(thumbCmd, "Thumbnails", 0.05, overallProgress)

        const pathSegments = outputDir.split(path.sep)
        const folderId = pathSegments[pathSegments.indexOf("processed") + 1]
        const baseFolder = `/uploads/processed/${folderId}`

        // Match the Episode.js Schema exactly
        resolve({
          hlsMaster: `${baseFolder}/streaming/master.m3u8`,
          downloads: {
            1080: `${baseFolder}/downloads/1080p.mp4`,
            720: `${baseFolder}/downloads/720p.mp4`,
            480: `${baseFolder}/downloads/480p.mp4`,
          },
          thumbnails: `${baseFolder}/thumbnails/`,
          embeddedSubtitles: extractedSubs,
        })
      } catch (err) {
        reject(err)
      }
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = { processAnimeVideo }
