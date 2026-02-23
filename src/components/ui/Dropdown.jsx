import React, { Fragment, useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDown, Check, AlertCircle } from 'lucide-react';

// ── Tooltip sub-component (portal-based, works on hover & long-press) ──
const OptionTooltip = ({ text, anchorRect, visible }) => {
  if (!visible || !anchorRect || !text) return null;

  const gap = 6;
  const tooltipMaxWidth = 280;
  let top = anchorRect.top - gap;
  let left = anchorRect.left + anchorRect.width / 2;

  const showBelow = anchorRect.top < 50;
  if (showBelow) {
    top = anchorRect.bottom + gap;
  }

  if (left - tooltipMaxWidth / 2 < 8) left = tooltipMaxWidth / 2 + 8;
  if (left + tooltipMaxWidth / 2 > window.innerWidth - 8) left = window.innerWidth - tooltipMaxWidth / 2 - 8;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: showBelow ? top : undefined,
        bottom: showBelow ? undefined : (window.innerHeight - top),
        left,
        transform: 'translateX(-50%)',
        maxWidth: tooltipMaxWidth,
        zIndex: 10001,
        pointerEvents: 'none',
      }}
      className="px-2.5 py-1.5 text-xs bg-gray-900 text-white rounded-md shadow-lg whitespace-normal break-words leading-snug"
    >
      {text}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"
        style={showBelow ? { top: -3 } : { bottom: -3 }}
      />
    </div>,
    document.body
  );
};

// Inline styles for 2-line clamp (reliable cross-browser, doesn't depend on Tailwind)
const lineClamp2Style = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  wordBreak: 'break-word',
};

