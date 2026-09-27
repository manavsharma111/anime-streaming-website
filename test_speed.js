const { processAnimeVideo } = require('./backend/services/ffmpegService.js');
const ffmpegStatic = require('@ffmpeg-installer/ffmpeg');
const path = require('path');
const fs = require('fs');

async function test() {
    const inputPath = path.join(__dirname, 'test.mkv');
    const outputDir = path.join(__dirname, 'test_output', 'processed', 'test1234');
    
    // Cleanup old output
    if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true, force: true });
    }
    
    console.log("Starting processing...");
    const start = Date.now();
    
    // We pass null for job since we don't have BullMQ context here
    await processAnimeVideo(ffmpegStatic.path, inputPath, [], [], outputDir, null);
    
    const end = Date.now();
    console.log(`Processing took ${(end - start) / 1000} seconds`);
}

test().catch(console.error);
