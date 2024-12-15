import mongoose from "mongoose";
import { Admin } from "../models/admin.model.js";
import { Document } from "../models/document.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getDownloadUrl } from "../utils/awss3.js";
import { deleteFromS3 } from "../utils/deleteFromS3.js";

export const uploadDocuments = asyncHandler(async (req, res) => {
  const userName = req.admin.fullName;
  const userId = req.admin._id;

  // Extracting information from the request
  const uploadResults = req.uploadResults;
  let fileInfos = JSON.parse(req.body.documentDatas);

  // Create documents array using map
  const documents = uploadResults.map((result, idx) => ({
    name: result.originalName,
    size: req.files.find((file) => file.originalname === result.originalName)
      .size,
    uploaderId: userId,
    uploadedBy: userName,
    s3Key: result.s3Key,
    visibility: fileInfos[idx].visibility,
    permission: fileInfos[idx].permission,
  }));

  // Insert documents into the database
  const savedDocuments = await Document.insertMany(documents);

  res
    .status(201)
    .json(
      new ApiResponse(201, savedDocuments, "Documents uploaded successfully")
    );
});

export const getDocuments = asyncHandler(async (req, res) => {
  const userId = req.admin._id;
  const users = await Admin.find({
    _id: { $ne: userId },
    isActive: true,
  });
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const documents = await Document.aggregate([
    {
      $match: {
        $or: [
          { visibility: "public" },
          { uploaderId: new mongoose.Types.ObjectId(userId.toString()) },
          {
            visibility: "private",
            permission: {
              $in: [userId.toString()],
            },
          },
        ],
      },
    },
    {
      $facet: {
        // First facet to get paginated documents
        paginatedResults: [{ $skip: skip }, { $limit: limit }],
        // Second facet to get total count
        totalCount: [{ $count: "total" }],
      },
    },
  ]);
  res
    .status(200)
    .json({ documents, users, message: "Documents fetched successfully" });
});

export const downloadDocument = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const document = await Document.findById(documentId);

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  const url = await getDownloadUrl(document.s3Key);
  res.status(200).json({
    url,
    message: "Download URL generated successfully",
  });
});

// Controller to delete a document from both the database and S3
export const deleteDocument = asyncHandler(async (req, res) => {
  const { documentId } = req.params;

  // Find and delete the document from the database
  const document = await Document.findByIdAndDelete(documentId);
  if (!document) {
    throw new ApiError(404, "Document not found in the database");
  }

  // Delete the document from S3
  await deleteFromS3(document.s3Key);

  res.status(200).json(new ApiResponse(200, "Document deleted successfully."));
});
// Controller to delete a document from both the database and S3
export const editDocument = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const { visibility, permission } = req.body;

  // Find and delete the document from the database
  const document = await Document.findByIdAndUpdate(
    documentId,
    {
      visibility,
      permission,
    },
    {
      new: true,
    }
  );
  if (!document) {
    throw new ApiError(404, "Document not found in the database");
  }

  res.status(200).json(new ApiResponse(200, "Document Updated successfully."));
});
