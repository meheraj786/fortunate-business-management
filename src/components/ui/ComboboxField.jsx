import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useId,
  memo,
} from "react";
import { createPortal } from "react-dom";
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
  ComboboxButton,
} from "@headlessui/react";
import { Controller } from "react-hook-form";
import { ChevronDown, Check, AlertCircle, Search, Loader2 } from "lucide-react";
import PropTypes from "prop-types";

// ── Debounce helper ──
function useDebounceValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ── Core Combobox Component ──
const ComboboxCore = ({
  value,
  onChange,
  options: localOptions,
  fetchOptions,
  placeholder = "Search...",
  disabled = false,
  error,
  className = "",
  icon: Icon,
  loading: externalLoading = false,
  displayValue,
  minChars = 0,
  debounceMs = 300,
  name,
  id,
  label,
  required,
  initialOption,
}) => {
  const componentId = useId();
  const inputId = id || `${componentId}-${name}`;
  const errorId = `${inputId}-error`;
  const buttonRef = useRef(null);
  const optionsRef = useRef(null);
  const [query, setQuery] = useState("");
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [asyncLoading, setAsyncLoading] = useState(false);
  const [portalStyle, setPortalStyle] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [forceHidden, setForceHidden] = useState(false);
  const debouncedQuery = useDebounceValue(query, debounceMs);

  // Cache of selected options so their labels survive async re-fetches
  const selectedCacheRef = useRef(new Map());

  // Seed the cache with initialOption on mount (for edit mode)
  useEffect(() => {
    if (initialOption && initialOption.value != null) {
      selectedCacheRef.current.set(String(initialOption.value), initialOption);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isAsync = typeof fetchOptions === "function";
  const isLoading = externalLoading || asyncLoading;

  // Normalize options to {value, label} shape
  const normalizeOptions = useCallback((opts) => {
    if (!opts || !Array.isArray(opts)) return [];
    return opts.map((opt) => {
      if (typeof opt === "object" && opt !== null) {
        return {
          value: opt._id ?? opt.value ?? opt,
          label: opt.name ?? opt.label ?? String(opt),
          _raw: opt,
        };
      }
      return { value: opt, label: String(opt) };
    });
  }, []);

  const normalizedLocalOptions = useMemo(
    () => normalizeOptions(localOptions),
    [localOptions, normalizeOptions]
  );

  // Async fetch
  useEffect(() => {
    if (!isAsync) return;

    // If query is empty or below minChars, fetch initial results (Option A)
    if (debouncedQuery.length < minChars && minChars > 0) {
      return;
    }

    let cancelled = false;
    const doFetch = async () => {
      setAsyncLoading(true);
      try {
        const results = await fetchOptions(debouncedQuery);
        if (!cancelled) {
          const normalized = normalizeOptions(results);
          setAsyncOptions(normalized);
          // Update the selected cache with any fetched options
          normalized.forEach((opt) => {
            if (opt.value != null) {
              selectedCacheRef.current.set(String(opt.value), opt);
            }
          });
        }
      } catch {
        if (!cancelled) setAsyncOptions([]);
      } finally {
        if (!cancelled) setAsyncLoading(false);
      }
    };
    doFetch();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, fetchOptions, isAsync, minChars, normalizeOptions]);

  // Filter local options client-side
  const filteredOptions = useMemo(() => {
    if (isAsync) return asyncOptions;

    if (!query) return normalizedLocalOptions;
    const q = query.toLowerCase();
    return normalizedLocalOptions.filter((opt) =>
      opt.label.toLowerCase().includes(q)
    );
  }, [isAsync, asyncOptions, normalizedLocalOptions, query]);

  // Find selected option from either source
  const selectedOption = useMemo(() => {
    if (!value && value !== 0) return null;

    const searchIn = isAsync
      ? [...asyncOptions, ...normalizedLocalOptions]
      : normalizedLocalOptions;

    return (
      searchIn.find((opt) => {
        return (
          opt.value === value ||
          (opt.value != null &&
            value != null &&
            String(opt.value) === String(value))
        );
      }) || null
    );
  }, [value, isAsync, asyncOptions, normalizedLocalOptions]);

  // Calculate position for portal
  const calculatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const maxHeight = 280;
    const gap = 4;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < maxHeight && rect.top > spaceBelow;

    setPortalStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
      ...(openUpward
        ? { bottom: window.innerHeight - rect.top + gap }
        : { top: rect.bottom + gap }),
    });
  }, []);

  // Hide on external scroll
  useEffect(() => {
    const handleScroll = (e) => {
      if (optionsRef.current && optionsRef.current.contains(e.target)) return;
      if (isOpen) setForceHidden(true);
    };
    const handleResize = () => {
      if (isOpen) setForceHidden(true);
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  const handleOpenChange = useCallback(
    (open) => {
      setIsOpen(open);
      if (open) {
        setForceHidden(false);
        calculatePosition();
        // Trigger initial fetch if async and no results yet
        if (isAsync && asyncOptions.length === 0 && !asyncLoading) {
          const doFetch = async () => {
            setAsyncLoading(true);
            try {
              const results = await fetchOptions("");
              const normalized = normalizeOptions(results);
              setAsyncOptions(normalized);
              // Update the selected cache with initial fetch results
              normalized.forEach((opt) => {
                if (opt.value != null) {
                  selectedCacheRef.current.set(String(opt.value), opt);
                }
              });
            } catch {
              /* ignore */
            } finally {
              setAsyncLoading(false);
            }
          };
          doFetch();
        }
      } else {
        setQuery("");
      }
    },
    [
      calculatePosition,
      isAsync,
      asyncOptions.length,
      asyncLoading,
      fetchOptions,
      normalizeOptions,
    ]
  );

  const handleChange = useCallback(
    (val) => {
      // Cache the selected option's label before passing the value up
      if (val != null) {
        const allOpts = isAsync
          ? [...asyncOptions, ...normalizedLocalOptions]
          : normalizedLocalOptions;
        const matched = allOpts.find(
          (o) =>
            o.value === val ||
            (o.value != null && String(o.value) === String(val))
        );
        if (matched) {
          selectedCacheRef.current.set(String(val), matched);
        }
      }
      if (onChange) onChange(val);
    },
    [onChange, isAsync, asyncOptions, normalizedLocalOptions]
  );

  const getDisplayValue = useCallback(
    (val) => {
      if (displayValue) return displayValue(val) || "";
      if (!val && val !== 0) return "";

      const searchIn = isAsync
        ? [...asyncOptions, ...normalizedLocalOptions]
        : normalizedLocalOptions;

      const opt = searchIn.find(
        (o) =>
          o.value === val ||
          (o.value != null && val != null && String(o.value) === String(val))
      );
      if (opt) return opt.label;

      // Fallback: check the selection cache (survives async re-fetches)
      const cached = selectedCacheRef.current.get(String(val));
      if (cached) return cached.label;

      return String(val);
    },
    [displayValue, isAsync, asyncOptions, normalizedLocalOptions]
  );

  const showDropdown = isOpen && !forceHidden;

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="flex items-center text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
        >
          {label}
          {required && (
            <span className="text-[var(--color-danger)] ml-1">*</span>
          )}
        </label>
      )}
      <Combobox
        value={value}
        onChange={handleChange}
        disabled={disabled || externalLoading}
        name={name}
        immediate
      >
        {({ open }) => {
          // Sync open with our state
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useEffect(() => {
            handleOpenChange(open);
          }, [open]);

          return (
            <>
              <div ref={buttonRef} className="relative">
                {Icon && (
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 z-10">
                    <Icon
                      className="w-5 h-5 sm:w-4 sm:h-4"
                      aria-hidden="true"
                    />
                  </span>
                )}
                <ComboboxInput
                  id={inputId}
                  className={`
                    relative w-full text-left bg-white
                    border rounded-lg
                    px-4 pr-10 py-3
                    sm:px-3 sm:pr-10 sm:py-2
                    min-h-[44px] sm:min-h-[38px]
                    focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
                    transition-all duration-200
                    ${
                      disabled || externalLoading
                        ? "bg-gray-100 cursor-not-allowed opacity-60"
                        : ""
                    }
                    ${Icon ? "pl-10 sm:pl-10" : ""}
                    ${
                      error
                        ? "border-[var(--color-danger-light)] focus:ring-[var(--color-danger)]"
                        : "border-gray-300"
                    }
                    text-base sm:text-sm
                  `}
                  displayValue={(val) => getDisplayValue(val)}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={placeholder}
                  aria-invalid={!!error}
                  aria-describedby={error ? errorId : undefined}
                  autoComplete="off"
                />
                <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {isLoading ? (
                    <Loader2
                      className="w-4 h-4 text-gray-400 animate-spin"
                      aria-hidden="true"
                    />
                  ) : error ? (
                    <AlertCircle
                      className="w-4 h-4 text-[var(--color-danger)] mr-1"
                      aria-hidden="true"
                    />
                  ) : null}
                  <ChevronDown
                    className={`w-5 h-5 sm:w-4 sm:h-4 text-gray-400 transition-transform duration-200 ${
                      open ? "transform rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </ComboboxButton>
              </div>

              {/* Portal dropdown */}
              {createPortal(
                showDropdown ? (
                  <ComboboxOptions
                    ref={optionsRef}
                    static
                    style={portalStyle}
                    className="py-1 overflow-auto text-base sm:text-sm bg-white rounded-lg shadow-xl max-h-60 focus:outline-none border border-gray-200 overscroll-contain animate-in fade-in duration-100"
                  >
                    {isLoading && filteredOptions.length === 0 ? (
                      <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Searching...
                      </div>
                    ) : filteredOptions.length === 0 ? (
                      <div className="relative cursor-default select-none py-4 px-4 text-gray-500 text-center text-sm">
                        {query
                          ? "No results found"
                          : "Type to search..."}
                      </div>
                    ) : (
                      filteredOptions.map((option, index) => (
                        <ComboboxOption
                          key={`${option.value}-${index}`}
                          value={option.value}
                          className={({ focus, selected }) =>
                            `relative cursor-pointer select-none
                            py-3 sm:py-2 pl-3 pr-9
                            min-h-[44px] sm:min-h-[36px] flex items-center
                            transition-colors duration-100
                            ${
                              focus
                                ? "bg-blue-50 text-[var(--color-primary)]"
                                : "text-gray-900"
                            }
                            ${selected ? "font-semibold" : "font-normal"}
                            active:bg-blue-100`
                          }
                        >
                          {({ selected }) => (
                            <>
                              <span className="block truncate w-full pr-6">
                                {option.label}
                              </span>
                              {selected && (
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--color-primary)]">
                                  <Check
                                    className="w-4 h-4"
                                    aria-hidden="true"
                                  />
                                </span>
                              )}
                            </>
                          )}
                        </ComboboxOption>
                      ))
                    )}
                    {isLoading && filteredOptions.length > 0 && (
                      <div className="flex items-center justify-center gap-2 py-2 text-xs text-gray-400 border-t border-gray-100">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Loading more...
                      </div>
                    )}
                  </ComboboxOptions>
                ) : null,
                document.body
              )}
            </>
          );
        }}
      </Combobox>
      {error && (
        <p
          id={errorId}
          className="text-sm text-[var(--color-danger)] mt-1"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

// ── ComboboxField — wraps ComboboxCore with RHF Controller support ──
const ComboboxField = ({
  control,
  name,
  required = false,
  validation,
  onChange: externalOnChange,
  ...rest
}) => {
  if (!control) {
    return <ComboboxCore name={name} required={required} onChange={externalOnChange} {...rest} />;
  }

  const rules = {
    ...(required
      ? {
          required:
            validation?.required ||
            `${rest.label || "Field"} is required`,
        }
      : {}),
    ...validation,
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <ComboboxCore
          name={name}
          required={required || !!validation?.required}
          value={field.value}
          onChange={(val) => {
            field.onChange(val);
            if (externalOnChange) externalOnChange(val);
          }}
          error={rest.error || fieldState.error?.message}
          {...rest}
        />
      )}
    />
  );
};

ComboboxField.propTypes = {
  label: PropTypes.node,
  name: PropTypes.string.isRequired,
  control: PropTypes.object,
  value: PropTypes.any,
  onChange: PropTypes.func,
  options: PropTypes.array,
  fetchOptions: PropTypes.func,
  required: PropTypes.bool,
  validation: PropTypes.object,
  icon: PropTypes.elementType,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  loading: PropTypes.bool,
  displayValue: PropTypes.func,
  minChars: PropTypes.number,
  debounceMs: PropTypes.number,
  initialOption: PropTypes.shape({
    value: PropTypes.any.isRequired,
    label: PropTypes.string.isRequired,
  }),
};

export default memo(ComboboxField);
