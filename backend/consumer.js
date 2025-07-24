require('dotenv').config();
const amqp = require("amqplib");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");

const QUEUE_NAME = "web_to_pdf";

// ☁️ Configure MinIO with a single endpoint
const s3 = new AWS.S3({
  accessKeyId: process.env.MINIO_ACCESS_KEY,
  secretAccessKey: process.env.MINIO_SECRET_KEY,
  endpoint: new AWS.Endpoint(process.env.MINIO_ENDPOINT),
  region: process.env.MINIO_REGION,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
  sslEnabled: false,
});

// 📂 Create output folder if it doesn't exist
const outputDir = path.join(__dirname, "pdfs");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// 🔁 Retry RabbitMQ connection
const connectToRabbitMQ = async (retries = 10, delay = 5000) => {
  for (let i = 1; i <= retries; i++) {
    try {
      const connection = await amqp.connect("amqp://rabbitmq");
      const channel = await connection.createChannel();
      await channel.assertQueue(QUEUE_NAME, { durable: true });
      console.log(`📡 Connected to RabbitMQ (attempt ${i})`);
      return channel;
    } catch (err) {
      console.log(`⏳ Retry ${i}/${retries}: RabbitMQ not ready (${err.message})`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw new Error("❌ Failed to connect to RabbitMQ after retries.");
};

// ✅ Ensure MinIO bucket exists
const ensureBucketExists = async () => {
  try {
    const { Buckets } = await s3.listBuckets().promise();
    const exists = Buckets.some(b => b.Name === process.env.MINIO_BUCKET);

    if (!exists) {
      await s3.createBucket({ Bucket: process.env.MINIO_BUCKET }).promise();
      console.log(`✅ Created bucket: ${process.env.MINIO_BUCKET}`);
    } else {
      console.log(`✅ Bucket exists: ${process.env.MINIO_BUCKET}`);
    }
  } catch (err) {
    console.error("❌ Bucket check error:", err.message || err);
  }
};

// 🚀 Start message consumer
(async () => {
  try {
    const channel = await connectToRabbitMQ();
    await ensureBucketExists();

    console.log(`👂 Listening to queue: ${QUEUE_NAME}`);

    channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (!msg) return;

        const { url, fileName } = JSON.parse(msg.content.toString());
        console.log(`🧾 Generating PDF for: ${url}`);

        try {
          const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true,
          });

          const page = await browser.newPage();
          await page.goto(url, { waitUntil: "networkidle0" });

          const filePath = path.join(outputDir, fileName);
          await page.pdf({ path: filePath, format: "A4" });
          await browser.close();

          const fileContent = fs.readFileSync(filePath);

          await s3.upload({
            Bucket: process.env.MINIO_BUCKET,
            Key: fileName,
            Body: fileContent,
            ContentType: "application/pdf",
          }).promise();

          fs.unlinkSync(filePath);
          console.log(`✅ Uploaded and cleaned: ${fileName}`);
          channel.ack(msg);
        } catch (err) {
          console.error(`❌ Failed to process ${url}:`, err.message || err);
          channel.nack(msg, false, false); // discard failed job
        }
      },
      { noAck: false }
    );
  } catch (err) {
    console.error("❌ Consumer failed to start:", err.message || err);
  }
})();
