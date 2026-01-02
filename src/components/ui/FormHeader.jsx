import React from "react";
import { X, Package } from "lucide-react";
import Button from "./Button"; // Import the Button component

const FormHeader = ({ title, subtitle, onClose }) => (
  <div className="bg-[var(--color-primary)] text-white p-6 flex items-center justify-between shrink-0">
    <div className="flex items-center space-x-3">
      <Package className="w-6 h-6" />
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-[var(--color-primary-light)] text-sm">{subtitle}</p>
      </div>
    </div>
    <Button
      onClick={onClose}
      variant="subtle"
      className="!p-2 hover:bg-[var(--color-primary-hover)] rounded-lg transition-colors"
      aria-label="Close form"
    >
      <X className="w-5 h-5" />
    </Button>
  </div>
);

export default FormHeader;
