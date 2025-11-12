import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FiChevronDown } from "react-icons/fi";
import CustomScrollbar from "./CustomScrollbar";

const Dropdown = ({
  options,
  selected,
  onSelect,
  placeholder,
  label,
  icon: Icon,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const optionsRef = useRef([]);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Reset focused index when dropdown closes
    if (!isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    // Scroll focused option into view when navigating with keyboard
    if (isOpen && focusedIndex >= 0 && optionsRef.current[focusedIndex]) {
      const focusedOption = optionsRef.current[focusedIndex];
      const scrollContainer = scrollContainerRef.current;

      if (scrollContainer && focusedOption) {
        const optionRect = focusedOption.getBoundingClientRect();
        const containerRect = scrollContainer.getBoundingClientRect();

        // Check if option is outside visible area
        if (optionRect.bottom > containerRect.bottom) {
          // Option is below visible area, scroll down
          focusedOption.scrollIntoView({ block: "nearest" });
        } else if (optionRect.top < containerRect.top) {
          // Option is above visible area, scroll up
          focusedOption.scrollIntoView({ block: "nearest" });
        }
      }
    }
  }, [focusedIndex, isOpen]);

  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
    setFocusedIndex(-1);
    // Return focus to button after selection
    buttonRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    switch (event.key) {
      case "Escape":
        setIsOpen(false);
        setFocusedIndex(-1);
        buttonRef.current?.focus();
        break;

      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          const nextIndex = (focusedIndex + 1) % options.length;
          setFocusedIndex(nextIndex);
        }
        break;

      case "ArrowUp":
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(options.length - 1);
        } else {
          const prevIndex =
            (focusedIndex - 1 + options.length) % options.length;
          setFocusedIndex(prevIndex);
        }
        break;

      case "Enter":
      case " ":
        event.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          handleSelect(options[focusedIndex]);
        } else if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        }
        break;

      case "Tab":
        if (isOpen) {
          setIsOpen(false);
          setFocusedIndex(-1);
        }
        break;

      case "Home":
        event.preventDefault();
        if (isOpen) {
          setFocusedIndex(0);
        }
        break;

      case "End":
        event.preventDefault();
        if (isOpen) {
          setFocusedIndex(options.length - 1);
        }
        break;

      default:
        // Handle character keys for quick navigation
        if (isOpen && event.key.length === 1) {
          const char = event.key.toLowerCase();
          const foundIndex = options.findIndex((option) =>
            option.toLowerCase().startsWith(char)
          );
          if (foundIndex !== -1) {
            setFocusedIndex(foundIndex);
          }
        }
        break;
    }
  };

  const handleOptionKeyDown = (event, option, index) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect(option);
    }
  };

  // Calculate max height for dropdown (5 items max)
  const getDropdownHeight = () => {
    const itemHeight = 48; // approx height of each option
    const maxVisibleItems = 4;
    const calculatedHeight =
      Math.min(options.length, maxVisibleItems) * itemHeight;
    return Math.max(calculatedHeight, itemHeight); // at least show one item
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && (
        <label
          id="dropdown-label"
          className="flex items-center text-sm font-medium text-gray-700 mb-2"
        >
          {Icon && <Icon className="mr-2 text-gray-400" />}
          {label}
        </label>
      )}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setFocusedIndex(isOpen ? -1 : 0);
        }}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? "dropdown-label" : undefined}
        aria-describedby={error ? "dropdown-error" : undefined}
        className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 appearance-none bg-white ${
          error
            ? "border-red-300 focus:ring-red-200"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
        }`}
      >
        <span className={selected ? "text-gray-800" : "text-gray-400"}>
          {selected || placeholder}
        </span>
        <FiChevronDown
          className={`transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
            role="listbox"
            aria-labelledby={label ? "dropdown-label" : undefined}
          >
            <div
              ref={scrollContainerRef}
              style={{ maxHeight: getDropdownHeight() }}
            >
              <CustomScrollbar>
                <div>
                  {options.map((option, index) => (
                    <div
                      key={option}
                      ref={(el) => (optionsRef.current[index] = el)}
                      onClick={() => handleSelect(option)}
                      onKeyDown={(event) =>
                        handleOptionKeyDown(event, option, index)
                      }
                      role="option"
                      aria-selected={selected === option}
                      tabIndex={-1}
                      className={`px-4 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors duration-150 ${
                        focusedIndex === index
                          ? "bg-blue-50 border-blue-200 border"
                          : ""
                      } ${selected === option ? "bg-gray-50 font-medium" : ""}`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </CustomScrollbar>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          id="dropdown-error"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 mt-1"
          role="alert"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Dropdown;
