import { motion } from "framer-motion";
import React, { memo, useId } from "react";
import PropTypes from "prop-types";
import { AlertCircle } from "lucide-react";

const InputField = ({
  label,
  name,
  register,
  type = "text",
  value,
  onChange,
  required = false,
  validation,
  placeholder = "",
  icon: Icon,
  min,
  max,
  step,
  disabled = false,
  error,
  className = "",
  inputClassName = "",
  autoComplete = "off",
  children,
}) => {
  const id = useId();
  const errorId = `${id}-error`;

  const inputProps = register
    ? { ...register(name, { required, ...validation }) }
    : {
        value: value || "",
        onChange,
        id: `${id}-${name}`,
      };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label
          htmlFor={`${id}-${name}`}
          className="flex items-start text-sm font-medium text-gray-700"
        >
          {label}
          {(required || validation?.required) && (
            <span className="text-[var(--color-danger)] ml-1">*</span>
          )}
        </label>
      )}
      <motion.div className="relative" whileFocus={{ scale: 1.02 }}>
        {Icon && (
          <div
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
            aria-hidden="true"
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        )}
        <input
          id={`${id}-${name}`}
          type={type}
          required={required}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`
            w-full px-4 py-3 sm:px-3 sm:py-2
            border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
            transition-all duration-200
            disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60
            ${Icon ? "pl-10 sm:pl-12" : ""}
            ${error ? "border-[var(--color-danger-light)] focus:ring-[var(--color-danger)]" : "border-gray-300"}
            placeholder:text-gray-400
            text-base sm:text-sm
            ${inputClassName}
          `}
          {...inputProps}
        />
        {children}
        {error && (
          <div
            id={errorId}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            aria-hidden="true"
          >
            <AlertCircle className="w-4 h-4 text-[var(--color-danger)]" />
          </div>
        )}
      </motion.div>
      {error && (
        <p id={errorId} className="text-sm text-[var(--color-danger)] mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

InputField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  register: PropTypes.func,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  required: PropTypes.bool,
  validation: PropTypes.object,
  placeholder: PropTypes.string,
  icon: PropTypes.elementType,
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  disabled: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  autoComplete: PropTypes.string,
  children: PropTypes.node,
};

export default memo(InputField);
