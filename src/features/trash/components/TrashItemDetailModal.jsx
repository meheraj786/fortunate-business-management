import React, { memo, useEffect } from "react";
import PropTypes from "prop-types";
import { FileCode, Loader2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { useGetDetailById } from "@/api/hooks/trash";
import { useSettings } from "@/context/SettingsContext";

const TrashItemDetailModal = ({ isOpen, onClose, selectedItem }) => {
  const { formatDateTime } = useSettings();

  const { data, isLoading, isError } = useGetDetailById({
    model: selectedItem?.model,
    id: selectedItem?.trashId, // Using the trash entry ID
  });

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overflow-x-hidden p-4 sm:p-6" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div className="relative w-full max-w-4xl transform rounded-2xl bg-white text-left shadow-2xl transition-all flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shadow-sm">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                View Trashed {selectedItem?.model || "Item"}
              </h3>
              <p className="text-sm text-gray-500 font-mono mt-0.5">
                ID: {selectedItem?.docId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto bg-white flex-1 relative">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
              <p className="font-medium text-gray-500">
                Fetching complete record payload...
              </p>
            </div>
          ) : isError ? (
            <div className="text-center py-12 text-red-500 bg-red-50 rounded-xl border border-red-100">
              <p className="font-semibold text-lg">Failed to load item details.</p>
              <p className="text-sm mt-2 text-red-400">The connection dropped or the record is missing detailed history.</p>
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Deleted By
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {data.deletedBy?.name || "System"}
                    </p>
                    {data.deletedBy?.email && (
                      <p className="text-sm text-gray-500 mt-1">
                        {data.deletedBy.email}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Deletion Timestamp
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {data.deletedAt ? formatDateTime(data.deletedAt) : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* JSON Viewer */}
              <div className="bg-[#111827] rounded-xl overflow-hidden shadow-inner flex flex-col border border-gray-800">
                <div className="bg-black/50 px-5 py-3 border-b border-gray-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    <span className="ml-2 text-xs font-mono font-bold tracking-widest text-gray-400 uppercase">
                      Raw JSON Payload
                    </span>
                  </div>
                </div>
                <div className="p-5 overflow-x-auto max-h-[50vh] custom-scrollbar">
                  <pre className="text-[13px] leading-relaxed font-mono text-[#4ade80]">
                    {JSON.stringify(data.originalDoc || {}, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <FileCode className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 mb-1">No Data Available</p>
              <p className="text-gray-500">This record cannot be fully resolved.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end rounded-b-2xl shrink-0">
          <Button variant="secondary" onClick={onClose} className="px-6">
            Close Viewer
          </Button>
        </div>
        
      </div>
    </div>
  );
};TrashItemDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectedItem: PropTypes.shape({
    model: PropTypes.string,
    trashId: PropTypes.string,
    docId: PropTypes.string,
  }),
};

export default memo(TrashItemDetailModal);
