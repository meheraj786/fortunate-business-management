import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Warehouse, MapPin } from 'lucide-react';

const InputField = ({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  required = false, 
  placeholder = "", 
  icon: Icon
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003b75] focus:border-transparent transition-all duration-200 ${
          Icon ? 'pl-10' : ''
        }`}
      />
    </div>
  </div>
);

const AddWarehouseForm = ({ onClose, onWarehouseAdded, isOpen = false }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: ""
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address) {
      alert('Please fill in all required fields');
      return;
    }

    onWarehouseAdded(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#003b75] text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Warehouse className="w-6 h-6" />
                  <div>
                    <h2 className="text-xl font-bold">Add New Warehouse</h2>
                    <p className="text-blue-100 text-sm">Enter details of the new warehouse</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                <InputField
                  label="Warehouse Name"
                  value={formData.name}
                  onChange={(value) => handleInputChange('name', value)}
                  required
                  placeholder="e.g., Main Warehouse"
                  icon={Warehouse}
                />
                <InputField
                  label="Warehouse Address"
                  value={formData.address}
                  onChange={(value) => handleInputChange('address', value)}
                  required
                  placeholder="e.g., 123 Industrial Park, Dhaka"
                  icon={MapPin}
                />
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#003b75] text-white rounded-lg hover:bg-[#002a54] transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Warehouse</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddWarehouseForm;
