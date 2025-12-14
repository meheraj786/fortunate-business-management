import React from "react";
import { X, Save } from "lucide-react";

const FormActions = ({
  onCancel,
  onSave,
  isSaving = false,
  saveText = "Save",
  cancelText = "Cancel",
}) => (
  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 shrink-0">
    <button
      type="button"
      onClick={onCancel}
      className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center space-x-2"
    >
      <X size={16} />
      <span>{cancelText}</span>
    </button>
    <button
      type="submit"
      className="px-6 py-2 bg-[#003b75] text-white rounded-lg hover:bg-[#002a54] transition-colors font-medium flex items-center space-x-2"
      disabled={isSaving}
    >
      <Save size={16} />
      <span>{isSaving ? "Saving..." : saveText}</span>
    </button>
  </div>
);

export default FormActions;
