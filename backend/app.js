require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require("path");
const md5 = require('md5');
const cors = require('cors');
const AWS = require('aws-sdk');
const amqp = require('amqplib');

const app = express();
const port = 3000;
const QUEUE_NAME = 'web_to_pdf';
let channel = null;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Local PDF storage (not used but fallback)
const outputDir = path.join(__dirname, "pdfs");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
app.use("/static", express.static(outputDir));

// ✅ Configure AWS SDK to use MinIO
const s3 = new AWS.S3({
  accessKeyId: process.env.MINIO_ACCESS_KEY,
  secretAccessKey: process.env.MINIO_SECRET_KEY,
  endpoint: new AWS.Endpoint(process.env.MINIO_ENDPOINT),
  region: process.env.MINIO_REGION,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
  sslEnabled: false,
});

// 🐇 Connect to RabbitMQ
const connectToRabbitMQ = async (retries = 30, delay = 5000) => {
  for (let i = 1; i <= retries; i++) {
    try {
      const connection = await amqp.connect('amqp://rabbitmq');
      const ch = await connection.createChannel();
      await ch.assertQueue(QUEUE_NAME, { durable: true });
      console.log("📡 Connected to RabbitMQ");
      return ch;
    } catch (err) {
      console.log(`⏳ Retry ${i}/${retries}: RabbitMQ not ready (${err.message})`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error("❌ Failed to connect to RabbitMQ after retries.");
};

// ☁️ Ensure bucket exists
const ensureBucket = async () => {
  try {
    const buckets = await s3.listBuckets().promise();
    const exists = buckets.Buckets.some(b => b.Name === process.env.MINIO_BUCKET);
    if (!exists) {
      await s3.createBucket({ Bucket: process.env.MINIO_BUCKET }).promise();
      console.log(`✅ Created bucket: ${process.env.MINIO_BUCKET}`);
    } else {
      console.log(`✅ Bucket exists: ${process.env.MINIO_BUCKET}`);
    }
  } catch (err) {
    console.error("❌ MinIO bucket check/create error:", err.message || err);
  }
};

// 🚀 Init
(async () => {
  try {
    channel = await connectToRabbitMQ();
    await ensureBucket();
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Startup error:", err.message || err);
    process.exit(1);
  }
})();

// 📩 Submit PDF generation request
app.post('/v1/pdf/', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).send('❌ Missing "url" field');

  const fileName = `${md5(url)}.pdf`;

  if (!channel) {
    console.error("❌ Channel not ready. Try again later.");
    return res.status(503).send("RabbitMQ not ready. Try again shortly.");
  }

  try {
    const message = { url, fileName };
    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
    console.log(`📩 Job enqueued: ${fileName}`);
    res.json({ pdfName: fileName, status: 'in-progress' });
  } catch (err) {
    console.error("❌ Queueing failed:", err.message || err);
    res.status(500).send("Internal error");
  }
});

// ✅ Check if PDF is ready & generate signed URL
app.get('/v1/check/:pdfName', async (req, res) => {
  const { pdfName } = req.params;

  const params = {
    Bucket: process.env.MINIO_BUCKET,
    Key: pdfName,
  };

  try {
    await s3.headObject(params).promise();

    const signedUrl = s3.getSignedUrl('getObject', {
      Bucket: process.env.MINIO_BUCKET,
      Key: pdfName,
      Expires: 3600,
    });

    res.json({ ready: true, signedUrl });
  } catch (err) {
    if (err.code === 'NotFound' || err.statusCode === 404) {
      return res.json({ ready: false });
    }

    console.error("❌ S3 check error:", err.message || err.code || JSON.stringify(err));
    res.status(500).send('Internal error');
  }
});
