const fs = require('fs');
const path = require('path');

const processedDir = path.join(__dirname, '../uploads/processed');

if (!fs.existsSync(processedDir)) {
  console.log('Processed directory not found.');
  process.exit(0);
}

const episodes = fs.readdirSync(processedDir);

let fixedCount = 0;

for (const episode of episodes) {
  const masterPath = path.join(processedDir, episode, 'streaming', 'master.m3u8');
  if (fs.existsSync(masterPath)) {
    let content = fs.readFileSync(masterPath, 'utf8');
    let originalContent = content;

    // 1. Replace backslashes with forward slashes
    content = content.replace(/\\/g, '/');

    // 2. Fix multiple DEFAULT=YES for audio tracks
    // Split into lines
    const lines = content.split('\n');
    let hasDefaultAudio = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('#EXT-X-MEDIA:TYPE=AUDIO')) {
        if (!hasDefaultAudio && lines[i].includes('DEFAULT=YES')) {
          hasDefaultAudio = true; // Keep the first one as YES
        } else if (hasDefaultAudio && lines[i].includes('DEFAULT=YES')) {
          lines[i] = lines[i].replace('DEFAULT=YES', 'DEFAULT=NO');
        } else if (!hasDefaultAudio && lines[i].includes('DEFAULT=NO')) {
           // If we haven't seen a default audio, but found NO, maybe we can change it to YES?
           // Actually, let's just make the first one YES regardless if it was NO.
           lines[i] = lines[i].replace('DEFAULT=NO', 'DEFAULT=YES');
           hasDefaultAudio = true;
        }
      }
    }
    content = lines.join('\n');

    if (content !== originalContent) {
      fs.writeFileSync(masterPath, content, 'utf8');
      console.log(`Fixed master.m3u8 for episode: ${episode}`);
      fixedCount++;
    }
  }
}

console.log(`Done! Fixed ${fixedCount} episodes.`);
