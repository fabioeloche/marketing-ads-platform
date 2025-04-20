import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import charactor from "../assets/charactor.jpg";
import logo from '../assets/logo.jpg';

export const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/register',
        {
          name: formData.username,
          email: formData.email,
          password: formData.password,
        }
      );

      console.log('Registration successful:', response.data);
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      console.error(
        'Registration failed:',
        error.response?.data?.message || error.message
      );
      alert(
        `Registration failed: ${error.response?.data?.message || error.message}`
      );
    }
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Signup Section */}
        <div className="w-full lg:w-1/3 p-6 sm:p-8 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* Logo and Create Account Message */}
            <div className="flex items-center mb-6 sm:mb-8">
              <img src={logo} alt="logo" className="h-10 sm:h-12" />
              <div className="ml-3">
                <div className="text-xl sm:text-2xl font-semibold">Marketing Share</div>
                <div className="text-gray-600">CREATE ACCOUNT</div>
              </div>
            </div>
  
            {/* Sign-Up Prompt */}
            <div className="text-sm text-gray-600 mb-6">
              Please fill in your information below
            </div>
  
            {/* Sign-Up Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                  className="w-full p-3 border rounded-md bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
  
              {/* Email Input */}
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full p-3 border rounded-md bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
  
              {/* Password Input */}
              <div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full p-3 border rounded-md bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
  
              {/* Confirm Password Input */}
              <div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className="w-full p-3 border rounded-md bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
  
              {/* Create Account Button */}
              <button
                type="submit"
                className="w-full py-3 bg-orange-400 text-white rounded-md hover:bg-orange-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                Create Account
              </button>
  
              {/* Sign-In Link */}
              <div className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-orange-400 hover:text-orange-500"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>
  
        {/* Campaign Section */}
        <div className="w-full lg:w-2/3 flex flex-col lg:flex-row">
          {/* SHARE YOUR CAMPAIGN Section */}
          <div className="hidden lg:flex lg:w-1/3 bg-red-600 items-center justify-center p-8 sm:p-12">
            <div className="text-3xl sm:text-4xl font-bold text-white text-center leading-tight">
              SHARE
              <br />
              YOUR
              <br />
              CAMPAIGN
              <br />
              AND
              <br />
              IMPROVE
              <br />
              RESULTS
            </div>
          </div>
  
          {/* Character Image Section */}
          <div className="w-full lg:w-2/3 bg-yellow-400 flex items-center justify-center">
            <img
              src={charactor}
              alt="Marketing professional"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );

};

export default Signup;
