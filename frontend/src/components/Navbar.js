import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg';
import { useAuth } from '../context/auth';
import { FaRegUser } from 'react-icons/fa';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [auth, setAuth] = useAuth();
  const [message, setMessage] = useState(null);

  // Define admin email (you might want to move this to a config file)
  const ADMIN_EMAIL = "admin@admin.com";
   // Replace with your admin email

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    setAuth({
      ...auth,
      user: null,
      token: '',
    });
    localStorage.removeItem('auth');
    setMessage({ type: 'success', text: 'Logged out successfully' });
    navigate('/login');
  };

  // Check if current user is admin
  const isAdmin = auth?.user?.is_admin
  return (
    <div className="w-full border-b backdrop-blur-md border-gray-200 px-8 shadow-sm">
      {message && (
        <div
          className={`fixed top-16 right-4 p-3 text-white text-center rounded-lg ${
            message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="px-6 py-2">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Logo" className="h-12" />
            </Link>
            <nav className="ml-8 hidden lg:block">
              <ul className="flex space-x-8">
                <li>
                  <Link
                    to="/AdsList"
                    className={`relative text-gray-600 hover:text-gray-900 text-base font-semibold py-2 ${
                      isActiveLink('/AdsList')
                        ? 'text-purple-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-purple-600 after:shadow-md'
                        : ''
                    }`}
                  >
                    Ads
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tutorial"
                    className={`relative text-gray-600 hover:text-gray-900 text-base font-semibold py-2 ${
                      isActiveLink('/tutorial')
                        ? 'text-purple-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-purple-600 after:shadow-md'
                        : ''
                    }`}
                  >
                    Tutorial
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className={`relative text-gray-600 hover:text-gray-900 text-base font-semibold py-2 ${
                      isActiveLink('/about')
                        ? 'text-purple-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-purple-600 after:shadow-md'
                        : ''
                    }`}
                  >
                    About
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link
                      to="/admin-dashboard"
                      className={`relative text-gray-600 hover:text-gray-900 text-base font-semibold py-2 ${
                        isActiveLink('/admin-dashboard')
                          ? 'text-purple-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-purple-600 after:shadow-md'
                          : ''
                      }`}
                    >
                      Admin Dashboard
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>

          <div className="flex items-center">
            <button
              className="lg:hidden p-2 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="w-6 h-6 text-gray-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>

            <div className="hidden lg:flex items-center space-x-6">
              {!auth?.user && (
                <Link to="/login">
                  <button className="text-gray-600 hover:text-gray-900 text-base font-semibold">
                    Login
                  </button>
                </Link>
              )}
              {auth?.user && (
                <>
                  <span className="text-gray-600 text-base font-semibold flex items-center gap-2">
                    <FaRegUser className="text-gray-600" />
                    {auth?.user?.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-900 text-base font-semibold"
                  >
                    Logout
                  </button>
                </>
              )}
              <Link to="/FileUpload">
                <button className="text-gray-600 hover:text-gray-900 text-base font-semibold border border-gray-300 px-4 py-1 rounded">
                  Upload Ads
                </button>
              </Link>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden py-4">
            <ul className="space-y-4">
              <li>
                <Link
                  to="/AdsList"
                  className="block text-gray-600 hover:text-gray-900 text-base font-semibold"
                >
                  Ads
                </Link>
              </li>
              <li>
                <Link
                  to="/tutorial"
                  className="block text-gray-600 hover:text-gray-900 text-base font-semibold"
                >
                  Tutorial
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="block text-gray-600 hover:text-gray-900 text-base font-semibold"
                >
                  About
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link
                    to="/admin-dashboard"
                    className="block text-gray-600 hover:text-gray-900 text-base font-semibold"
                  >
                    Admin Dashboard
                  </Link>
                </li>
              )}
              {!auth?.user && (
                <li>
                  <Link to="/login">
                    <button className="text-gray-600 hover:text-gray-900 text-base font-semibold">
                      Login
                    </button>
                  </Link>
                </li>
              )}
              {auth?.user && (
                <>
                  <li>
                    <span className="text-gray-600 text-base font-semibold">
                      {auth?.user?.name}
                    </span>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="text-gray-600 hover:text-gray-900 text-base font-semibold"
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
              <li>
                <Link to="/FileUpload">
                  <button className="text-gray-600 hover:text-gray-900 text-base font-semibold border border-gray-300 px-4 py-1 rounded">
                    Upload Ads
                  </button>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;