import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Save, 
  Package, 
  User, 
  Calendar,
  DollarSign,
  FileText,
  Ruler,
  Tag,
  Hash
} from 'lucide-react';

const SalesForm = ({ onClose, onSaleAdded, editData = null, isOpen = false }) => {
  const [formData, setFormData] = useState({
    productName: "",
    productId: "",
    lcNumber: "",
    quantity: "",
    price: "",
    invoiceStatus: "pending",
    date: new Date().toISOString().split('T')[0],
    customer: "",
    category: "",
    size: "",
    unit: "pieces",
  });

  const productCategories = [
    "Steel Rods",
    "Steel Sheets",
    "Structural Steel",
    "Steel Plates",
    "Steel Pipes",
    "Steel Bars",
    "Steel Coils",
    "Wire Products"
  ];

  const unitOptions = [
    { value: "pieces", label: "Pieces" },
    { value: "sheets", label: "Sheets" },
    { value: "plates", label: "Plates" },
    { value: "rolls", label: "Rolls" },
    { value: "coils", label: "Coils" },
    { value: "kg", label: "Kilograms" },
    { value: "tons", label: "Tons" },
    { value: "meters", label: "Meters" },
    { value: "feet", label: "Feet" }
  ];

  const invoiceStatusOptions = [
    { value: "yes", label: "Invoiced" },
    { value: "no", label: "Not Invoiced" },
    { value: "pending", label: "Pending" }
  ];

  // Initialize form data when editData changes or form opens
  useEffect(() => {
    if (editData) {
      setFormData(editData);
    } else if (isOpen) {
      setFormData({
        productName: "",
        productId: "",
        lcNumber: "",
        quantity: "",
        price: "",
        invoiceStatus: "pending",
        date: new Date().toISOString().split('T')[0],
        customer: "",
        category: "",
        size: "",
        unit: "pieces",
      });
    }
  }, [editData, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.productName || !formData.quantity || !formData.price || !formData.customer) {
      alert('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.quantity) <= 0 || parseFloat(formData.price) <= 0) {
      alert('Quantity and price must be greater than 0');
      return;
    }

    onSaleAdded(formData);
  };

  const InputField = ({ 
    label, 
    type = "text", 
    value, 
    onChange, 
    required = false, 
    placeholder = "", 
    icon: Icon,
    min,
    step
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
          min={min}
          step={step}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003b75] focus:border-transparent transition-all duration-200 ${
            Icon ? 'pl-10' : ''
          }`}
        />
      </div>
    </div>
  );

  const SelectField = ({ label, value, onChange, options, required = false, icon: Icon }) => (
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
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003b75] focus:border-transparent transition-all duration-200 ${
            Icon ? 'pl-10' : ''
          }`}
        >
          <option value="">Select {label}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const TextAreaField = ({ label, value, onChange, required = false, placeholder = "", rows = 3 }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003b75] focus:border-transparent transition-all duration-200 resize-vertical"
      />
    </div>
  );



  return (
    <AnimatePresence>
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
          className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#003b75] text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Package className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">
                    {editData ? 'Edit Sales Record' : 'Add New Sales Record'}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    {editData ? 'Update the sales information' : 'Enter details of the new sale'}
                  </p>
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

          {/* Form Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Product Name"
                  value={formData.productName}
                  onChange={(value) => handleInputChange('productName', value)}
                  required
                  placeholder="Mild Steel Rod"
                  icon={Package}
                />
                
                <InputField
                  label="Product ID"
                  value={formData.productId}
                  onChange={(value) => handleInputChange('productId', value)}
                  placeholder="1"
                  type="number"
                  icon={Hash}
                />
                
                <InputField
                  label="LC Number"
                  value={formData.lcNumber}
                  onChange={(value) => handleInputChange('lcNumber', value)}
                  required
                  placeholder="LC001"
                  icon={FileText}
                />
                
                <SelectField
                  label="Category"
                  value={formData.category}
                  onChange={(value) => handleInputChange('category', value)}
                  options={productCategories.map(cat => ({ value: cat, label: cat }))}
                  icon={Tag}
                />
              </div>

              {/* Sales Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField
                  label="Quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(value) => handleInputChange('quantity', value)}
                  required
                  placeholder="25"
                  min="0"
                  step="0.01"
                  icon={Hash}
                />
                
                <InputField
                  label="Price per Unit"
                  type="number"
                  value={formData.price}
                  onChange={(value) => handleInputChange('price', value)}
                  required
                  placeholder="25.50"
                  min="0"
                  step="0.01"
                  icon={DollarSign}
                />
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Total Amount
                  </label>
                  <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-lg font-semibold text-gray-900">
                      ${(parseFloat(formData.quantity) * parseFloat(formData.price) || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Size/Dimensions"
                  value={formData.size}
                  onChange={(value) => handleInputChange('size', value)}
                  placeholder="12mm x 12m"
                  icon={Ruler}
                />
                
                <SelectField
                  label="Unit"
                  value={formData.unit}
                  onChange={(value) => handleInputChange('unit', value)}
                  options={unitOptions}
                  required
                  icon={Package}
                />
              </div>

              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Customer Name"
                  value={formData.customer}
                  onChange={(value) => handleInputChange('customer', value)}
                  required
                  placeholder="Rahman Steel Works"
                  icon={User}
                />
                
                <InputField
                  label="Sale Date"
                  type="date"
                  value={formData.date}
                  onChange={(value) => handleInputChange('date', value)}
                  required
                  icon={Calendar}
                />
              </div>

              {/* Invoice Status */}
              <div className="grid grid-cols-1 gap-6">
                <SelectField
                  label="Invoice Status"
                  value={formData.invoiceStatus}
                  onChange={(value) => handleInputChange('invoiceStatus', value)}
                  options={invoiceStatusOptions}
                  required
                  icon={FileText}
                />
              </div>

              {/* Additional Notes */}
              <TextAreaField
                label="Additional Notes (Optional)"
                value={formData.notes || ""}
                onChange={(value) => handleInputChange('notes', value)}
                placeholder="Any additional information about this sale..."
                rows={2}
              />

              {/* Form Actions */}
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
                  <span>{editData ? 'Update Sale' : 'Save Sale'}</span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SalesForm;