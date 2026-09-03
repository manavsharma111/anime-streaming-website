const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Aapki sample video file ka path yahan daalein
const inputFile = path.join(__dirname, 'clip_output.mkv'); 
const outputFile = path.join(__dirname, 'output_test.mp4');

// Check karte hain ki sample file exist karti hai ya nahi
if (!fs.existsSync(inputFile)) {
    console.error("❌ Error: 'sample.mp4' file nahi mili!");
    console.log("Please C:\\NEWTUBE folder mein ek 'sample.mp4' naam ki video file daaliye test karne ke liye.");
    process.exit(1);
}

console.log("🚀 Starting FFmpeg Benchmark Test...");
console.time("FFmpeg_Transcode_Time"); // Timer start

// Yeh FFmpeg command hai jise aap test kar rahe hain. Aap isme -preset fast, ultrafast etc change kar sakte hain.
const ffmpegCommand = `ffmpeg -y -i "${inputFile}" -c:v libx264 -preset fast -crf 23 "${outputFile}"`;

console.log(`Running Command: ${ffmpegCommand}`);

exec(ffmpegCommand, (error, stdout, stderr) => {
    if (error) {
        console.error(`❌ Error during processing: ${error.message}`);
        return;
    }
    
    console.log("✅ Video Processing Completed Successfully!");
    
    // Timer stop karega aur exact time print karega
    console.timeEnd("FFmpeg_Transcode_Time"); 
    
    // Test ke baad output file ka size check karna
    if (fs.existsSync(outputFile)) {
        const stats = fs.statSync(outputFile);
        console.log(`Output File Size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
    }
});
