import React, { memo, useCallback, useId } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const CollapsibleCard = ({
  title,
  icon,
  children,
  defaultOpen = false,
  headerActions,
  className = "",
  ariaLabel = "",
  onToggle,
  isControlled,
  isOpen: controlledIsOpen,
}) => {
  const [internalIsOpen, setInternalIsOpen] = React.useState(defaultOpen);
  const contentId = useId();
  const buttonId = useId();

  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const handleToggle = useCallback(() => {
    const newState = !isOpen;
    if (!isControlled) {
      setInternalIsOpen(newState);
    }
    if (onToggle) {
      onToggle(newState);
    }
  }, [isOpen, isControlled, onToggle]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleToggle();
      }
    },
    [handleToggle]
  );

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden touch-manipulation ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      aria-label={ariaLabel || title}
      role="region"
    >
      <div className="flex items-center justify-between p-4 sm:p-5 min-h-[4rem]">
        <div className="flex items-center flex-1 min-w-0">
          <button
            id={buttonId}
            type="button"
            aria-expanded={isOpen}
            aria-controls={contentId}
            className="flex items-center cursor-pointer flex-1 text-left focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 rounded-lg p-1 -m-1"
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
          >
            {icon && (
              <span
                className="text-[var(--color-primary)] mr-3 text-lg flex-shrink-0"
                aria-hidden="true"
              >
                {icon}
              </span>
            )}
            <h2 className="text-lg font-semibold text-gray-800 truncate">
              {title}
            </h2>
          </button>
        </div>

        <div className="flex items-center space-x-2 ml-3">
          {headerActions && (
            <div className="mr-2 sm:mr-3" onClick={(e) => e.stopPropagation()}>
              {headerActions}
            </div>
          )}
          <button
            type="button"
            aria-label={isOpen ? `Collapse ${title}` : `Expand ${title}`}
            className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
            onClick={handleToggle}
          >
            <ChevronDown
              className={`text-gray-500 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
              size={20}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={contentId}
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: { duration: 0.2, ease: "easeInOut" },
                opacity: { duration: 0.1, delay: 0.05 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: 0.2, ease: "easeInOut" },
                opacity: { duration: 0.1 },
              },
            }}
            className="overflow-hidden"
            aria-labelledby={buttonId}
          >
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

CollapsibleCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.node,
  children: PropTypes.node.isRequired,
  defaultOpen: PropTypes.bool,
  headerActions: PropTypes.node,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
  onToggle: PropTypes.func,
  isControlled: PropTypes.bool,
  isOpen: PropTypes.bool,
};

export default memo(CollapsibleCard);