// ── Main Dropdown component ──
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
  const buttonRef = useRef(null);
  const optionsRef = useRef(null);
  const isOpenRef = useRef(false);
  const [portalStyle, setPortalStyle] = useState({});
  const [forceHidden, setForceHidden] = useState(false);
  const [tooltip, setTooltip] = useState({ visible: false, text: '', rect: null });
  const longPressTimer = useRef(null);

  const handleChange = (val) => {
    const actualValue = val && typeof val === 'object' && val.target ? val.target.value : val;
    if (onChange) onChange(actualValue);
    if (onSelect) onSelect(actualValue);
  };

  // Calculate fixed position for the portal-rendered options list
  const calculatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownMaxHeight = 260;
    const gap = 4;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < dropdownMaxHeight && rect.top > spaceBelow;

    setPortalStyle({
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
      ...(openUpward
        ? { bottom: window.innerHeight - rect.top + gap }
        : { top: rect.bottom + gap }),
    });
  }, []);

  // Hide dropdown on external scroll; ignore scrolls inside the options list
  useEffect(() => {
    const handleScroll = (e) => {
      setTooltip(t => t.visible ? { visible: false, text: '', rect: null } : t);

      // If the scroll is happening inside the dropdown options list itself, ignore
      if (optionsRef.current && optionsRef.current.contains(e.target)) return;

      // If dropdown is open, force-hide it so it doesn't float
      if (isOpenRef.current) {
        setForceHidden(true);
      }
    };

    const handleResize = () => {
      setTooltip(t => t.visible ? { visible: false, text: '', rect: null } : t);
      if (isOpenRef.current) {
        setForceHidden(true);
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Hover handlers (desktop)
  const handleMouseEnter = useCallback((e, text) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ visible: true, text, rect });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip({ visible: false, text: '', rect: null });
  }, []);

  // Long-press handlers (mobile touch)
  const handleTouchStart = useCallback((e, text) => {
    const rect = e.currentTarget.getBoundingClientRect();
    longPressTimer.current = setTimeout(() => {
      setTooltip({ visible: true, text, rect });
    }, 500);
  }, []);

  const handleTouchEnd = useCallback(() => {
    clearTimeout(longPressTimer.current);
    setTimeout(() => {
      setTooltip({ visible: false, text: '', rect: null });
    }, 1500);
  }, []);

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
    let valToMatch = currentValue;
    if (valToMatch && typeof valToMatch === 'object') {
      valToMatch = valToMatch?.target?.value ?? valToMatch?._id ?? valToMatch?.value ?? valToMatch;
    }

    return normalizedOptions.find(opt => {
      const optVal = opt.value;
      return optVal === valToMatch ||
        (optVal != null && valToMatch != null && String(optVal) === String(valToMatch));
    }) || null;
  }, [currentValue, normalizedOptions]);

  const getDisplayLabel = (option) => formatLabel ? formatLabel(option) : option.label;

  return (
    <Listbox value={currentValue} onChange={handleChange} disabled={disabled || loading} name={name}>
      {({ open }) => {
        // Sync open state to ref for scroll handler
        isOpenRef.current = open;

        // When dropdown opens, recalculate position and clear forceHidden
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (open) {
            setForceHidden(false);
            calculatePosition();
          } else {
            setForceHidden(false);
            setTooltip({ visible: false, text: '', rect: null });
          }
        }, [open, calculatePosition]);

        // Whether to actually show the dropdown list
        const showDropdown = open && !forceHidden;

        return (
          <div className={`relative ${className}`}>
            {label && (
              <Listbox.Label
                className="flex items-center text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
              >
                {label}
              </Listbox.Label>
            )}
            <Listbox.Button
              ref={buttonRef}
              id={id}
              className={`
                relative w-full text-left bg-white
                border rounded-lg
                px-4 pr-10 py-3
                sm:px-3 sm:pr-10 sm:py-2
                min-h-[44px] sm:min-h-[38px]
                focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
                transition-all duration-200
                active:scale-[0.99]
                ${disabled || loading ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'cursor-pointer'}
                ${Icon ? 'pl-10 sm:pl-10' : ''}
                ${error ? 'border-[var(--color-danger-light)] focus:ring-[var(--color-danger)]' : 'border-gray-300'}
                text-base sm:text-sm
              `}
            >
              {Icon && (
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Icon className="w-5 h-5 sm:w-4 sm:h-4" aria-hidden="true" />
                </span>
              )}

              <span className={`block truncate ${!selectedOption && !loading ? 'text-gray-500' : 'text-gray-900'}`}>
                {loading
                  ? 'Loading...'
                  : selectedOption
                    ? (formatLabel ? formatLabel(selectedOption) : selectedOption.label)
                    : (placeholder || '\u00A0')}
              </span>

              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--color-primary)]" />
                ) : error ? (
                  <AlertCircle className="w-4 h-4 text-[var(--color-danger)] mr-6" aria-hidden="true" />
                ) : null}
                {!loading && (
                  <ChevronDown
                    className={`w-5 h-5 sm:w-4 sm:h-4 text-gray-400 transition-transform duration-200 ${open ? 'transform rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                )}
              </span>
            </Listbox.Button>

            {/* Portal: only render the dropdown list when showDropdown is true */}
            {createPortal(
              showDropdown ? (
                <Listbox.Options
                  ref={optionsRef}
                  static
                  style={portalStyle}
                  className="py-1 overflow-auto text-base sm:text-sm bg-white rounded-lg shadow-xl max-h-60 focus:outline-none border border-gray-200 overscroll-contain animate-in fade-in duration-100"
                >
                  {normalizedOptions.length === 0 ? (
                    <div className="relative cursor-default select-none py-3 px-4 text-gray-500 text-center">
                      No options available
                    </div>
                  ) : (
                    normalizedOptions.map((option, index) => {
                      const labelText = getDisplayLabel(option);
                      return (
                        <Listbox.Option
                          key={option.value || index}
                          className={({ active }) =>
                            `relative cursor-pointer select-none
                            py-3 sm:py-2 pl-3 pr-9
                            min-h-[44px] sm:min-h-[36px] flex items-center
                            transition-colors duration-100
                            ${active ? 'bg-blue-50 text-[var(--color-primary)]' : 'text-gray-900'}
                            active:bg-blue-100`
                          }
                          value={option.value}
                          title={labelText}
                          onMouseEnter={(e) => handleMouseEnter(e, labelText)}
                          onMouseLeave={handleMouseLeave}
                          onTouchStart={(e) => handleTouchStart(e, labelText)}
                          onTouchEnd={handleTouchEnd}
                          onTouchCancel={handleTouchEnd}
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={`block w-full pr-6 ${selected ? 'font-semibold' : 'font-normal'}`}
                                style={lineClamp2Style}
                              >
                                {labelText}
                              </span>
                              {selected && (
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--color-primary)]">
                                  <Check className="w-4 h-4" aria-hidden="true" />
                                </span>
                              )}
                            </>
                          )}
                        </Listbox.Option>
                      );
                    })
                  )}
                </Listbox.Options>
              ) : null,
              document.body
            )}

            {/* Tooltip portal */}
            <OptionTooltip
              text={tooltip.text}
              anchorRect={tooltip.rect}
              visible={tooltip.visible}
            />

            {error && (
              <p className="text-sm text-[var(--color-danger)] mt-1" role="alert">
                {error}
              </p>
            )}
          </div>
        );
      }}
    </Listbox>
  );
};

export default Dropdown;
