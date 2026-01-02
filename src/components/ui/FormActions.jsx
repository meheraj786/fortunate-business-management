import React from "react";
import { X, Save } from "lucide-react";
import Button from "./Button"; // Import the new Button component

const FormActions = ({
  onCancel,
  onSave,
  isSaving = false,
  saveText = "Save",
  cancelText = "Cancel",
}) => (
  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 shrink-0">
    <Button
      type="button"
      onClick={onCancel}
      variant="secondary"
      disabled={isSaving}
      aria-label={cancelText}
    >
      <X size={16} />
      <span>{cancelText}</span>
    </Button>
    <Button
      type="submit"
      onClick={onSave}
      variant="primary"
      isLoading={isSaving}
      aria-label={isSaving ? "Saving..." : saveText}
    >
      <Save size={16} />
      <span>{isSaving ? "Saving..." : saveText}</span>
    </Button>
  </div>
);

export default FormActions;
