const { execFile } = require("child_process")
const ffprobeStatic = require("@ffprobe-installer/ffprobe")
const ffmpegStatic = require("@ffmpeg-installer/ffmpeg")

// Quick probe to get total video length in seconds
function getVideoDuration(inputPath) {
  return new Promise((resolve) => {
    execFile(
      ffprobeStatic.path,
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        inputPath,
      ],
      (err, stdout) => {
        if (err || !stdout) return resolve(0)
        const duration = parseFloat(stdout.trim())
        resolve(isNaN(duration) ? 0 : duration)
      }
    )
  })
}

// Scans for scene cuts to detect standard 90s anime OP and ED segments
async function detectAnimeSkipTimes(inputPath) {
  try {
    const duration = await getVideoDuration(inputPath)
    if (duration < 300) {
      return null
    }

    console.log(`[Auto-Skip] Checking skip boundaries on ${Math.round(duration)}s video...`)

    // Check first 4.5 mins for opening sequence
    const introCutpoints = await scanTransitionTimestamps(inputPath, 0, 270)
    let detectedIntro = find90SecondSpan(introCutpoints, 15, 240)

    // Fallback heuristic if exact 90s pair wasn't captured
    if (!detectedIntro && introCutpoints.length > 0) {
      const coldOpenCut = introCutpoints.find((t) => t >= 30 && t <= 120)
      if (coldOpenCut) {
        detectedIntro = {
          start: Math.round(coldOpenCut),
          end: Math.round(coldOpenCut + 90),
        }
      }
    }

    // Check ending window for outro sequence
    const outroScanStart = Math.max(0, duration - 240)
    const outroCutpoints = await scanTransitionTimestamps(
      inputPath,
      outroScanStart,
      240,
      outroScanStart
    )
    let detectedOutro = find90SecondSpan(outroCutpoints, outroScanStart, duration - 10)

    if (!detectedOutro && outroCutpoints.length > 0) {
      const endingCut = outroCutpoints.find(
        (t) => t >= duration - 210 && t <= duration - 100
      )
      if (endingCut) {
        detectedOutro = {
          start: Math.round(endingCut),
          end: Math.min(Math.round(duration), Math.round(endingCut + 90)),
        }
      }
    }

    const result = {
      introStart: detectedIntro ? detectedIntro.start : 0,
      introEnd: detectedIntro ? detectedIntro.end : 0,
      outroStart: detectedOutro ? detectedOutro.start : 0,
      outroEnd: detectedOutro ? detectedOutro.end : 0,
      duration: Math.round(duration),
    }

    if (result.introStart > 0 || result.outroStart > 0) {
      console.log(
        `[Auto-Skip] Detected markers -> intro: ${result.introStart}s-${result.introEnd}s, outro: ${result.outroStart}s-${result.outroEnd}s`
      )
      return result
    }

    return null
  } catch (err) {
    console.warn("[Auto-Skip] Detection skipped:", err.message)
    return null
  }
}

// Run ffmpeg blackdetect filter to collect transition timestamps
function scanTransitionTimestamps(inputPath, startTime, scanDuration, baseOffset = 0) {
  return new Promise((resolve) => {
    const args = [
      "-ss",
      String(startTime),
      "-t",
      String(scanDuration),
      "-i",
      inputPath,
      "-vf",
      "blackdetect=d=0.08:pix_th=0.12",
      "-an",
      "-f",
      "null",
      "-",
    ]

    execFile(ffmpegStatic.path, args, { maxBuffer: 1024 * 1024 * 4 }, (err, stdout, stderr) => {
      const output = (stderr || "") + (stdout || "")
      const cuts = []
      const regex = /black_start:([0-9.]+)/g
      let match
      while ((match = regex.exec(output)) !== null) {
        const timeInScan = parseFloat(match[1])
        if (!isNaN(timeInScan)) {
          cuts.push(baseOffset + timeInScan)
        }
      }
      resolve(cuts)
    })
  })
}

// Find two cut points that match the standard ~90s anime OP/ED duration
function find90SecondSpan(cutpoints, minBound, maxBound) {
  for (let i = 0; i < cutpoints.length; i++) {
    const t1 = cutpoints[i]
    if (t1 < minBound || t1 > maxBound) continue

    for (let j = i + 1; j < cutpoints.length; j++) {
      const t2 = cutpoints[j]
      const diff = t2 - t1
      // 87 to 93 seconds tolerance for 90s TV edit
      if (diff >= 87 && diff <= 93) {
        return {
          start: Math.round(t1),
          end: Math.round(t2),
        }
      }
    }
  }
  return null
}

module.exports = {
  detectAnimeSkipTimes,
  getVideoDuration,
}
