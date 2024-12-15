import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import fs from "fs";
import { Readable } from "stream";
const generateImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

// Configure AWS S3 client with your credentials
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION, // Specify your AWS region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadOnS3 = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Read the file from local filesystem
    const fileContent = fs.readFileSync(localFilePath);
    const imageName = generateImageName();

    // Specify the upload parameters
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `images/${imageName}`, // Specify a unique key for the object
      Body: fileContent,
    };

    // Upload the file to the S3 bucket
    const command = new PutObjectCommand(uploadParams);
    const response = await s3Client.send(command);

    // File has been uploaded successfully
    fs.unlinkSync(localFilePath);
    return imageName;
  } catch (error) {
    fs.unlinkSync(localFilePath); // Remove the locally saved temporary file as the upload operation failed
    console.error("Error uploading file to S3:", error);
    throw error; // Rethrow the error for handling in the calling function
  }
};

//function to generate unique filename

const generateFileName = (name) => {
  let nameArr = name.split(".");
  let str =
    nameArr[0] + "-" + crypto.randomBytes(8).toString("hex") + "." + nameArr[1];
  return str;
};

//upload single file on s3
const uploadDocumentOnS3 = async (file) => {
  try {
    if (!file.path) return null;

    const fileContent = fs.readFileSync(file.path);
    const documentName = file.originalname;

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `documents/${documentName}`, // Specify a unique key for the object
      Body: fileContent,
    };

    const command = new PutObjectCommand(uploadParams);
    const response = await s3Client.send(command);

    fs.unlinkSync(file.path);
    return documentName;
  } catch (error) {
    fs.unlinkSync(file.path);
    console.error("Error uploading file to S3:", error);
    throw error;
  }
};
// upload multiple file on s3
const uploadDocumentsToS3 = async (req, res, next) => {
  // console.log("req.files", req.files);
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  try {
    const uploadPromises = req.files.map((file) => uploadDocumentOnS3(file));
    const uploadedDocuments = await Promise.all(uploadPromises);

    // console.log("req.files[index].originalname", req.files[0].originalname);
    req.uploadResults = uploadedDocuments.map((documentName, index) => ({
      originalName: req.files[index].originalname,
      s3Key: `documents/${documentName}`,
    }));

    next();
  } catch (error) {
    console.error("Error uploading documents to S3:", error);
    res.status(500).send("Error uploading documents.");
  }
};

//download single file from s3
const getDownloadUrl = async (s3Key) => {
  const getObjectParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: s3Key,
  };

  const command = new GetObjectCommand(getObjectParams);
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return url;
};
export { getDownloadUrl, uploadDocumentOnS3, uploadDocumentsToS3, uploadOnS3 };
