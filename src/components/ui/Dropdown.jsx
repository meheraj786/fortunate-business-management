import React, { Fragment, useMemo } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDown, Check, AlertCircle } from 'lucide-react';

const Dropdown = ({
  value,
  onChange,
  onSelect, // legacy support
  options = [],
  placeholder = 'Select an option',
  disabled = false,
  error,
  className = '',
  icon: Icon,
  loading = false,
  formatLabel,
  name,
  id,
  label // legacy support
}) => {
  // Support both onSelect and onChange
  const handleChange = (val) => {
    if (onChange) onChange(val);
    if (onSelect) onSelect(val);
  };

  // Support legacy selected prop
  const currentValue = value;

  // Normalize options to ensure they always have label and value
  const normalizedOptions = useMemo(() => {
    return options.map(option => {
      if (typeof option === 'object' && option !== null) {
        return {
          value: option._id ?? option.value ?? option,
          label: option.name ?? option.label ?? option.toString()
        };
      }
      return { value: option, label: String(option) };
    });
  }, [options]);

  const selectedOption = useMemo(() => {
    return normalizedOptions.find(opt => opt.value === currentValue) || null;
  }, [currentValue, normalizedOptions]);

  return (
    <Listbox value={currentValue} onChange={handleChange} disabled={disabled || loading} name={name}>
      {({ open }) => (
        <div className={`relative ${className}`}>
          {label && (
            <Listbox.Label
              className="flex items-center text-sm font-medium text-gray-700 mb-2"
            >
              {label}
            </Listbox.Label>
          )}
          <Listbox.Button
            id={id}
            className={`
              relative w-full text-left bg-white
              border rounded-lg shadow-sm
              pl-4 sm:pl-3 pr-10 py-3 sm:py-2
              focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
              transition-all duration-200
              ${disabled || loading ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'cursor-pointer'}
              ${Icon ? 'pl-10 sm:pl-12' : ''}
              ${error ? 'border-[var(--color-danger-light)] focus:ring-[var(--color-danger)]' : 'border-gray-300'}
              text-base sm:text-sm
            `}
          >
            {Icon && (
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              </span>
            )}

            <span className={`block truncate ${!selectedOption && !loading ? 'text-gray-500' : 'text-gray-900'}`}>
              {loading
                ? 'Loading...'
                : selectedOption
                  ? (formatLabel ? formatLabel(selectedOption) : selectedOption.label)
                  : placeholder}
            </span>

            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--color-primary)]" />
              ) : error ? (
                <AlertCircle className="w-4 h-4 text-[var(--color-danger)] mr-6" aria-hidden="true" />
              ) : null}
              {!loading && (
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'transform rotate-180' : ''}`}
                  aria-hidden="true"
                />
              )}
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-50 w-full py-1 mt-1 overflow-auto text-base sm:text-sm bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100">
              {normalizedOptions.length === 0 ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-500 text-center">
                  No options available
                </div>
              ) : (
                normalizedOptions.map((option, index) => (
                  <Listbox.Option
                    key={option.value || index}
                    className={({ active }) =>
                      `relative cursor-pointer select-none py-2 pl-3 pr-9 ${active ? 'bg-blue-50 text-[var(--color-primary)]' : 'text-gray-900'
                      }`
                    }
                    value={option.value}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          {formatLabel ? formatLabel(option) : option.label}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 right-0 flex items-center pr-3 ${active ? 'text-[var(--color-primary)]' : 'text-[var(--color-primary)]'
                              }`}
                          >
                            <Check className="w-4 h-4" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))
              )}
            </Listbox.Options>
          </Transition>

          {error && (
            <p className="text-sm text-[var(--color-danger)] mt-1" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </Listbox>
  );
};

export default Dropdown;
