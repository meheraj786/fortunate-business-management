import React from "react";

const TextAreaField = ({
  label,
  name,
  register,
  value,
  onChange,
  required = false,
  placeholder = "",
  rows = 3,
}) => {
  const props = register
    ? { ...register(name, { required }) }
    : { value: value || "", onChange };
  return (
    <div className="space-y-2">
      <label className="block text-start text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003b75] focus:border-transparent transition-all duration-200 resize-vertical"
        {...props}
      />
    </div>
  );
};

export default TextAreaField;
