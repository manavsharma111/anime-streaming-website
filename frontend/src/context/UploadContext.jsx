import React, { createContext, useState, useContext } from 'react';
import axiosInstance from "../services/api";

const UploadContext = createContext();

export const UploadProvider = ({ children }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  const uploadFile = async (payload) => {
    setIsUploading(true);
    setUploadProgress(0);
    setStatusMessage({ type: "info", text: "Preparing secure upload..." });

    try {
      await axiosInstance.post("/upload", payload, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
          if (percentCompleted === 100) {
            setStatusMessage({ type: "info", text: "Upload complete! FFmpeg processing started in background." });
          }
        },
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
