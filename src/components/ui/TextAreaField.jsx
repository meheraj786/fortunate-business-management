import React, { memo, useId, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { AlertCircle } from "lucide-react";

const TextAreaField = ({
  label,
  name,
  register,
  value,
  onChange,
  required = false,
  placeholder = "",
  rows = 3,
  maxRows = 10,
  error,
  className = "",
  autoResize = true,
}) => {
  const id = useId();
  const errorId = `${id}-error`;
  const textareaRef = useRef(null);

  const textareaProps = register
    ? register(name, { required })
    : {
        value: value || "",
        onChange,
        id: `${id}-${name}`,
      };

  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = "auto";

      const maxHeight = maxRows * 24; // 24px per row
      const scrollHeight = textarea.scrollHeight;

      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
    }
  }, [value, autoResize, maxRows]);

  const handleChange = (e) => {
    if (onChange) onChange(e);
    if (register && textareaProps.onChange) textareaProps.onChange(e);

    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = "auto";

      const maxHeight = maxRows * 24;
      const scrollHeight = textarea.scrollHeight;

      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
    }
  };

  const props = register
    ? {
        ...textareaProps,
        onChange: handleChange,
        ref: (e) => {
          if (textareaProps.ref) textareaProps.ref(e);
          textareaRef.current = e;
        },
      }
    : { ...textareaProps, ref: textareaRef, onChange: handleChange };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label
          htmlFor={`${id}-${name}`}
          className="block text-start text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-[var(--color-danger)] ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <textarea
          id={`${id}-${name}`}
          name={name}
          required={required}
          placeholder={placeholder}
          rows={rows}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`
            w-full px-3 py-2.5 sm:py-2
            border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
            transition-all duration-200
            ${error ? "border-[var(--color-danger-light)] focus:ring-[var(--color-danger)]" : "border-gray-300"}
            placeholder:text-gray-400
            text-base sm:text-sm
            resize-none
            min-h-[${rows * 24}px]
          `}
          style={{ minHeight: `${rows * 24}px` }}
          {...props}
        />
        {error && (
          <div
            id={errorId}
            className="absolute right-3 top-3"
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

TextAreaField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  register: PropTypes.func,
  value: PropTypes.string,
  onChange: PropTypes.func,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  rows: PropTypes.number,
  maxRows: PropTypes.number,
  error: PropTypes.string,
  className: PropTypes.string,
  autoResize: PropTypes.bool,
};

export default memo(TextAreaField);
