import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import "../../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email format is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (errors.email) {
      setErrors({ ...errors, email: "" });
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    // Clear error when user starts typing
    if (errors.password) {
      setErrors({ ...errors, password: "" });
    }
  };

  // Handle input blur
  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validateForm();
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (validateForm()) {
      // Form is valid, proceed with login
      console.log("Login successful");
      // Add your login logic here
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background pattern with opacity */}
      <div className="absolute inset-0 bg-pattern z-0"></div>

      {/* Form content */}
      <div className="relative z-10 w-full flex justify-center">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ maxWidth: "26rem" }}
            className="w-full"
          >
            <form
              onSubmit={handleSubmit}
              className="bg-[#f7f8ff] rounded-xl shadow-xl p-6 space-y-5 border border-gray-100"
            >
              <div className="text-center">
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-2xl font-bold text-gray-800"
                >
                  Welcome Back
                </motion.h1>
                <p className="text-gray-600 mt-1 text-sm">
                  Access your account
                </p>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  className={`relative rounded-md shadow-sm ${
                    errors.email && touched.email
                      ? "text-red-500"
                      : !errors.email && email
                      ? "text-green-500"
                      : "text-gray-400"
                  }`}
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => handleBlur("email")}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                      errors.email && touched.email
                        ? "border-red-500 focus:ring-red-200"
                        : !errors.email && email
                        ? "border-green-500 focus:ring-green-200"
                        : "border-gray-300 focus:ring-blue-200 focus:border-[#003b75]"
                    }`}
                    placeholder="you@example.com"
                    aria-invalid={errors.email ? "true" : "false"}
                    aria-describedby={errors.email ? "email-error" : null}
                  />
                </motion.div>
                <AnimatePresence>
                  {errors.email && touched.email && (
                    <motion.p
                      id="email-error"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-sm text-red-600"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  className={`relative rounded-md shadow-sm ${
                    errors.password && touched.password
                      ? "text-red-500"
                      : !errors.password && password
                      ? "text-green-500"
                      : "text-gray-400"
                  }`}
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={() => handleBlur("password")}
                    className={`block w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                      errors.password && touched.password
                        ? "border-red-500 focus:ring-red-200"
                        : !errors.password && password
                        ? "border-green-500 focus:ring-green-200"
                        : "border-gray-300 focus:ring-blue-200 focus:border-[#003b75]"
                    }`}
                    placeholder="••••••••"
                    aria-invalid={errors.password ? "true" : "false"}
                    aria-describedby={errors.password ? "password-error" : null}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200 rounded-md p-1"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <FiEyeOff className="h-5 w-5" />
                      ) : (
                        <FiEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </motion.div>
                <AnimatePresence>
                  {errors.password && touched.password && (
                    <motion.p
                      id="password-error"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-sm text-red-600"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#003366] hover:bg-[#003b75] cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Sign in
              </motion.button>
            </form>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Login;
