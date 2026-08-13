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

      // Create isolated resolution folders for HLS variants
      // FFmpeg 4.0.2 does not support 'name:' in var_stream_map, so %v resolves to 0, 1, 2, 3, etc.
      const resolutions = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
      resolutions.forEach((res) => {
        if (!fs.existsSync(path.join(streamDir, res)))
          fs.mkdirSync(path.join(streamDir, res), { recursive: true })
      })

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

      // Extract subtitles if any text-based subs exist
      let extractedSubs = []
      if (streamCounts.subStreams.length > 0) {
        const subsDir = path.join(outputDir, "subtitles")
        if (!fs.existsSync(subsDir)) fs.mkdirSync(subsDir, { recursive: true })

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
        // 1. HLS 1080p Task
        let audioMaps = []
        if (streamCounts.aCount > 0) {
          streamCounts.audioStreams.forEach(a => audioMaps.push(`-map 0:${a.index}`))
        }
        
        let baseHlsOptions = [
          "-c:v libx264", "-profile:v main", "-pix_fmt yuv420p", "-preset ultrafast", "-threads 2",
          "-g 48", "-keyint_min 48", "-sc_threshold 0",
          "-c:a", "aac", "-ar", "48000", "-ac", "2", "-b:a", "128k",
          "-f", "hls", "-hls_time", "6", "-hls_playlist_type", "vod"
        ]

        const hls1080Cmd = ffmpeg().input(inputPath)
        hls1080Cmd.output(path.join(streamDir, "0/manifest.m3u8")).outputOptions([
          "-map 0:v:0", ...audioMaps,
          "-s:v:0 1920x1080", "-b:v:0 3000k", ...baseHlsOptions,
          "-hls_segment_filename", path.join(streamDir, "0/segment%03d.ts")
        ])
        await runFfmpegCommand(hls1080Cmd, "HLS 1080p", 0.15, overallProgress)
        overallProgress.base += 15

        // 2. HLS 720p Task
        const hls720Cmd = ffmpeg().input(inputPath)
        hls720Cmd.output(path.join(streamDir, "1/manifest.m3u8")).outputOptions([
          "-map 0:v:0", ...audioMaps,
          "-s:v:0 1280x720", "-b:v:0 1500k", ...baseHlsOptions,
          "-hls_segment_filename", path.join(streamDir, "1/segment%03d.ts")
        ])
        await runFfmpegCommand(hls720Cmd, "HLS 720p", 0.15, overallProgress)
        overallProgress.base += 15
        
        // 3. HLS 480p Task
        const hls480Cmd = ffmpeg().input(inputPath)
        hls480Cmd.output(path.join(streamDir, "2/manifest.m3u8")).outputOptions([
          "-map 0:v:0", ...audioMaps,
          "-s:v:0 854x480", "-b:v:0 800k", ...baseHlsOptions,
          "-hls_segment_filename", path.join(streamDir, "2/segment%03d.ts")
        ])
        await runFfmpegCommand(hls480Cmd, "HLS 480p", 0.10, overallProgress)
        overallProgress.base += 10

        // Manually write master.m3u8
        let masterPlaylist = "#EXTM3U\n"
        masterPlaylist += "#EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1920x1080\n0/manifest.m3u8\n"
        masterPlaylist += "#EXT-X-STREAM-INF:BANDWIDTH=1500000,RESOLUTION=1280x720\n1/manifest.m3u8\n"
        masterPlaylist += "#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=854x480\n2/manifest.m3u8\n"
        fs.writeFileSync(path.join(streamDir, "master.m3u8"), masterPlaylist)


        // 4. 1080p MP4 Task
        const mp41080Cmd = ffmpeg().input(inputPath)
        mp41080Cmd
          .output(path.join(downloadDir, "1080p.mp4"))
          .outputOptions([
            "-map 0:v:0", "-map 0:a?",
            "-c:v libx264", "-profile:v main", "-pix_fmt yuv420p", "-crf 22", "-preset ultrafast", "-threads 2",
            "-c:a", "aac", "-ar", "48000", "-ac", "2", "-s 1920x1080",
          ])
        await runFfmpegCommand(mp41080Cmd, "MP4 1080p", 0.20, overallProgress)
        overallProgress.base += 20
        
        // 5. 720p MP4 Task
        const mp4720Cmd = ffmpeg().input(inputPath)
        mp4720Cmd
          .output(path.join(downloadDir, "720p.mp4"))
          .outputOptions([
            "-map 0:v:0", "-map 0:a?",
            "-c:v libx264", "-profile:v main", "-pix_fmt yuv420p", "-crf 24", "-preset ultrafast", "-threads 2",
            "-c:a", "aac", "-ar", "48000", "-ac", "2", "-s 1280x720",
          ])
        await runFfmpegCommand(mp4720Cmd, "MP4 720p", 0.20, overallProgress)
        overallProgress.base += 20
        
        // 6. 480p MP4 Task
        const mp4480Cmd = ffmpeg().input(inputPath)
        mp4480Cmd
          .output(path.join(downloadDir, "480p.mp4"))
          .outputOptions([
            "-map 0:v:0", "-map 0:a?",
            "-c:v libx264", "-profile:v main", "-pix_fmt yuv420p", "-crf 26", "-preset ultrafast", "-threads 2",
            "-c:a", "aac", "-ar", "48000", "-ac", "2", "-s 854x480",
          ])
        await runFfmpegCommand(mp4480Cmd, "MP4 480p", 0.15, overallProgress)
        overallProgress.base += 15

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
