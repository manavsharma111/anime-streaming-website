const fs = require("fs")
const path = require("path")

// Helper to format float seconds into HH:MM:SS.mmm for WebVTT
function formatVttTimestamp(totalSeconds) {
  const pad = (num, size) => String(num).padStart(size, "0")
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = Math.floor(totalSeconds % 60)
  const ms = Math.floor((totalSeconds % 1) * 1000)
  return `${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)}.${pad(ms, 3)}`
}

// Convert transcript chunks into standard WebVTT cue format
function segmentsToWebVTT(segments) {
  let vtt = "WEBVTT\n\n"
  segments.forEach((seg, idx) => {
    const start = formatVttTimestamp(seg.start || 0)
    const end = formatVttTimestamp(seg.end || seg.start + 2)
    const text = (seg.text || "").trim()
    if (text) {
      vtt += `${idx + 1}\n`
      vtt += `${start} --> ${end}\n`
      vtt += `${text}\n\n`
    }
  })
  return vtt
}

// 1. Try Groq Whisper (Fastest, whisper-large-v3)
async function transcribeWithGroq(audioPath, apiKey) {
  const fileBuffer = fs.readFileSync(audioPath)
  const blob = new Blob([fileBuffer], { type: "audio/wav" })
  const formData = new FormData()
  formData.append("file", blob, path.basename(audioPath))
  formData.append("model", "whisper-large-v3")
  formData.append("response_format", "verbose_json")

  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq HTTP ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.segments || []
}

// 2. Try OpenAI Whisper (whisper-1 fallback)
async function transcribeWithOpenAI(audioPath, apiKey) {
  const fileBuffer = fs.readFileSync(audioPath)
  const blob = new Blob([fileBuffer], { type: "audio/wav" })
  const formData = new FormData()
  formData.append("file", blob, path.basename(audioPath))
  formData.append("model", "whisper-1")
  formData.append("response_format", "verbose_json")

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI HTTP ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.segments || []
}

// 3. Try Google Gemini (Multimodal Audio Understanding fallback)
async function transcribeWithGemini(audioPath, apiKey) {
  const fileBuffer = fs.readFileSync(audioPath)
  const base64Audio = fileBuffer.toString("base64")

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
  const bodyPayload = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: "audio/wav",
              data: base64Audio,
            },
          },
          {
            text: "Transcribe the spoken dialogue in this audio into clean WebVTT subtitle format. Include accurate timestamps (HH:MM:SS.mmm --> HH:MM:SS.mmm). Output ONLY the raw WebVTT content starting with 'WEBVTT' without any markdown fences, explanations, or commentary.",
          },
        ],
      },
    ],
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyPayload),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini HTTP ${res.status}: ${err}`)
  }

  const data = await res.json()
  const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!candidate) throw new Error("Gemini returned empty transcription text")

  // Strip any accidental markdown formatting
  let cleanVtt = candidate.replace(/```(?:webvtt|vtt)?/gi, "").replace(/```/g, "").trim()
  if (!cleanVtt.startsWith("WEBVTT")) {
    cleanVtt = "WEBVTT\n\n" + cleanVtt
  }
  return cleanVtt
}

// Cascading Multi-Provider Transcription Engine (Groq -> OpenAI -> Gemini)
async function generateWhisperSubtitles(audioPath, outputVttPath) {
  try {
    if (!fs.existsSync(audioPath)) {
      console.warn(`[Subtitle Engine] Audio file not found: ${audioPath}`)
      return false
    }

    const groqKey = process.env.GROQ_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API
    const geminiKey = process.env.GEMINI_API_KEY

    // Tier 1: Try Groq Whisper (Fastest)
    if (groqKey) {
      try {
        console.log("[Subtitle Engine] Attempting Tier 1: Groq (whisper-large-v3)...")
        const segments = await transcribeWithGroq(audioPath, groqKey)
        if (segments && segments.length > 0) {
          const vttContent = segmentsToWebVTT(segments)
          fs.writeFileSync(outputVttPath, vttContent, "utf8")
          console.log(`[Subtitle Engine] Groq success: ${segments.length} dialogue lines saved.`)
          return true
        }
      } catch (groqErr) {
        console.warn(`[Subtitle Fallback] Groq failed: ${groqErr.message}. Cascading to Tier 2...`)
      }
    }

    // Tier 2: Try OpenAI Whisper (Industry Standard)
    if (openaiKey) {
      try {
        console.log("[Subtitle Engine] Attempting Tier 2: OpenAI (whisper-1)...")
        const segments = await transcribeWithOpenAI(audioPath, openaiKey)
        if (segments && segments.length > 0) {
          const vttContent = segmentsToWebVTT(segments)
          fs.writeFileSync(outputVttPath, vttContent, "utf8")
          console.log(`[Subtitle Engine] OpenAI success: ${segments.length} dialogue lines saved.`)
          return true
        }
      } catch (openaiErr) {
        console.warn(`[Subtitle Fallback] OpenAI failed: ${openaiErr.message}. Cascading to Tier 3...`)
      }
    }

    // Tier 3: Try Google Gemini (Multimodal Native Audio)
    if (geminiKey) {
      try {
        console.log("[Subtitle Engine] Attempting Tier 3: Google Gemini (gemini-1.5-flash audio)...")
        const rawVtt = await transcribeWithGemini(audioPath, geminiKey)
        if (rawVtt && rawVtt.length > 10) {
          fs.writeFileSync(outputVttPath, rawVtt, "utf8")
          console.log("[Subtitle Engine] Gemini success: Generated WebVTT subtitle.")
          return true
        }
      } catch (geminiErr) {
        console.warn(`[Subtitle Fallback] Gemini failed: ${geminiErr.message}`)
      }
    }

    console.warn("[Subtitle Engine] All transcription providers exhausted or unconfigured.")
    return false
  } catch (error) {
    console.error("[Subtitle Engine] Unexpected failure in subtitle pipeline:", error.message)
    return false
  }
}

module.exports = {
  generateWhisperSubtitles,
  formatVttTimestamp,
  segmentsToWebVTT,
}
