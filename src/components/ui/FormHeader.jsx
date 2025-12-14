import React from "react";
import { X, Package } from "lucide-react";

const FormHeader = ({ title, subtitle, onClose }) => (
  <div className="bg-[#003b75] text-white p-6 flex items-center justify-between shrink-0">
    <div className="flex items-center space-x-3">
      <Package className="w-6 h-6" />
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-blue-100 text-sm">{subtitle}</p>
      </div>
    </div>
    <button
      onClick={onClose}
      className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
    >
      <X className="w-5 h-5" />
    </button>
  </div>
);

export default FormHeader;
