const fs = require("fs/promises")
const path = require("path")
const { s3Client, PutObjectCommand } = require("../config/s3")

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET

// Quick mime-type mapping for HLS and media files
const getContentType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase()
  switch (ext) {
    case ".m3u8":
      return "application/vnd.apple.mpegurl"
    case ".ts":
      return "video/MP2T"
    case ".mp4":
      return "video/mp4"
    case ".vtt":
      return "text/vtt"
    case ".jpg":
    case ".jpeg":
      return "image/jpeg"
    case ".png":
      return "image/png"
    case ".webp":
      return "image/webp"
    case ".json":
      return "application/json"
    default:
      return "application/octet-stream"
  }
}

// Helper to recursively get all files in a directory
const getAllFiles = async (dirPath, arrayOfFiles = []) => {
  const files = await fs.readdir(dirPath)

  for (const file of files) {
    const fullPath = path.join(dirPath, file)
    const stat = await fs.stat(fullPath)
    if (stat.isDirectory()) {
      arrayOfFiles = await getAllFiles(fullPath, arrayOfFiles)
    } else {
      arrayOfFiles.push(fullPath)
    }
  }
  return arrayOfFiles
}
// upload file to r2
const uploadFileToR2 = async (localFilePath, s3Key) => {
  let fileBuffer = await fs.readFile(localFilePath)
  if (localFilePath.endsWith('.m3u8')) {
    let content = fileBuffer.toString('utf8')
    content = content.replace(/\\/g, '/')
    
    // Fix FFmpeg creating video variants for audio tracks
    if (localFilePath.endsWith('master.m3u8')) {
      // Strip erroneous video streams that point to audio directories
      content = content.replace(/#EXT-X-STREAM-INF:.*?[\r\n]+(?!(?:1080p|720p|480p)\/manifest\.m3u8)[^\r\n]+\/manifest\.m3u8[\r\n]*/g, '')
      
      // Fix audio track names (FFmpeg hardcodes them as audio_X)
      // Extract the language code from the URI (e.g. URI="hin/manifest.m3u8") and use it as the NAME
      content = content.replace(/NAME="audio_\d+"(.*?)URI="([a-zA-Z0-9_-]+)\/manifest\.m3u8"/g, 'NAME="$2"$1URI="$2/manifest.m3u8"')
    }
    
    fileBuffer = Buffer.from(content, 'utf8')
  }
  const contentType = getContentType(localFilePath)

  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET,
    Key: s3Key,
    Body: fileBuffer,
    ContentType: contentType,
  })

  return s3Client.send(command)
}
// upload directory to r2
const uploadDirectoryToR2 = async (localDir, s3Prefix) => {
  try {
    console.log(
      `[R2Upload] Starting upload for directory: ${localDir} to prefix: ${s3Prefix}`,
    )
    const files = await getAllFiles(localDir)
    console.log(`[R2Upload] Found ${files.length} files to upload.`)

    // Upload in batches of 20 to avoid overwhelming network/memory
    const BATCH_SIZE = 100
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE)
      const uploadPromises = batch.map((file) => {
        // Calculate the S3 key relative to the localDir
        const relativePath = path.relative(localDir, file)
        // Replace Windows backslashes with forward slashes for S3 keys
        const s3Key = path.posix.join(
          s3Prefix,
          relativePath.split(path.sep).join("/"),
        )

        return uploadFileToR2(file, s3Key)
          .then(() => {
            console.log(`[R2Upload] Uploaded ${s3Key}`)
          })
          .catch((err) => {
            console.error(`[R2Upload] Error uploading ${file}:`, err)
            throw err
          })
      })

      await Promise.all(uploadPromises)
      console.log(
        `[R2Upload] Batch complete. Uploaded ${Math.min(i + BATCH_SIZE, files.length)} / ${files.length} files...`,
      )
    }

    console.log(`[R2Upload] Successfully uploaded all files to R2.`)
    return true
  } catch (error) {
    console.error(`[R2Upload] Critical error during upload:`, error)
    return false
  }
}

module.exports = { uploadDirectoryToR2 }
