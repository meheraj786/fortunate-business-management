import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Save, 
  Package, 
  Tag, 
  Ruler,
  Palette,
  Hash,
  DollarSign,
  MapPin,
  Layers
} from 'lucide-react';
import { warehouses, categories } from '../../data/data';

// Helper components moved outside the main component to prevent re-creation on re-renders
const InputField = ({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  required = false, 
  placeholder = "", 
  icon: Icon,
  min,
  step,
  disabled = false
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
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003b75] focus:border-transparent transition-all duration-200 ${
          Icon ? 'pl-10' : ''
        } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
        {options.map((option, index) => (
          <option key={index} value={option.value || option}>
            {option.label || option}
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

const AddProductForm = ({ onClose, onProductAdded, editData = null, isOpen = false, warehouseId = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    size: "",
    color: "",
    quantity: "",
    unit: "pieces",
    unitPrice: "",
    warehouseId: warehouseId || ""
  });

  const productCategories = categories.map(c => ({ value: c.id, label: c.name }));

  const unitOptions = [
    { value: "pieces", label: "Pieces" },
    { value: "sheets", label: "Sheets" },
    { value: "plates", label: "Plates" },
    { value: "rolls", label: "Rolls" },
    { value: "coils", label: "Coils" },
    { value: "kg", label: "Kilograms" },
    { value: "tons", label: "Tons" },
    { value: "meters", label: "Meters" },
    { value: "feet", label: "Feet" },
    { value: "bundles", label: "Bundles" },
    { value: "packs", label: "Packs" }
  ];

  const colorOptions = [
    "Silver", "Black", "Gray", "Dark Gray", "Brown", "Galvanized", 
    "Stainless", "Coated", "Painted", "Natural", "Blue", "Green", "Red"
  ];

  const locationOptions = warehouses.map(w => ({ value: w.id, label: w.name }));

  useEffect(() => {
    if (editData) {
      const cleanEditData = {
        ...editData,
        unitPrice: editData.unitPrice ? editData.unitPrice.replace('$', '') : ''
      };
      setFormData(cleanEditData);
    } else if (isOpen) {
      setFormData({
        name: "",
        categoryId: "",
        size: "",
        color: "",
        quantity: "",
        unit: "pieces",
        unitPrice: "",
        warehouseId: warehouseId || ""
      });
    }
  }, [editData, isOpen, warehouseId]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.categoryId || !formData.quantity || !formData.unitPrice) {
      alert('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.quantity) < 0 || parseFloat(formData.unitPrice) <= 0) {
      alert('Quantity must be non-negative and price must be greater than 0');
      return;
    }

    const dataToSave = {
      ...formData,
      unitPrice: `$${parseFloat(formData.unitPrice).toFixed(2)}`
    };

    onProductAdded(dataToSave);
  };

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
          <div className="bg-[#003b75] text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Package className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">
                    {editData ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    {editData ? 'Update product information' : 'Enter details of the new product'}
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

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-[#003b75]" />
                  <span>Basic Information</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Product Name"
                    value={formData.name}
                    onChange={(value) => handleInputChange('name', value)}
                    required
                    placeholder="Mild Steel Rod"
                    icon={Package}
                  />
                  
                  <SelectField
                    label="Category"
                    value={formData.categoryId}
                    onChange={(value) => handleInputChange('categoryId', value)}
                    options={productCategories}
                    required
                    icon={Tag}
                  />
                  
                  <InputField
                    label="Size/Dimensions"
                    value={formData.size}
                    onChange={(value) => handleInputChange('size', value)}
                    placeholder="12mm x 12m"
                    icon={Ruler}
                  />
                  
                  <SelectField
                    label="Color/Finish"
                    value={formData.color}
                    onChange={(value) => handleInputChange('color', value)}
                    options={colorOptions}
                    icon={Palette}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Hash className="w-5 h-5 text-[#003b75]" />
                  <span>Inventory Details</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputField
                    label="Quantity in Stock"
                    type="text"
                    value={formData.quantity}
                    onChange={(value) => handleInputChange('quantity', value)}
                    required
                    placeholder="150"
                    icon={Hash}
                  />
                  
                  <SelectField
                    label="Unit of Measure"
                    value={formData.unit}
                    onChange={(value) => handleInputChange('unit', value)}
                    options={unitOptions}
                    required
                    icon={Package}
                  />
                  
                  <InputField
                    label="Unit Price ($)"
                    type="text"
                    value={formData.unitPrice}
                    onChange={(value) => handleInputChange('unitPrice', value)}
                    required
                    placeholder="25.50"
                    icon={DollarSign}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-[#003b75]" />
                  <span>Storage Information</span>
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <SelectField
                    label="Storage Location"
                    value={formData.warehouseId}
                    onChange={(value) => handleInputChange('warehouseId', value)}
                    options={locationOptions}
                    icon={MapPin}
                  />
                  
                  <TextAreaField
                    label="Location Notes (Optional)"
                    value={formData.locationNotes || ""}
                    onChange={(value) => handleInputChange('locationNotes', value)}
                    placeholder="Specific shelf, rack number, or additional location details..."
                    rows={2}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Ruler className="w-5 h-5 text-[#003b75]" />
                  <span>Additional Specifications (Optional)</span>
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <TextAreaField
                    label="Product Description"
                    value={formData.description || ""}
                    onChange={(value) => handleInputChange('description', value)}
                    placeholder="Detailed description, material specifications, grade, standards compliance..."
                    rows={3}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Weight (kg per unit)"
                      type="text"
                      value={formData.weight || ""}
                      onChange={(value) => handleInputChange('weight', value)}
                      placeholder="7.5"
                    />
                    
                    <InputField
                      label="Grade/Standard"
                      value={formData.grade || ""}
                      onChange={(value) => handleInputChange('grade', value)}
                      placeholder="ASTM A36, ISO 9001, etc."
                    />
                  </div>
                  
                  <InputField
                    label="Supplier/Manufacturer"
                    value={formData.supplier || ""}
                    onChange={(value) => handleInputChange('supplier', value)}
                    placeholder="Manufacturer name or supplier information"
                  />
                </div>
              </div>

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
                  <span>{editData ? 'Update Product' : 'Add Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddProductForm;