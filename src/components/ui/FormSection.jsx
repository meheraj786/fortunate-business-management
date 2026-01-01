import React, { memo } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

const FormSection = ({
  title,
  icon: Icon,
  children,
  isExpanded,
  onToggle,
  sectionRef,
  className = "",
  ariaLabel = "",
}) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <section
      ref={sectionRef}
      className={`bg-white rounded-lg shadow-md/5 overflow-hidden scroll-mt-16 touch-manipulation ${className}`}
      aria-label={ariaLabel || title}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-controls={`section-content-${title
          .replace(/\s+/g, "-")
          .toLowerCase()}`}
        className="flex items-center justify-between p-4 bg-white border-b border-gray-200 rounded-t-lg cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200 min-h-[3.5rem]"
        onClick={onToggle}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {Icon && (
            <div
              className="flex-shrink-0 p-2 bg-[#003b75] rounded-lg"
              aria-hidden="true"
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
          )}
          <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 ml-2"
        >
          <ChevronDown className="w-5 h-5 text-gray-500" aria-hidden="true" />
        </motion.div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={`section-content-${title.replace(/\s+/g, "-").toLowerCase()}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: { duration: 0.3, ease: "easeInOut" },
                opacity: { duration: 0.2, delay: 0.1 },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: 0.3, ease: "easeInOut" },
                opacity: { duration: 0.2 },
              },
            }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-6 border-t border-gray-200">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

FormSection.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
  children: PropTypes.node.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  sectionRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
};

export default memo(FormSection);
