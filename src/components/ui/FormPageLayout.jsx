import React, { memo } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { Save, X, Loader2 } from "lucide-react";

const FormPageLayout = ({
  title,
  subtitle,
  cancelLink,
  onSubmit,
  isEditMode,
  children,
  submitButtonText,
  isLoading = false,
  isValid = true,
  className = "",
}) => {
  const saveButtonLabel = isEditMode
    ? `Update ${submitButtonText}`
    : `Save ${submitButtonText}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`max-w-6xl mx-auto px-2 sm:px-3 ${className}`}
    >
      <form onSubmit={onSubmit}>
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm sm:text-base text-gray-600 mt-1 line-clamp-2">
                  {subtitle}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Link
                to={cancelLink}
                className="flex-1 sm:flex-none"
                aria-label="Cancel and go back"
              >
                <button
                  type="button"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span className="whitespace-nowrap">Cancel</span>
                </button>
              </Link>
              <button
                type="submit"
                disabled={isLoading || !isValid}
                className="flex-1 sm:flex-none w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-[#003b75] text-white rounded-lg hover:bg-[#002a54] active:bg-[#001c3a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span className="whitespace-nowrap">{saveButtonLabel}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="space-y-4 sm:space-y-6">{children}</div>

        {/* Footer Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-lg shadow-lg p-4 sm:p-6 space-y-4 sm:space-y-0 mt-6"
        >
          <Link
            to={cancelLink}
            className="w-full sm:w-auto"
            aria-label="Cancel and go back"
          >
            <button
              type="button"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {!isValid && (
              <span className="text-sm text-red-600 flex items-center">
                Please complete all required fields
              </span>
            )}
            <span
              className={`text-sm ${
                isValid ? "text-gray-600" : "text-amber-600"
              }`}
            >
              {isValid ? "Ready to save" : "Complete all required sections"}
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isValid}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#003b75] text-white rounded-lg hover:bg-[#002a54] active:bg-[#001c3a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              saveButtonLabel
            )}
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
};

FormPageLayout.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  cancelLink: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  submitButtonText: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
  isValid: PropTypes.bool,
  className: PropTypes.string,
};

export default memo(FormPageLayout);
