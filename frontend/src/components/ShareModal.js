import React, { useState } from "react";
import { FaLink, FaCheck, FaChevronDown } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";

const ShareModal = ({ 
  isOpen, 
  onClose, 
  fileId, 
  fileName, 
  auth, 
  currentAccess,
  Owner
}) => {
  const [accessType, setAccessType] = useState(currentAccess);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const [ownerStatus, setOwnerStatus] = useState(Owner);

  const handleAccessChange = async (newAccessType) => {
    setAccessType(newAccessType);
    setIsDropdownOpen(false);

    try {
      await axios.put(
        `http://localhost:5000/api/share/update-general-access/${fileId}`,
        {
          accessType: newAccessType
        },
        {
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );

      toast.success(`Access updated to ${newAccessType}`);
    } catch (error) {
      console.error("Error updating access:", error);
      toast.error("Failed to update access settings");
      setAccessType(currentAccess); // Revert on failure
    }
  };

  const handleShareWithUser = async (e) => {
    e.preventDefault();

    if (!emailRecipient) {
      setEmailStatus({
        type: 'error',
        message: 'Please enter a recipient email address'
      });
      return;
    }

    setIsSendingEmail(true);
    setEmailStatus(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/email/share",
        {
          fileId,
          recipientEmail: emailRecipient,
          senderName: auth.user.name || "A user",
          fileName: fileName || "document",
          accessType: "viewer"
        },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );

      if (response.data.success) {
        setEmailStatus({
          type: "success",
          message: "User added and notified successfully!",
        });
        setEmailRecipient(""); // Clear input
      } else {
        setEmailStatus({
          type: "error",
          message: response.data.message || "Failed to share",
        });
      }
    } catch (error) {
      console.error("Error sharing with user:", error);
      setEmailStatus({
        type: "error",
        message: "Failed to share. Please try again.",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(`${window.location.origin}/EditAds/${fileId}`);
    toast.success("Link copied to clipboard!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800">Share "{fileName}"</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Add people input */}
        <div className="p-6">
          <form onSubmit={handleShareWithUser} className="flex flex-col md:flex-row md:items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-grow relative">
              <input
                type="email"
                placeholder="Add people, groups and calendar events"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
                className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-200 ease-in-out hover:border-blue-400"
              />
            </div>
            <button
              type="submit"
              disabled={isSendingEmail}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition-all duration-300 flex items-center gap-2 self-start md:self-auto"
            >
              <span className="font-semibold">Invite</span>
            </button>
          </form>
          {emailStatus && (
            <div className={`text-sm mt-2 ${emailStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {emailStatus.message}
            </div>
          )}
        </div>

        {/* People with access */}
        <div className="px-6 pb-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">People with access</h4>
          <div className="mb-6">
            {/* Owner */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-800">
                  {auth?.user?.name?.charAt(0) || 'U'}
                </div>
                <div className="ml-4">
                  <p className="text-lg font-medium text-gray-900">{auth?.user?.name || 'You'} (you)</p>
                  <p className="text-sm text-gray-600">{auth?.user?.email}</p>
                </div>
              </div>
              {ownerStatus && <span className="text-sm text-gray-600">Owner</span>}
            </div>
          </div>
        </div>

        {/* General access */}
        <div className="px-6 pb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">General access</h4>

          {/* General Access Section */}
          <div className="flex items-center justify-between rounded-xl p-3 border-2 border-gray-200 hover:bg-gray-50 transition-colors duration-200">
            {/* Left Side: "Anyone with the link" Text */}
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"> 
                <FaLink className="text-green-800 text-lg" />
              </div>
              <div className="ml-4">
                <span className="text-lg font-semibold text-gray-900">
                 Anyone with the link
                </span>
              </div>
            </div>

            {/* Right Side: Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-lg bg-gray-100 px-4 py-2 rounded-lg flex items-center hover:bg-gray-200 transition-colors duration-200"
              >
                <span className="capitalize">{accessType}</span>
                <FaChevronDown className="ml-2" />
              </button>

              {/* Dropdown Options */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg z-10 border border-gray-200">
                  <div className="py-2">
                    <button
                      className="w-full text-left px-6 py-3 text-lg hover:bg-gray-100 flex items-center"
                      onClick={() => handleAccessChange("viewer")}
                    >
                      {accessType === "viewer" && <FaCheck className="mr-3 text-blue-600" />}
                      Viewer
                    </button>
                    <button
                      className="w-full text-left px-6 py-3 text-lg hover:bg-gray-100 flex items-center"
                      onClick={() => handleAccessChange("editor")}
                    >
                      {accessType === "editor" && <FaCheck className="mr-3 text-blue-600" />}
                      Editor
                    </button>
                    <button
                      className="w-full text-left px-6 py-3 text-lg hover:bg-gray-100 flex items-center"
                      onClick={() => handleAccessChange("restricted")}
                    >
                      {accessType === "restricted" && <FaCheck className="mr-3 text-blue-600" />}
                      Restricted
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Copy link and Done button container */}
        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
          {/* Copy link button (left) - Only show if access is not restricted */}
          {accessType !== "restricted" && (
            <button 
              onClick={copyLinkToClipboard}
              className="flex items-center gap-3 px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-lg font-semibold text-gray-800">Copy link</span>
            </button>
          )}

          {/* Done button (right) */}
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
          >
            <span className="text-lg font-semibold">Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;