
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import { FaChevronDown } from "react-icons/fa";
import Papa from "papaparse";
import { useAuth } from "../context/auth";
import preview from "../assets/preview.png";
import ShareModal from "../components/ShareModal"; // Import the new ShareModal component
import PreviewModal from "../components/PreviewModel";

export const EditAds = () => {
  const { fileId } = useParams();
  const [adData, setAdData] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(0);
  const [auth] = useAuth(); 
  const navigate = useNavigate();
//const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Updated state for new permission model
  const [generalAccessType, setGeneralAccessType] = useState("viewer");
  const [canEditFile, setCanEditFile] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const fetchAdData = async () => {
      try {
        // ✅ Ensure auth exists before proceeding
        if (!auth || !auth.user) {
          setError("Authentication data is missing");
          setLoading(false);
          navigate("/login", { state: { returnUrl: `/EditAds/${fileId}` } });
          return;
        }
  
        const response = await axios.get(
          `http://localhost:5000/api/ads/singlefile/${fileId}`,
          {
            headers: {
              'Authorization': `Bearer ${auth.token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        if (response.data?.success && response.data?.data?.length > 0) {
          const fileData = response.data.data[0];
          const fileMetadata = response.data.fileMetadata;
  
          if (!fileMetadata) {
            setError("File metadata is missing");
            setLoading(false);
            return;
          }
  
          // ✅ Properly update the isOwner state
          const ownerStatus = fileMetadata.uploadedBy === auth.user.id;
          setIsOwner(ownerStatus);
          setMetadata(fileMetadata);
          

          // Check for restricted access and redirect if necessary
          if (fileMetadata.access === "restricted" && !ownerStatus) {
            setError("You don't have permission to access this file");
            setLoading(false);
            navigate(`/unauthorized/${fileId}`); // Pass fileId as parameter
            return;
          }
          
          // ✅ Correctly set canEditFile after isOwner is set
          setCanEditFile(ownerStatus || fileMetadata.access === "editor");
          
          setAdData(fileData);
          // Fix typo in property name (acsess -> access)
          setGeneralAccessType(fileMetadata.access || "viewer");
        } else {
          setError("No data found");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (err.response?.status === 401) {
          navigate("/login", { state: { returnUrl: `/file/${fileId}` } });
        } else if (err.response?.status === 403) {
          navigate(`/unauthorized/${fileId}`);
        } else {
          setError("Failed to fetch data");
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchAdData();
  }, [fileId, auth, navigate]);
 
  const handleInputChange = (e) => {
    if (!adData) return;
    const { name, value } = e.target;
    setAdData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // if (!auth || !auth.token) {
    //   toast.error("Unauthorized action. Please log in.");
    //   return;
    // }
  
    try {
      if (!adData || Object.keys(adData).length === 0) {
        toast.error("No data to save.");
        return;
      }
  
      let cleanedData = Object.entries(adData)
        .filter(([key, value]) => key.trim() && value !== "" && value !== undefined)
        .reduce((acc, [key, value]) => {
          acc[key.trim().replace(/\s+/g, "_")] = value;
          return acc;
        }, {});
  
      // Add the update_date field with the current timestamp
      cleanedData.update_date = new Date().toISOString();
  
      const csvRawData = Papa.unparse([cleanedData]);
    
      await axios.put(`http://localhost:5000/api/csv/update/${fileId}`, csvRawData, {
        headers: {
          "Content-Type": "text/csv",
          Authorization: `Bearer ${auth.token}`,
        },
      });
  
      toast.success("Changes saved successfully!");
    } catch (err) {
      console.error("Save error:", err.response?.data || err.message);
      toast.error("Failed to save changes");
    }
  };

  const handleCancel = () => {
    navigate("/AdsList");
    window.location.reload();
  };

  const renderField = (fieldName, value, maxLength = 30) => (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-3">
      <label className="text-sm font-medium text-gray-700 block">
        {fieldName.replace(/_/g, " ").split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
      </label>
      <input
        type="text"
        name={fieldName}
        value={value || ""}
        disabled={!canEditFile}
        onChange={handleInputChange}
        className="w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500"
        maxLength={maxLength}
      />
      <div className="text-sm text-gray-500 text-right">{(value?.length || 0)} / {maxLength}</div>
    </div>
  );

  if (loading) return <p className="text-center mt-4">Loading...</p>;
  if (error) return <p className="text-center mt-4 text-red-500">{error}</p>;
  if (!adData) return <p className="text-center mt-4">No data available</p>;

  const headlines = Array.from({ length: 15 }, (_, i) => adData[`Headline ${i + 1}`] || "");
  const descriptions = Array.from({ length: 4 }, (_, i) => adData[`Description ${i + 1}`] || "");
  const finalURL = adData["Final URL"] || "";
  const path1 = adData["Path 1"] || "";
  const path2 = adData["Path 2"] || "";
  return (
    <div className="flex flex-col w-full min-h-screen bg-white">
      {/* Navbar Section */}
      <div className="w-full bg-white shadow-sm p-4 px-6 md:px-10 flex flex-col sm:flex-row justify-between items-center">
        <h2 className="text-xl font-semibold mb-4 sm:mb-0">Edit Ad</h2>
        <div className="flex items-center space-x-4">
          {/* Notification Section */}
          <div className="flex items-center space-x-2 flex-grow mr-4 overflow-hidden">
            {/* Add notification content here if needed */}
          </div>
  
          {/* Share Button */}
          <div className="relative">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-4 py-2 text-lg text-black font-semibold bg-orange-400 hover:bg-orange-500 rounded-3xl flex items-center space-x-2"
            >
              <span>Share</span>
              <FaChevronDown />
            </button>
          </div>
        </div>
      </div>
  
      {/* Main Content Section */}
      <div className="flex flex-col md:flex-row w-full h-full overflow-y-hidden">
        {/* Sidebar Section (Left Edit Section) */}
        <div className="w-full md:w-1/4 p-4 border-r border-gray-200 overflow-y-auto md:sticky md:top-0 md:h-screen">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Headlines</h2>
          {headlines.map((text, index) => renderField(`Headline ${index + 1}`, text, 30))}
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Descriptions</h2>
          {descriptions.map((text, index) => renderField(`Description ${index + 1}`, text, 90))}
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Final URL</h2>
          {renderField("Final URL", finalURL, 200)}
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Display Path</h2>
          {renderField("Path 1", path1, 15)}
          {renderField("Path 2", path2, 15)}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-semibold bg-yellow-500 rounded-3xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-semibold bg-yellow-500 rounded-3xl"
              disabled={!canEditFile}
            >
              Save Changes
            </button>
          </div>
        </div>
  
        {/* Preview Section */}
        <div className="w-full md:w-3/4 p-4 sticky top-0 h-screen overflow-hidden">
          <PreviewModal isOpen={true} adData={adData} />
        </div>
      </div>
  
      {/* New Share Modal Component */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        fileId={fileId}
        fileName={metadata.filename || "Ad"}
        auth={auth}
        currentAccess={generalAccessType}
        Owner={isOwner}
      />
    </div>
  );
};

export default EditAds;