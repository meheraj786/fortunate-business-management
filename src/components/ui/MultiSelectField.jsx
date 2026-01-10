import React from "react";
import Select from "react-select";
import PropTypes from "prop-types";

const MultiSelectField = ({
  label,
  name,
  options,
  value,
  onChange,
  error,
  placeholder = "Select...",
  disabled = false,
  required = false,
}) => {
  const selectOptions = options;

  const handleChange = (selectedOptions) => {
    onChange(selectedOptions.map((option) => option.value));
  };

  const selectedValues = selectOptions.filter((option) =>
    value?.includes(option.value)
  );
  
  const primaryColor = "rgb(0, 51, 102)";

  return (
    <div className="space-y-2">
      {label && (
        <label className="flex items-start text-sm font-medium text-gray-700">
          {label}
          {required && (
            <span className="text-[var(--color-danger)] ml-1">*</span>
          )}
        </label>
      )}
      <Select
        isMulti
        name={name}
        options={selectOptions}
        value={selectedValues}
        onChange={handleChange}
        placeholder={placeholder}
        isDisabled={disabled}
        styles={{
            control: (base, state) => ({
              ...base,
              borderColor: error ? "var(--color-danger-light)" : "hsl(0, 0%, 80%)",
              "&:hover": {
                borderColor: state.isFocused ? primaryColor : "hsl(0, 0%, 70%)",
              },
              boxShadow: state.isFocused ? `0 0 0 1px ${primaryColor}` : "none",
            }),
            multiValue: (base) => ({
              ...base,
              backgroundColor: primaryColor,
              color: "white",
            }),
            multiValueLabel: (base) => ({
              ...base,
              color: "white",
            }),
            multiValueRemove: (base) => ({
              ...base,
              color: "white",
              ":hover": {
                backgroundColor: "var(--color-danger)",
                color: "white",
              },
            }),
            menuPortal: (base) => ({ ...base, zIndex: 9999 })
          }}
          menuPortalTarget={document.body}
      />
      {error && <p className="text-sm text-[var(--color-danger)] mt-1">{error}</p>}
    </div>
  );
};

MultiSelectField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  value: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
};

export default MultiSelectField;
