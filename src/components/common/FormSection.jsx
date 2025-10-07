import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

const FormSection = ({
  title,
  icon: Icon,
  children,
  isExpanded,
  onToggle,
  sectionRef,
  className = '',
}) => {
  const sectionAnimation = {
    initial: { height: 0, opacity: 0 },
    animate: { height: 'auto', opacity: 1, transition: { duration: 0.3 } },
    exit: { height: 0, opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <section
      ref={sectionRef}
      className={`bg-white rounded-xl shadow-lg overflow-hidden scroll-mt-16 ${className}`}
    >
      <div
        className="flex items-center justify-between p-4 bg-white border-b border-gray-200 rounded-t-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#003b75] rounded-lg">
            {Icon && <Icon className="w-5 h-5 text-white" />}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
          </div>
        </div>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </motion.div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div {...sectionAnimation} className="overflow-hidden">
            <div className="p-6 border-t border-gray-200">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default FormSection;
