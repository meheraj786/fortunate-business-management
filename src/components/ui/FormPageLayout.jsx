import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { Save, X } from "lucide-react";

const FormPageLayout = ({
  title,
  subtitle,
  cancelLink,
  onSubmit,
  isEditMode,
  children,
  submitButtonText,
}) => {
  const saveButtonLabel = isEditMode
    ? `Update ${submitButtonText}`
    : `Save ${submitButtonText}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto"
    >
      <form onSubmit={onSubmit}>
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600">{subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to={cancelLink}>
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </Link>
              <button
                type="submit"
                className="px-4 py-2 bg-[#003b75] text-white rounded-lg hover:bg-[#002a54] transition-colors duration-200 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saveButtonLabel}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">{children}</div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-xl shadow-lg p-6 space-y-4 sm:space-y-0 mt-6"
        >
          <Link to={cancelLink}>
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Complete all sections to save
            </span>
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-[#003b75] text-white rounded-lg hover:bg-[#002a54] transition-colors duration-200 font-medium"
          >
            {saveButtonLabel}
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default FormPageLayout;
