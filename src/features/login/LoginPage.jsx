import React, { useState, useCallback, useMemo, useEffect } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import "@/styles/Login.css";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router";
import { useForm } from "react-hook-form";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = useCallback(
    async (data) => {
      await login(data.email, data.password);
    },
    [login],
  );

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const emailValidation = useMemo(
    () => ({
      required: "Email is required",
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: "Invalid email address",
      },
    }),
    [],
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background pattern with opacity */}
      <div className="absolute inset-0 bg-pattern z-0"></div>

      {/* Form content */}
      <div className="relative z-10 w-full flex justify-center">
        <div style={{ maxWidth: "26rem" }} className="w-full animate-fade-in-up">
          <form
              onSubmit={handleSubmit(onSubmit)} // Use handleSubmit from react-hook-form
              className="bg-[#f7f8ff] rounded-lg shadow-xl p-6 space-y-5 border border-gray-100"
            >
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800 animate-fade-in-up">
                  Welcome Back
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                  Access your account
                </p>
              </div>

              {/* Email Input */}
              <InputField
                label="Email Address"
                name="email"
                type="email"
                placeholder="you@example.com"
                register={register}
                error={errors.email?.message}
                icon={FiMail}
                validation={emailValidation}
              />

              {/* Password Input */}
              <InputField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                register={register}
                error={errors.password?.message}
                icon={FiLock}
                validation={{ required: "Password is required" }}
                autoComplete="current-password"
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                className="relative"
              >
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] rounded-md p-1"
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
              </InputField>

              {/* Submit Button */}
              <Button
                type="submit"
                isLoading={isSubmitting} // Use isSubmitting from react-hook-form
                variant="primary"
                className="w-full"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
