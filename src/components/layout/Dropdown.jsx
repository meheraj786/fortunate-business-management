import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FiChevronDown } from 'react-icons/fi';
import CustomScrollbar from './CustomScrollbar';

const Dropdown = ({ options, selected, onSelect, placeholder, label, icon: Icon, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && (
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          {Icon && <Icon className="mr-2 text-gray-400" />}
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 appearance-none bg-white ${
          error
            ? 'border-red-300 focus:ring-red-200'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
        }`}
      >
        <span className={selected ? 'text-gray-800' : 'text-gray-400'}>
          {selected || placeholder}
        </span>
        <FiChevronDown
          className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
          >
            <CustomScrollbar style={{ height: Math.min(options.length * 48, 240) }}>
              {options.map((option) => (
                <div
                  key={option}
                  onClick={() => handleSelect(option)}
                  className="px-4 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                >
                  {option}
                </div>
              ))}
            </CustomScrollbar>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Dropdown;