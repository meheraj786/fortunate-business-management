import React from 'react';

const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder = "",
  icon: Icon,
  min,
  max,
  step,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          name={name}
          type={type}
          value={value || ''}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003b75] focus:border-transparent transition-all duration-200 ${
            Icon ? "pl-10" : ""
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        />
      </div>
    </div>
  );
};

export default InputField;