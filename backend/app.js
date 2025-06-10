require('dotenv').config();
const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require("path");
const md5 = require('md5');
const cors = require('cors');
const AWS = require('aws-sdk');

const app = express();
const port = 3000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const outputDir = path.join(__dirname, "pdfs");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}
app.use("/static", express.static(outputDir));

// ✅ Configure MinIO (S3-compatible)
const s3 = new AWS.S3({
  accessKeyId: process.env.MINIO_ACCESS_KEY,
  secretAccessKey: process.env.MINIO_SECRET_KEY,
  endpoint: process.env.MINIO_ENDPOINT,
  region: process.env.MINIO_REGION,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

app.post('/v1/pdf/', (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).send('❌ Missing "url" field');

  const hash = md5(url);
  const outputFile = `${hash}.pdf`;
  const outputPath = path.join(outputDir, outputFile);

  // Delete old file
  if (fs.existsSync(outputPath)) {
    fs.unlinkSync(outputPath);
    console.log('🗑️ Old file deleted:', outputFile);
  }

  const command = `node file1.js "${url}" "${outputPath}"`;

  exec(command, async (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Execution error:', error.message);
      return res.status(500).send('PDF generation failed');
    }

    if (!fs.existsSync(outputPath)) {
      console.error('❌ PDF not found after generation');
      return res.status(500).send('PDF was not generated');
    }

    console.log('✅ PDF generated:', outputFile);

    try {
      // ✅ Upload to MinIO
      const fileContent = fs.readFileSync(outputPath);
      const uploadParams = {
        Bucket: process.env.MINIO_BUCKET,
        Key: outputFile,
        Body: fileContent,
        ContentType: 'application/pdf',
      };

      await s3.upload(uploadParams).promise();
      console.log('✅ Upload successful:', outputFile);

      // ✅ Generate signed URL (valid for 1 hour)
      const signedUrl = s3.getSignedUrl('getObject', {
        Bucket: process.env.MINIO_BUCKET,
        Key: outputFile,
        Expires: 3600,
      });

      console.log('🔒 Signed URL:', signedUrl);
      res.send({ message: 'PDF generated and uploaded', signedUrl });
    } catch (uploadErr) {
      console.error('❌ MinIO Upload Error:', uploadErr.message);
      res.status(500).send('Upload to storage failed');
    }
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
