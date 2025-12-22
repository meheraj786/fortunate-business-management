import React, { useRef, useState, useCallback, memo } from "react";
import PropTypes from "prop-types";
import {
  UploadCloud,
  Paperclip,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const FileInput = ({
  files,
  onFileChange,
  onFileRemove,
  maxSize = 10, // MB
  acceptedTypes = "*/*",
  label = "Documents",
  required = false,
  error,
  className = "",
}) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleLabelClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file) => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File size exceeds ${maxSize}MB limit`;
    }
    return "";
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = [];
      const errors = [];

      droppedFiles.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          errors.push(`${file.name}: ${error}`);
        } else {
          validFiles.push(file);
        }
      });

      if (errors.length > 0) {
        setUploadError(errors.join(", "));
        setTimeout(() => setUploadError(""), 5000);
      }

      if (validFiles.length > 0) {
        onFileChange(validFiles);
      }
    },
    [maxSize, onFileChange]
  );

  const handleFileInputChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = [];
    const errors = [];

    selectedFiles.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setUploadError(errors.join(", "));
      setTimeout(() => setUploadError(""), 5000);
    }

    if (validFiles.length > 0) {
      onFileChange(validFiles);
    }

    // Reset input to allow selecting same file again
    e.target.value = "";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        onClick={handleLabelClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          flex flex-col items-center justify-center w-full h-32
          border-2 border-dashed rounded-lg cursor-pointer
          transition-all duration-200 ease-in-out
          ${
            isDragging
              ? "border-[#003b75] bg-blue-50 scale-[1.02]"
              : "border-gray-300 bg-gray-50 hover:bg-gray-100"
          }
          ${error || uploadError ? "border-red-300" : ""}
          touch-manipulation
        `}
        role="button"
        tabIndex={0}
        aria-label="Click or drag files to upload"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleLabelClick();
          }
        }}
      >
        <div className="flex flex-col items-center justify-center p-5">
          <UploadCloud
            className={`w-8 h-8 mb-3 ${
              isDragging ? "text-[#003b75]" : "text-gray-400"
            }`}
          />
          <p className="mb-2 text-sm text-gray-600 text-center">
            <span className="font-semibold">Click to upload</span> or drag and
            drop
          </p>
          <p className="text-xs text-gray-500 text-center">
            Max {maxSize}MB per file •{" "}
            {acceptedTypes === "*/*" ? "Any format" : acceptedTypes}
          </p>
        </div>
        <input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
          accept={acceptedTypes}
          aria-invalid={!!error || !!uploadError}
        />
      </div>

      {(error || uploadError) && (
        <div className="mt-2 flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{error || uploadError}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800">Selected Files:</h4>
            <span className="text-sm text-gray-500">
              {files.length} file{files.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {Array.from(files).map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <Paperclip className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 ml-2" />
                </div>
                <button
                  type="button"
                  onClick={() => onFileRemove(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2 flex-shrink-0"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

FileInput.propTypes = {
  files: PropTypes.array.isRequired,
  onFileChange: PropTypes.func.isRequired,
  onFileRemove: PropTypes.func.isRequired,
  maxSize: PropTypes.number,
  acceptedTypes: PropTypes.string,
  label: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
};

export default memo(FileInput);
