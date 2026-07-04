import React, { createContext, useState, useContext } from 'react';
import axios from "axios";
import axiosInstance from "../services/api";

const UploadContext = createContext();

export const UploadProvider = ({ children }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  const uploadFile = async (payload) => {
    setIsUploading(true);
    setUploadProgress(0);
    setStatusMessage({ type: "info", text: "Requesting secure upload link..." });

    try {
      const videoFile = payload.get("video");
      if (!videoFile) {
        throw new Error("Video file is required for upload.");
      }

      // Step 1: Get presigned URL from our backend
      const presignRes = await axiosInstance.post("/upload/presigned-url", {
        filename: videoFile.name,
        contentType: videoFile.type || "video/mp4",
      });
      const { presignedUrl, key } = presignRes.data.data;

      setStatusMessage({ type: "info", text: "Uploading directly to Cloudflare..." });

      // Step 2: Upload file directly to Cloudflare R2
      await axios.put(presignedUrl, videoFile, {
        headers: {
          "Content-Type": videoFile.type || "video/mp4",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
          if (percentCompleted === 100) {
            setStatusMessage({ type: "info", text: "Upload complete! Telling backend to start FFmpeg..." });
          }
        },
      });

      // Step 3: Send metadata to our backend
      payload.delete("video");
      payload.append("videoKey", key);
      payload.append("originalFilename", videoFile.name);

      await axiosInstance.post("/upload", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStatusMessage({ type: "success", text: "Episode added to encoding pipeline successfully." });
      
      // Auto dismiss success message after 5 seconds
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setStatusMessage({ type: "", text: "" });
      }, 5000);
      
    } catch (error) {
      setStatusMessage({ type: "error", text: error.response?.data?.message || "Failed to add episode." });
      
      // Auto dismiss error message after 8 seconds
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setStatusMessage({ type: "", text: "" });
      }, 8000);
    }
  };

  return (
    <UploadContext.Provider value={{ isUploading, uploadProgress, statusMessage, uploadFile }}>
      {children}
    </UploadContext.Provider>
  );
};

export const useUpload = () => useContext(UploadContext);
