import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const deleteFromS3 = async (s3Key) => {
  try {
    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: s3Key,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);
    // console.log("Document deleted from S3:", s3Key);
  } catch (error) {
    console.error("Error deleting document from S3:", error);
    throw error;
  }
};

export { deleteFromS3 };
