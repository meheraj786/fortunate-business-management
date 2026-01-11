import React, { memo } from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { Link } from "react-router"; // Changed to react-router
import { Save, X } from "lucide-react";
import Button from "./Button"; // Import the Button component

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
      className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}
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
                <Button
                  type="button"
                  disabled={isLoading}
                  variant="secondary"
                  className="w-full sm:w-auto"
                  aria-label="Cancel"
                >
                  <X className="w-4 h-4" />
                  <span className="whitespace-nowrap">Cancel</span>
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isLoading || !isValid}
                isLoading={isLoading}
                variant="primary"
                className="w-full sm:w-auto"
                aria-label={saveButtonLabel}
              >
                <Save className="w-4 h-4" />
                <span className="whitespace-nowrap">{saveButtonLabel}</span>
              </Button>
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
            <Button
              type="button"
              disabled={isLoading}
              variant="secondary"
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {!isValid && (
              <span className="text-sm text-[var(--color-danger)] flex items-center">
                Please complete all required fields
              </span>
            )}
            <span
              className={`text-sm ${
                isValid ? "text-gray-600" : "text-[var(--color-warning)]"
              }`}
            >
              {isValid ? "Ready to save" : "Complete all required sections"}
            </span>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !isValid}
            isLoading={isLoading}
            variant="primary"
            className="w-full sm:w-auto"
          >
            {saveButtonLabel}
          </Button>
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
