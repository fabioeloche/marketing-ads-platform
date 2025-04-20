import { Link, useNavigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import charactor from '../assets/charactor.jpg';
import logo from '../assets/logo.jpg';
import { useAuth } from '../context/auth';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [auth, setAuth] = useAuth();
  
  // Extract the return URL from location state, if available
  const returnUrl = location.state?.returnUrl || '/AdsList';

  useEffect(() => {
    // If user is already logged in, redirect them
    if (auth?.token) {
      navigate(returnUrl);
    }
  }, [auth, navigate, returnUrl]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null); // Clear the message
      }, 3000); // 3 seconds
      return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        {
          email,
          password,
        }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Login successful!' });
        
        // Update auth context with user data and token
        setAuth({
          ...auth,
          user: response?.data?.user,
          token: response?.data?.token,
          isAdmin: response?.data?.user?.is_admin,
        });
      
        
        // Store auth data in localStorage if rememberMe is checked
        if (rememberMe) {
          localStorage.setItem('auth', JSON.stringify({
            user: response?.data?.user,
            token: response?.data?.token,
            isAdmin: response?.data?.user?.is_admin,
          }));
        }
        
        // Navigate to the return URL or default page
        navigate(returnUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Login failed',
      });
    }
  };

  
  return (
    <div className="min-h-screen bg-white flex flex-col overflow-y-scroll scrollbar-hide">
      {/* Toast Message */}
      {message && (
        <div
          className={`fixed top-16 right-4 p-3 text-white text-center rounded-lg ${
            message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {message.text}
        </div>
      )}
  
      {/* Return URL Indicator (optional - can be removed in production) */}
      {returnUrl !== '/AdsList' && (
        <div className="bg-blue-50 p-2 text-center text-sm text-blue-700">
          You'll be redirected to your requested page after login
        </div>
      )}
  
      {/* Main Content Section */}
      <div className="flex flex-col lg:flex-row flex-grow">
        {/* Login Section */}
        <div className="w-full lg:w-1/3 p-6 sm:p-8 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* Logo and Welcome Message */}
            <div className="flex items-center mb-6 sm:mb-8">
              <img src={logo} alt="logo" className="h-10 sm:h-12" />
              <div className="ml-3">
                <div className="text-xl sm:text-2xl font-semibold">Marketing Share</div>
                <div className="text-gray-600">WELCOME</div>
              </div>
            </div>
  
            {/* Sign-In Prompt */}
            <div className="text-sm text-gray-600 mb-6">
              Please sign in to your account below
            </div>
  
            {/* Error Message */}
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
  
            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full p-3 border rounded-md bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
  
              {/* Password Input */}
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full p-3 border rounded-md bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
  
              {/* Remember Me Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
                  Remember me?
                </label>
              </div>
  
              {/* Sign-In Button */}
              <button
                type="submit"
                className="w-full py-3 bg-orange-400 text-white rounded-md hover:bg-orange-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                Sign In
              </button>
  
              {/* Sign-Up Link */}
              <div className="text-center text-sm text-gray-600">
                If you are new here?{' '}
                <Link
                  to="/signup"
                  className="text-orange-400 hover:text-orange-500"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </div>
        </div>
  
        {/* Campaign Section */}
        <div className="w-full lg:w-2/3 flex flex-col lg:flex-row">
          {/* SHARE YOUR CAMPAIGN Section */}
          <div className="hidden lg:flex lg:w-1/2 bg-red-600 items-center justify-center p-8 sm:p-12">
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
          <div className="hidden lg:flex lg:w-1/2 bg-yellow-400 items-center justify-center">
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