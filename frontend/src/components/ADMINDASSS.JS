
// http://localhost:5000/api/admin/users


import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/auth';
import { Link } from 'react-router-dom';
import { FaRegUser, FaTrash, FaFileAlt, FaEdit } from 'react-icons/fa';import { toast } from 'react-toastify';


 export const AdminDashboard = () => {
  const [auth] = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFiles, setUserFiles] = useState([]);
  

  useEffect(() => {
    fetchUsers();
  }, []);
  

 const fetchUsers = async () => {
    try {
      const response = await fetch(' http://localhost:5000/api/admin/users', {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        const filteredUsers = result.data.filter(user => user.email !== auth?.user?.email);
        // const filteredUsers = result.data.filter(user => user.email !== ADMIN_EMAIL);
        setUsers(filteredUsers);
      } else {
        setUsers([]);
        toast.error('No users found');
      }
    } catch (error) {
      toast.error('Failed to fetch users');
      setUsers([]);
    }
  };

  const fetchUserFiles = async (userId) => {
    try {
      const response = await fetch(` http://localhost:5000/api/admin/users/${userId}/files`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setUserFiles(result.data);
        setSelectedUser(userId);
      } else {
        setUserFiles([]);
        toast.error('No files found for this user');
      }
    } catch (error) {
      toast.error('Failed to fetch user files');
      setUserFiles([]);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(` http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      const result = await response.json();

      if (result.success) {
        setUsers(users.filter(user => user.id !== userId));
        if (selectedUser === userId) {
          setSelectedUser(null);
          setUserFiles([]);
        }
        toast.success('User deleted successfully');
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      toast.error('Error deleting user: ' + error.message);
    }
  };

  const deleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(` http://localhost:5000/api/admin/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      const result = await response.json();

      if (result.success) {
        setUserFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
        toast.success('File deleted successfully');
      } else {
        toast.error('Failed to delete file');
      }
    } catch (error) {
      toast.error('Error deleting file: ' + error.message);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 px-8 py-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              All Users
            </h2>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {users.length > 0 ? (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => fetchUserFiles(user.id)}
                    >
                      <FaRegUser className="text-gray-600" />
                      <div>
                        <p className="text-gray-800 font-medium">{user.name}</p>
                        <p className="text-gray-600 text-sm">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No users available</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              {selectedUser ? 'User Files' : 'Select a user to view files'}
            </h2>
            {selectedUser && (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {userFiles.length > 0 ? (
  userFiles.map((file) => (
    <div
      key={file.id}
      className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-3">
        <FaFileAlt className="text-gray-600" />
        <div>
          <p className="text-gray-800 font-medium">
            {file.name}
          </p>
          <p className="text-gray-600 text-sm">
            {new Date(file.uploadedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <Link 
          to={`/EditAds/${file.id}`} 
          className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100 transition-colors mr-2"
        >
          <FaEdit />
        </Link>
        <button
          onClick={() => deleteFile(file.id)}
          className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  ))
) : (
  <p className="text-gray-600">No files found for this user</p>
)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;