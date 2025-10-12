const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");

const s3 = new S3Client({
  region: "eu-central-003",
  endpoint: "https://s3.eu-central-003.backblazeb2.com",
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APP_KEY,
  },
});

async function uploadFileToB2(file) {
  file.key = `${Date.now()}-${file.originalname}`
  const command = new PutObjectCommand({
    Bucket: process.env.B2_BUCKET,
    Key: file.key,
    Body: fs.createReadStream(file.path),
    ContentType: file.mimetype,
  });

  await s3.send(command);

  return `https://${process.env.B2_BUCKET}.s3.eu-central-003.backblazeb2.com/${file.key}`;
}

async function deleteFileFromB2(fileUrl) {
  try {
    const fileKey = fileUrl.split("/").pop();
    console.log("🚀 ~ deleteFileFromB2 ~ fileKey:", fileKey)

    const command = new DeleteObjectCommand({
      Bucket: process.env.B2_BUCKET,
      Key: fileKey, // the filename you want to delete
    });

    await s3.send(command);
    console.log("File deleted successfully:", fileKey);
  } catch (err) {
    console.error("Error deleting file:", err);
    throw err;
  }
}

module.exports = { uploadFileToB2, deleteFileFromB2 };
