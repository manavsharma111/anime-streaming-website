require('dotenv').config();
const { s3Client, ListObjectsV2Command, PutObjectCommand } = require("./config/s3");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const streamToString = (stream) => new Promise((resolve, reject) => {
  const chunks = [];
  stream.on("data", (chunk) => chunks.push(chunk));
  stream.on("error", reject);
  stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
});

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET;

async function fixR2Files() {
  if (!BUCKET) {
    console.error("No R2 bucket configured in .env!");
    return;
  }
  
  console.log(`Scanning R2 Bucket: ${BUCKET} for master.m3u8 files...`);
  
  let continuationToken = undefined;
  let allMasterKeys = [];
  
  do {
    const listCmd = new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: "uploads/processed/",
      ContinuationToken: continuationToken
    });
    
    const res = await s3Client.send(listCmd);
    if (res.Contents) {
      for (const obj of res.Contents) {
        if (obj.Key.endsWith("master.m3u8")) {
          allMasterKeys.push(obj.Key);
        }
      }
    }
    continuationToken = res.NextContinuationToken;
  } while (continuationToken);

  console.log(`Found ${allMasterKeys.length} master.m3u8 files.`);
  
  for (const key of allMasterKeys) {
    try {
      console.log(`Fixing: ${key}`);
      const getCmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
      const getRes = await s3Client.send(getCmd);
      let content = await streamToString(getRes.Body);
      let originalContent = content;
      
      const lines = content.split('\n');
      let newLines = [];
      let hasDefaultAudio = false;
      let skipNextLine = false;

      for (let i = 0; i < lines.length; i++) {
        if (skipNextLine) {
          skipNextLine = false;
          continue;
        }
        let line = lines[i];

        // Fix default audio flag
        if (line.includes('#EXT-X-MEDIA:TYPE=AUDIO')) {
          if (!hasDefaultAudio && line.includes('DEFAULT=YES')) {
            hasDefaultAudio = true;
          } else if (hasDefaultAudio && line.includes('DEFAULT=YES')) {
            line = line.replace('DEFAULT=YES', 'DEFAULT=NO');
          } else if (!hasDefaultAudio && line.includes('DEFAULT=NO')) {
             line = line.replace('DEFAULT=NO', 'DEFAULT=YES');
             hasDefaultAudio = true;
          }
          newLines.push(line);
          continue;
        }

        // Fix EXT-X-STREAM-INF
        if (line.startsWith('#EXT-X-STREAM-INF:')) {
          const nextLine = lines[i + 1] || "";
          
          if (nextLine.toLowerCase().includes('audio') && !nextLine.toLowerCase().includes('1080') && !nextLine.toLowerCase().includes('720') && !nextLine.toLowerCase().includes('480')) {
            skipNextLine = true;
            continue;
          }

          line = line.replace(/,mp4a\.40\.2/g, '').replace(/mp4a\.40\.2,/g, '').replace(/mp4a\.40\.2/g, '');
          newLines.push(line);
          continue;
        }
        newLines.push(line);
      }
      
      content = newLines.join('\n');
      
      if (content !== originalContent) {
        console.log(`  -> Changes detected. Uploading fixed file...`);
        const putCmd = new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: Buffer.from(content, 'utf8'),
          ContentType: 'application/vnd.apple.mpegurl'
        });
        await s3Client.send(putCmd);
        console.log(`  -> Fixed successfully.`);
      } else {
        console.log(`  -> File is already correct.`);
      }
    } catch (err) {
      console.error(`  -> Failed to fix ${key}:`, err.message);
    }
  }
  
  console.log("All done!");
}

fixR2Files();
