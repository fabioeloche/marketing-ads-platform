
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShieldX, ArrowLeft, Home, RefreshCw } from 'lucide-react';
import axios from 'axios';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { fileId } = useParams();
  const [isChecking, setIsChecking] = useState(false);
  
  // Function to retry access with authentication
  const retryAccess = async () => {
    if (!fileId) return;
    
    setIsChecking(true);
    try {
      // Get the authentication token
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        navigate('/login', { state: { returnUrl: `/file/${fileId}` } });
        return;
      }
      
      // Attempt to access the file with authentication
      const response = await axios.get(
        `http://localhost:5000/api/ads/singlefile/${fileId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // If successful, navigate to the file
      if (response.data) {
        navigate(`/EditAds/${fileId}`);
      }
    } catch (error) {
      // Stay on the unauthorized page if still unauthorized
      console.error('Access still denied:', error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="p-3 bg-red-100 rounded-full">
            <ShieldX size={48} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-center text-gray-600">
            You don't have permission to access this file. Please contact the owner for access.
          </p>
        </div>
        
        <div className="h-px bg-gray-200" />
        
        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Home size={16} />
            <span>Return to Home</span>
          </button>
          
          <button
            onClick={retryAccess}
            disabled={isChecking}
            className="flex items-center justify-center w-full px-4 py-2 space-x-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-green-300"
          >
            {isChecking ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            <span>{isChecking ? 'Checking Access...' : 'Try Again'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;