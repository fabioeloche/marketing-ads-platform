
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { PenSquare, Trash2, Download, FolderOpen } from 'lucide-react';
import { useAuth } from '../context/auth';
import { toast } from "react-toastify";

export const AdsList = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [auth] = useAuth();

  useEffect(() => {
    if (!auth?.token) {
      navigate('/login');
      return;
    }

    const fetchFiles = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/ads/allfile',
          {
            headers: { Authorization: `Bearer ${auth?.token}` },
          }
        );

        if (response.data.success) {
          setFiles(response.data.data);
          console.log(response.data);
        } else {
          setFiles([]); // Set empty files to show UI
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setFiles([]); // No files found, so show UI
        } else {
          setError('Failed to fetch files. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [navigate]);

  useEffect(() => {
    if (!loading && files.length === 0) {
      navigate('/FileUpload');
    }
  }, [loading, files.length, navigate]);
  

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/csv/delete/${fileId}`,
        {
          headers: { Authorization: `Bearer ${auth?.token}` },
        }
      );
      
      if (response.data.success) {
        setFiles(files.filter((file) => file.fileId !== fileId));
        toast.success('File deleted successfully');
      } else {
        toast.error('Failed to delete the file.');
      }
    } catch (err) {
      toast.error('Error deleting file: ' + err.message);
    }
  };

  const handleDownload = async (fileId, filename) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/csv/download/${fileId}`, {
        headers: { Authorization: `Bearer ${auth?.token}` },
        responseType: 'blob',
      });
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
  
      toast.success('Download started');
    } catch (err) {
      toast.error('Error downloading file: ' + err.message);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading files...</p>;
  
  
  if (error) {
    return (
      <p className="text-center text-red-500">{error}</p>
    );
  }

  // if (!loading && files.length === 0) {
  //   return (
  //     <div className="flex flex-col items-center justify-center h-[60vh] text-center">
  //       <FolderOpen size={60} className="text-gray-400" />
  //       <p className="text-lg font-semibold text-gray-700 mt-4">
  //         No Ads found
  //       </p>
  //       <p className="text-gray-500 mt-2">
  //         Looks like you haven't uploaded any Ads yet.
  //       </p>
  //       <Link to="/FileUpload">
  //         <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
  //           Upload a File
  //         </button>
  //       </Link>
  //     </div>
  //   );
  // }
  

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">Uploaded Ads</h2>
      <div className="space-y-4">
        {files.map((file, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="space-y-2 w-full sm:w-auto">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                  {file.filename}
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs">
                  <span className="font-medium text-orange-600 whitespace-nowrap">
                    {file.filename || 'Unknown Source'}
                  </span>
                  <span className="text-gray-500 flex-shrink-0">
                    Uploaded At-
                    <span className="inline-block ml-1">
                      {new Date(file.upload_date).toLocaleDateString()} 
                      {new Date(file.upload_date).toLocaleTimeString()}
                    </span>
                  </span>
                  <span className="text-gray-500 flex-shrink-0">
                    Updated At- 
                    <span className="inline-block ml-1">
                      {new Date(file.update_date).toLocaleDateString()} 
                      {new Date(file.update_date).toLocaleTimeString()}
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-start sm:justify-end gap-2 flex-wrap">
                <Link to={`/EditAds/${file.fileId}`}>
                  <button className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors flex items-center gap-1">
                    <PenSquare size={16} />
                    <span className="text-xs font-medium hidden sm:inline">EDIT</span>
                  </button>
                </Link>
                <button
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => handleDownload(file.fileId, file.filename)}
                >
                  <Download size={16} />
                </button>
                <button
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  onClick={() => handleDelete(file.fileId)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdsList;

