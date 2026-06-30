const dotenv = require("dotenv");
dotenv.config();
const { s3Client, PutObjectCommand } = require("./config/s3");

async function test() {
  console.log("Testing R2 upload...");
  console.log("Endpoint:", process.env.CLOUDFLARE_R2_ENDPOINT);
  console.log("Bucket:", process.env.CLOUDFLARE_R2_BUCKET);
  const cmd = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET,
    Key: "test.txt",
    Body: "hello world",
    ContentType: "text/plain"
  });
  
  try {
    const res = await s3Client.send(cmd);
    console.log("Success!");
    process.exit(0);
  } catch (err) {
    console.log("Error:", err);
    process.exit(1);
  }
}
test();
