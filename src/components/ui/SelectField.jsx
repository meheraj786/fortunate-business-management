import React, { memo, useId, useMemo } from "react";
import PropTypes from "prop-types";
import { ChevronDown, AlertCircle } from "lucide-react";

const SelectField = ({
  label,
  name,
  register,
  value,
  onChange,
  options,
  required = false,
  validation,
  icon: Icon,
  disabled = false,
  error,
  className = "",
  placeholder = "",
  loading = false,
}) => {
  const id = useId();
  const errorId = `${id}-error`;

  const selectProps = register
    ? { ...register(name, { required, ...validation }) }
    : {
        value: value || "",
        onChange,
        id: `${id}-${name}`,
      };

  const displayValue = useMemo(() => {
    if (!value) return placeholder || `Select ${label}`;
    const option = options.find(
      (opt) => opt._id === value || opt.value === value || opt === value
    );
    return option?.name || option?.label || option || value;
  }, [value, options, label, placeholder]);

  return (
    <div className={`space-y-2 relative ${className}`}>
      {label && (
        <label
          htmlFor={`${id}-${name}`}
          className="flex items-start text-sm font-medium text-gray-700"
        >
          {label}
          {(required || validation?.required) && <span className="text-[var(--color-danger)] ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10"
            aria-hidden="true"
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        )}
        <select
          id={`${id}-${name}`}
          name={name}
          required={required}
          disabled={disabled || loading}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          aria-busy={loading}
          className={`
            w-full px-4 py-3 sm:px-3 sm:py-2 pr-10
            border rounded-lg appearance-none
            focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
            transition-all duration-200
            disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60
            ${Icon ? "pl-10 sm:pl-12" : ""}
            ${error ? "border-[var(--color-danger-light)] focus:ring-[var(--color-danger)]" : "border-gray-300"}
            text-base sm:text-sm
            bg-white
            cursor-pointer
          `}
          {...selectProps}
        >
          <option value="">
            {loading ? "Loading..." : placeholder || `Select ${label}`}
          </option>
          {options.map((option, index) => {
            const optionValue = option._id || option.value || option;
            const optionLabel = option.name || option.label || option;
            return (
              <option
                value={optionValue}
                key={option._id || option.value || index}
                className="py-2"
              >
                {optionLabel}
              </option>
            );
          })}
        </select>

        <div
          className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400"
          aria-hidden="true"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--color-primary)]" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
        {error && (
          <div
            id={errorId}
            className="absolute right-10 top-1/2 transform -translate-y-1/2"
            aria-hidden="true"
          >
            <AlertCircle className="w-4 h-4 text-[var(--color-danger)]" />
          </div>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-sm text-[var(--color-danger)] mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

SelectField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  register: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  options: PropTypes.array.isRequired,
  required: PropTypes.bool,
  icon: PropTypes.elementType,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  loading: PropTypes.bool,
};

export default memo(SelectField);
