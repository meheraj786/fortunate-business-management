import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  Layers,
  Trash2,
} from "lucide-react";
import { UrlContext } from "../../context/UrlContext";
import axios from "axios";
import toast from "react-hot-toast";

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
  disabled = false,
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
          Icon ? "pl-10" : ""
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
      />
    </div>
  </div>
);

const SelectField = ({
  label,
  value,
  onChange,
  options,
  required = false,
  icon: Icon,
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
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003b75] focus:border-transparent transition-all duration-200 ${
          Icon ? "pl-10" : ""
        }`}
      >
        <option value="">Select {label}</option>
        {options.map((option, index) => (
          <option value={option._id || option.value || option} key={index}>
            {option.name || option.label || option}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const TextAreaField = ({
  label,
  value,
  onChange,
  required = false,
  placeholder = "",
  rows = 3,
}) => (
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

const AddProductForm = ({
  onClose,
  onProductAdded,
  onProductUpdated,
  editingProduct = null,
  isOpen = false,
  warehouse = null,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    LC: "",
    thickness: "",
    width: "",
    length: "",
    grade: "",
    color: "",
    quantity: "",
    unit: "",
    unitPrice: "",
    warehouse: warehouse?._id || "",
    productDescription: "",
    supplierName: "",
  });
  const isEditMode = !!editingProduct;

  const { baseUrl } = useContext(UrlContext);

  const [productCategories, setProductCategories] = useState([]);
  const [completedLc, setCompletedLc] = useState([]);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    axios
      .get(`${baseUrl}category/get`)
      .then((res) => setProductCategories(res.data.data));
  }, []);
  useEffect(() => {
    axios
      .get(`${baseUrl}lc/completed-lc`)
      .then((res) => setCompletedLc(res.data.data));
  }, []);

  useEffect(() => {
    axios
      .get(`${baseUrl}unit/get`)
      .then((res) => setUnits(res.data.data))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load units");
      });
  }, [baseUrl]);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setFormData({
          name: editingProduct.name,
          category: editingProduct.category?._id || "",
          LC: editingProduct.LC?._id || "",
          thickness: editingProduct.thickness,
          width: editingProduct.width,
          length: editingProduct.length,
          grade: editingProduct.grade,
          color: editingProduct.color,
          quantity: editingProduct.quantity,
          unit: editingProduct.unit?._id || "",
          unitPrice: editingProduct.unitPrice,
          warehouse: editingProduct.warehouse?._id || warehouse?._id || "",
          productDescription: editingProduct.productDescription,
          supplierName: editingProduct.supplierName,
        });
      } else {
        setFormData({
          name: "",
          category: "",
          LC: "",
          thickness: "",
          width: "",
          length: "",
          grade: "",
          color: "",
          quantity: "",
          unit: "",
          unitPrice: "",
          warehouse: warehouse?._id || "",
          productDescription: "",
          supplierName: "",
        });
      }
    }
  }, [editingProduct, isOpen, warehouse]);


  const colorOptions = [
    "Silver",
    "Black",
    "Gray",
    "Dark Gray",
    "Brown",
    "Galvanized",
    "Stainless",
    "Coated",
    "Painted",
    "Natural",
    "Blue",
    "Green",
    "Red",
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name ||
      !formData.category ||
      !formData.quantity ||
      !formData.unitPrice ||
      !formData.warehouse ||
      !formData.LC ||
      !formData.thickness ||
      !formData.width ||
      !formData.length ||
      !formData.grade
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (
      parseFloat(formData.quantity) < 0 ||
      parseFloat(formData.unitPrice) <= 0
    ) {
      toast.error(
        "Quantity must be non-negative and price must be greater than 0"
      );
      return;
    }

    // Final data (number conversion)
    const dataToSave = {
      ...formData,
      quantity: Number(formData.quantity),
      unitPrice: Number(formData.unitPrice),
      thickness: Number(formData.thickness),
      width: Number(formData.width),
      length: Number(formData.length),
    };

    try {
      if (isEditMode) {
        await axios.patch(
          `${baseUrl}warehouse/${formData.warehouse}/products/${editingProduct._id}`,
          dataToSave
        );
        toast.success("Product Updated");
        onProductUpdated();
      } else {
        await axios.post(
          `${baseUrl}warehouse/${formData.warehouse}/products`,
          dataToSave
        );
        toast.success("Product Created");
        onProductAdded();
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to create product");
    }
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
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#003b75] text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Package className="w-6 h-6" />
                  <div>
                    <h2 className="text-xl font-bold">
                      {isEditMode ? "Edit Product" : "Add New Product"}
                    </h2>
                    <p className="text-blue-100 text-sm">
                      {isEditMode
                        ? "Update product information"
                        : "Enter details of the new product"}
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
                      onChange={(value) => handleInputChange("name", value)}
                      required
                      placeholder="Mild Steel Rod"
                      icon={Package}
                    />

                    <SelectField
                      label="Category"
                      value={formData.category}
                      onChange={(value) => handleInputChange("category", value)}
                      options={productCategories}
                      required
                      icon={Tag}
                    />
                    <SelectField
                      label="LC"
                      value={formData.LC}
                      onChange={(value) => handleInputChange("LC", value)}
                      options={completedLc.map((lc) => ({
                        value: lc?._id,
                        label: lc?.basicInfo?.lcNumber || "Untitled LC",
                      }))}
                      required
                      icon={Tag}
                    />

                    <InputField
                      label="Thickness (mm)"
                      type="number"
                      value={formData.thickness}
                      onChange={(value) =>
                        handleInputChange("thickness", value)
                      }
                      placeholder="e.g., 12"
                      icon={Ruler}
                    />
                    <InputField
                      label="Width (mm)"
                      type="number"
                      value={formData.width}
                      onChange={(value) => handleInputChange("width", value)}
                      placeholder="e.g., 1200"
                      icon={Ruler}
                    />
                    <InputField
                      label="Length (mm)"
                      type="number"
                      value={formData.length}
                      onChange={(value) => handleInputChange("length", value)}
                      placeholder="e.g., 2400"
                      icon={Ruler}
                    />
                    <InputField
                      label="Grade"
                      value={formData.grade}
                      onChange={(value) => handleInputChange("grade", value)}
                      placeholder="e.g., ASTM A36"
                      icon={Tag}
                    />

                    <SelectField
                      label="Color/Finish"
                      value={formData.color}
                      onChange={(value) => handleInputChange("color", value)}
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
                      onChange={(value) => handleInputChange("quantity", value)}
                      required
                      placeholder="150"
                      icon={Hash}
                    />

                    <SelectField
                      label="Unit of Measure"
                      value={formData.unit}
                      onChange={(value) => handleInputChange("unit", value)}
                      options={units}
                      required
                      icon={Package}
                    />

                    <InputField
                      label="Unit Price ($)"
                      type="text"
                      value={formData.unitPrice}
                      onChange={(value) =>
                        handleInputChange("unitPrice", value)
                      }
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
                    <InputField
                      label="Warehouse"
                      value={warehouse?.name || "Unknown Warehouse"}
                      onChange={() => {}}
                      disabled
                      icon={MapPin}
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
                      value={formData.productDescription || ""}
                      onChange={(value) =>
                        handleInputChange("productDescription", value)
                      }
                      placeholder="Detailed description, material specifications, grade, standards compliance..."
                      rows={3}
                    />

                    <InputField
                      label="Supplier/Manufacturer"
                      value={formData.supplierName || ""}
                      onChange={(value) =>
                        handleInputChange("supplierName", value)
                      }
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
                    <span>{isEditMode ? "Update Product" : "Add Product"}</span>
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

export default AddProductForm;
