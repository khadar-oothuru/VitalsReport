import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiLock, FiLogIn } from "react-icons/fi";
import vitalsLogoWhite from "../assets/vitalsLogowhite.png";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      if (userData.role === "admin") {
        navigate("/tables");
      } else if (userData.role === "provider") {
        navigate("/comprehensive-medical-profile");
      }
    }
  }, [navigate]);

  // Dummy credentials
  const dummyUsers = {
    admin: { username: "admin", password: "admin123", role: "admin" },
    provider: {
      username: "provider",
      password: "provider123",
      role: "provider",
    },
  };

  const handleInputChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if credentials match any dummy user
      const user = Object.values(dummyUsers).find(
        (user) =>
          user.username === credentials.username &&
          user.password === credentials.password
      );

      if (user) {
        // Store user info in localStorage
        localStorage.setItem("user", JSON.stringify(user));

        // Redirect based on role
        if (user.role === "admin") {
          navigate("/tables");
        } else if (user.role === "provider") {
          navigate("/comprehensive-medical-profile");
        }
      } else {
        setError("Invalid username or password");
      }
    } catch {
      setError("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Single Container with Welcome Banner and Content */}
        <div className="bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-lg">
          {/* Welcome Banner */}
          <div className="bg-teal-700 text-white px-8 py-6 text-left">
            <div className="flex items-center gap-3 mb-3">
              <FiUser className="w-8 h-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            </div>
            <p className="text-blue-100 font-medium text-sm">
              Sign in to your account to access your dashboard
            </p>
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row">
            {/* Company Logo Section */}
            <div className="p-8 flex-1">
              <div className="text-center h-full flex flex-col justify-center">
                <div className="mb-8">
                  <div className="mx-auto h-24 w-24 bg-teal-600 rounded-full flex items-center justify-center mb-6">
                    <img
                      src={vitalsLogoWhite}
                      alt="Vitals Health Logo"
                      className="h-20 w-20 object-contain"
                    />
                  </div>
                  <h2 className="text-3xl font-bold text-teal-700 mb-4">
                    Vitals 7
                  </h2>
                  <p className="text-lg text-slate-600 mb-6">
                    Your trusted partner in comprehensive health monitoring
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                        <svg
                          className="w-8 h-8 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-slate-600">
                        Analytics
                      </span>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                        <svg
                          className="w-8 h-8 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-slate-600">
                        Care
                      </span>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                        <svg
                          className="w-8 h-8 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.5a7.5 7.5 0 00-7.5 7.5c0 1.5.5 3 1.5 4.5L12 21l6-5c1-1.5 1.5-3 1.5-4.5a7.5 7.5 0 00-7.5-7.5z"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-slate-600">
                        Innovation
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Grey Line Divider - Reduced Height */}
            <div className="hidden lg:block w-px bg-gray-300 h-64 mx-auto my-auto"></div>

            {/* Login Form Section */}
            <div className="p-8 flex-1">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="username"
                      className="flex items-center gap-2 text-sm font-semibold mb-3 text-slate-600"
                    >
                      <FiUser className="w-4 h-4" />
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={credentials.username}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 border border-blue-100 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-white"
                      placeholder="Enter your username"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="flex items-center gap-2 text-sm font-semibold mb-3 text-slate-600"
                    >
                      <FiLock className="w-4 h-4" />
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={credentials.password}
                      onChange={handleInputChange}
                      className="block w-full px-4 py-3 border border-blue-100 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-white"
                      placeholder="Enter your password"
                      disabled={isLoading}
                    />
                    <div className="mt-2 text-right">
                      <a
                        href="#"
                        className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors duration-200"
                      >
                        Forgot password?
                      </a>
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Signing In...
                      </>
                    ) : (
                      <>
                        <FiLogIn className="w-5 h-5" />
                        Sign In
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="my-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-blue-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-slate-500 font-medium">
                      Or continue with
                    </span>
                  </div>
                </div>
              </div>

              {/* OAuth Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="flex-1 text-center">
                    Continue with Google
                  </span>
                  <svg
                    className="w-4 h-4 flex-shrink-0 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="#1877F2"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="flex-1 text-center">
                    Continue with Facebook
                  </span>
                  <svg
                    className="w-4 h-4 flex-shrink-0 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
