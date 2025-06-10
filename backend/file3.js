require('dotenv').config();
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// ✅ Read file
const filePath = path.join(__dirname, 'output.pdf');
const fileContent = fs.readFileSync(filePath);

// ✅ Configure MinIO (S3-compatible)
const s3 = new AWS.S3({
  accessKeyId: process.env.MINIO_ACCESS_KEY,
  secretAccessKey: process.env.MINIO_SECRET_KEY,
  endpoint: process.env.MINIO_ENDPOINT,
  region: process.env.MINIO_REGION,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

// ✅ Upload
const uploadParams = {
  Bucket: process.env.MINIO_BUCKET,
  Key: 'output.pdf',
  Body: fileContent,
  ContentType: 'application/pdf',
};

s3.upload(uploadParams, (err, data) => {
  if (err) {
    console.error('❌ Upload failed:', err.message);
    return;
  }

  console.log('✅ Upload successful:', data.Location);

  // ✅ Generate signed URL (valid for 1 hour)
  const signedUrl = s3.getSignedUrl('getObject', {
    Bucket: uploadParams.Bucket,
    Key: uploadParams.Key,
    Expires: 3600, // 1 hour in seconds
  });

  console.log('🔒 Signed URL:', signedUrl);
});
