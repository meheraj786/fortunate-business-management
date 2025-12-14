import React, { useRef } from "react";
import { UploadCloud, Paperclip, X } from "lucide-react";

const FileInput = ({ files, onFileChange, onFileRemove }) => {
  const fileInputRef = useRef(null);

  const handleLabelClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Documents
      </label>
      <div className="flex items-center justify-center w-full">
        <div
          onClick={handleLabelClick}
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500">
              Any format (PDF, Excel, Image, etc.)
            </p>
          </div>
          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            multiple
            className="hidden"
            onChange={onFileChange}
          />
        </div>
      </div>
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-semibold text-gray-800">Selected Files:</h4>
          <ul className="space-y-2">
            {Array.from(files).map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-2 bg-gray-100 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <Paperclip className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onFileRemove(index)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileInput;
