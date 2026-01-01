import React, { useState, useEffect, useCallback } from "react";
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
  Layers,
  FileText,
  Truck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { handleError } from "@/utils/handle-error";
import api from "@/services/apiService";
import toast from "react-hot-toast";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import TextAreaField from "@/components/ui/TextAreaField";

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

const AddProductForm = ({
  onClose,
  onProductAdded,
  onProductUpdated,
  editingProduct = null,
  isOpen = false,
  warehouse = null,
}) => {
  const isEditMode = !!editingProduct;
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Initial form state
  const initialFormData = useCallback(
    () => ({
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
    }),
    [warehouse]
  );

  const [formData, setFormData] = useState(initialFormData);
  const [productCategories, setProductCategories] = useState([]);
  const [completedLc, setCompletedLc] = useState([]);
  const [units, setUnits] = useState([]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;

      setLoading(true);
      try {
        const [categoriesRes, lcRes, unitsRes] = await Promise.all([
          api.get(`/category/get`),
          api.get(`/lc/completed-lc`),
          api.get(`/unit/get`),
        ]);

        setProductCategories(categoriesRes.data.data || []);
        setCompletedLc(lcRes.data.data || []);
        setUnits(unitsRes.data.data || []);
      } catch (error) {
        handleError(error, "Failed to load necessary data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen]);

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingProduct) {
        setFormData({
          name: editingProduct.name || "",
          category: editingProduct.category?._id || "",
          LC: editingProduct.LC?._id || "",
          thickness: editingProduct.thickness || "",
          width: editingProduct.width || "",
          length: editingProduct.length || "",
          grade: editingProduct.grade || "",
          color: editingProduct.color || "",
          quantity: editingProduct.quantity || "",
          unit: editingProduct.unit?._id || "",
          unitPrice: editingProduct.unitPrice || "",
          warehouse: editingProduct.warehouse?._id || warehouse?._id || "",
          productDescription: editingProduct.productDescription || "",
          supplierName: editingProduct.supplierName || "",
        });
      } else {
        setFormData(initialFormData());
      }
    }
  }, [isEditMode, editingProduct, isOpen, warehouse, initialFormData]);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const validateForm = () => {
    const requiredFields = [
      "name",
      "category",
      "LC",
      "quantity",
      "unit",
      "unitPrice",
      "warehouse",
    ];

    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields`);
      return false;
    }

    const quantity = parseFloat(formData.quantity);
    const unitPrice = parseFloat(formData.unitPrice);

    if (isNaN(quantity) || quantity < 0) {
      toast.error("Quantity must be a non-negative number");
      return false;
    }

    if (isNaN(unitPrice) || unitPrice <= 0) {
      toast.error("Unit price must be greater than 0");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const dataToSave = {
        ...formData,
        quantity: Number(formData.quantity),
        unitPrice: Number(formData.unitPrice),
      };

      if (isEditMode) {
        await api.patch(
          `/warehouse/${formData.warehouse}/products/${editingProduct._id}`,
          dataToSave
        );
        toast.success("Product updated successfully");
        onProductUpdated();
      } else {
        await api.post(`/warehouse/${formData.warehouse}/products`, dataToSave);
        toast.success("Product created successfully");
        onProductAdded();
      }

      onClose();
    } catch (error) {
      handleError(error, "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  const getLCOptions = useCallback(() => {
    return completedLc.map((lc) => ({
      _id: lc?._id,
      name: lc?.basicInfo?.lcNumber || `LC ${lc?._id?.slice(-6)}`,
      supplier: lc?.supplierName || "Unknown Supplier",
    }));
  }, [completedLc]);

  const getUnitOptions = useCallback(() => {
    return units.map((unit) => ({
      _id: unit._id,
      name: unit.name,
      symbol: unit.symbol || "",
    }));
  }, [units]);

  const getCategoryOptions = useCallback(() => {
    return productCategories.map((cat) => ({
      _id: cat._id,
      name: cat.name,
    }));
  }, [productCategories]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{ backgroundColor: "rgb(0, 51, 102)" }}
            className="text-white p-4 sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {isEditMode ? "Edit Product" : "Add New Product"}
                  </h2>
                  <p className="opacity-80 text-sm mt-1">
                    {isEditMode
                      ? "Update product information"
                      : "Enter details of the new product"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Close"
                disabled={submitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2
                  className="w-8 h-8 animate-spin"
                  style={{ color: "rgb(0, 51, 102)" }}
                />
                <span className="ml-3 text-gray-600">Loading form data...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section 1: Basic Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Layers
                      className="w-5 h-5"
                      style={{ color: "rgb(0, 51, 102)" }}
                    />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Basic Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Product Name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      required
                      placeholder="Mild Steel Rod"
                      icon={Package}
                      disabled={submitting}
                    />

                    <SelectField
                      label="Category"
                      value={formData.category}
                      onChange={(e) =>
                        handleInputChange("category", e.target.value)
                      }
                      options={getCategoryOptions()}
                      required
                      icon={Tag}
                      disabled={submitting || loading}
                      loading={loading && !productCategories.length}
                    />

                    <SelectField
                      label="LC"
                      value={formData.LC}
                      onChange={(e) => handleInputChange("LC", e.target.value)}
                      options={getLCOptions()}
                      optionLabel={(opt) => `${opt.name} - ${opt.supplier}`}
                      required
                      icon={FileText}
                      disabled={submitting || loading}
                      loading={loading && !completedLc.length}
                    />

                    <InputField
                      label="Supplier Name"
                      value={formData.supplierName}
                      onChange={(e) =>
                        handleInputChange("supplierName", e.target.value)
                      }
                      placeholder="Supplier company name"
                      icon={Truck}
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Section 2: Specifications */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Ruler
                      className="w-5 h-5"
                      style={{ color: "rgb(0, 51, 102)" }}
                    />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Specifications
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <InputField
                      label="Thickness"
                      type="text"
                      value={formData.thickness}
                      onChange={(e) =>
                        handleInputChange("thickness", e.target.value)
                      }
                      placeholder="e.g., 12mm"
                      icon={Ruler}
                      disabled={submitting}
                    />

                    <InputField
                      label="Width"
                      type="text"
                      value={formData.width}
                      onChange={(e) =>
                        handleInputChange("width", e.target.value)
                      }
                      placeholder="e.g., 1.2m"
                      icon={Ruler}
                      disabled={submitting}
                    />

                    <InputField
                      label="Length"
                      type="text"
                      value={formData.length}
                      onChange={(e) =>
                        handleInputChange("length", e.target.value)
                      }
                      placeholder="e.g., 2.4m"
                      icon={Ruler}
                      disabled={submitting}
                    />

                    <InputField
                      label="Grade"
                      value={formData.grade}
                      onChange={(e) =>
                        handleInputChange("grade", e.target.value)
                      }
                      placeholder="ASTM A36"
                      icon={Tag}
                      disabled={submitting}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SelectField
                      label="Color/Finish"
                      value={formData.color}
                      onChange={(e) =>
                        handleInputChange("color", e.target.value)
                      }
                      options={colorOptions}
                      icon={Palette}
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Section 3: Inventory Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Hash
                      className="w-5 h-5"
                      style={{ color: "rgb(0, 51, 102)" }}
                    />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Inventory Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <InputField
                      label="Quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        handleInputChange("quantity", e.target.value)
                      }
                      required
                      placeholder="150"
                      icon={Hash}
                      min="0"
                      step="1"
                      disabled={submitting}
                    />

                    <SelectField
                      label="Unit"
                      value={formData.unit}
                      onChange={(e) =>
                        handleInputChange("unit", e.target.value)
                      }
                      options={getUnitOptions()}
                      required
                      icon={Package}
                      disabled={submitting || loading}
                      loading={loading && !units.length}
                    />

                    <InputField
                      label="Unit Price (BDT)"
                      type="number"
                      value={formData.unitPrice}
                      onChange={(e) =>
                        handleInputChange("unitPrice", e.target.value)
                      }
                      required
                      placeholder="25.50"
                      icon={DollarSign}
                      min="0.01"
                      step="0.01"
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Section 4: Additional Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText
                      className="w-5 h-5"
                      style={{ color: "rgb(0, 51, 102)" }}
                    />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Additional Information (Optional)
                    </h3>
                  </div>

                  <TextAreaField
                    label="Product Description"
                    value={formData.productDescription || ""}
                    onChange={(e) =>
                      handleInputChange("productDescription", e.target.value)
                    }
                    placeholder="Detailed description, material specifications, standards compliance, special features..."
                    rows={3}
                    disabled={submitting}
                  />
                </div>

                {/* Required Fields Note */}
                <div
                  className="flex items-start gap-2 text-sm p-3 rounded-lg"
                  style={{ backgroundColor: "rgba(0, 51, 102, 0.1)" }}
                >
                  <AlertCircle
                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                    style={{ color: "rgb(0, 51, 102)" }}
                  />
                  <span style={{ color: "rgb(0, 51, 102)" }}>
                    Fields marked with * are required
                  </span>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{ backgroundColor: "rgb(0, 51, 102)" }}
                    className="px-6 py-2.5 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {isEditMode ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {isEditMode ? "Update Product" : "Add Product"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddProductForm;
