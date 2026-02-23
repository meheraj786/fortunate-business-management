import React, { memo, useId } from "react";
import PropTypes from "prop-types";
import { Controller } from "react-hook-form";
import Dropdown from "./Dropdown";

const SelectField = ({
  label,
  name,
  control,     // Replaces `register`
  value,
  onChange,
  onSelect,    // Legacy prop
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

  // Standard non-RHF usage
  if (!control) {
    return (
      <Dropdown
        id={`${id}-${name}`}
        name={name}
        label={
          label ? (
            <>
              {label}
              {required && <span className="text-[var(--color-danger)] ml-1">*</span>}
            </>
          ) : undefined
        }
        value={value}
        onChange={onChange}
        onSelect={onSelect}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        className={className}
        icon={Icon}
        loading={loading}
      />
    );
  }

  // RHF usage with Controller
  const rules = {
    ...(required ? { required: validation?.required || `${label || 'Field'} is required` } : {}),
    ...validation,
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <Dropdown
          id={`${id}-${name}`}
          name={name}
          label={
            label ? (
              <>
                {label}
                {(required || validation?.required) && (
                  <span className="text-[var(--color-danger)] ml-1">*</span>
                )}
              </>
            ) : undefined
          }
          value={field.value}
          onChange={(val) => {
            field.onChange(val);
            if (onChange) onChange(val);
          }}
          options={options}
          placeholder={placeholder}
          disabled={disabled}
          error={error || fieldState.error?.message}
          className={className}
          icon={Icon}
          loading={loading}
        />
      )}
    />
  );
};

SelectField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  control: PropTypes.object,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onSelect: PropTypes.func,
  options: PropTypes.array.isRequired,
  required: PropTypes.bool,
  validation: PropTypes.object,
  icon: PropTypes.elementType,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  loading: PropTypes.bool,
};

export default memo(SelectField);
