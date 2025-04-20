import React, { useState, useRef } from "react";
import { Upload, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/auth";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const FileUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [auth] = useAuth();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileId, setUploadedFileId] = useState(null);
  const navigate = useNavigate();

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const newFiles = [...e.dataTransfer.files];
    handleUpload(newFiles);
  };

  const handleFileSelect = (e) => {
    const newFiles = [...e.target.files];
    handleUpload(newFiles);
    e.target.value = null;
  };

  const handleUpload = async (files) => {
    const validFiles = files.filter(
      (file) => file.type === "text/csv" || file.name.endsWith(".csv")
    );

    if (validFiles.length === 0) {
      toast.error("Only CSV files are allowed.");
      return;
    }

    if (!auth?.token) {
      toast.error("Unauthorized: Please log in.");
      return;
    }

    const formData = new FormData();
    validFiles.forEach((file) => {
      formData.append("csvFile", file);
    });

    try {
      const response = await axios.post(
        "http://localhost:5000/api/csv/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("File uploaded successfully!");
        setUploadedFile(validFiles[0].name); // Show file name
        // Store the file ID if returned from the server
        if (response.data.fileId) {
          setUploadedFileId(response.data.fileId);
        }
        // Don't auto-hide if we want to show the button
      } else {
        toast.error(`Upload failed: ${response.data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Error uploading file. Check console for details.");
    }
  };

  const handleViewFiles = () => {
    navigate("/AdsList");
  };
  return (
    <div className="w-full h-full bg-white mx-auto p-4 sm:p-6">
      {/* Heading Section */}
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">Upload CSV File</h1>
  
      {/* Uploaded File Section */}
      {uploadedFile ? (
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl text-green-600 mb-2 transition-opacity duration-500">
            Uploaded: {uploadedFile}
          </h2>
          <button
            onClick={handleViewFiles}
            className="flex items-center space-x-2 mx-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            <span>View Files</span>
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <h2 className="text-lg sm:text-xl text-center mb-6 sm:mb-8 text-gray-700">
          Choose a file to upload
        </h2>
      )}
  
      {/* Drag-and-Drop Section */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 sm:p-8 ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
        } transition-colors duration-200`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".csv"
            className="hidden"
            multiple
          />
  
          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current.click()}
            className="bg-orange-400 hover:bg-orange-500 text-white px-5 py-2 sm:px-6 sm:py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Upload size={20} />
            <span>Upload a File</span>
          </button>
  
          {/* Drag-and-Drop Text */}
          <p className="text-sm sm:text-base text-gray-500">Drag & drop a file</p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;