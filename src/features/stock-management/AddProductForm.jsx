import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Package, Tag, Ruler, Palette, Hash, DollarSign, Layers, FileText, Truck, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { useCategories } from "@/api/hooks/category";
import { useCompletedLCs } from "@/api/hooks/lc";
import { useUnits } from "@/api/hooks/unit";
import { useCreateProduct, useUpdateProduct } from "@/api/hooks/products";

import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import TextAreaField from "@/components/ui/TextAreaField";

const colorOptions = [ "Silver", "Black", "Gray", "Dark Gray", "Brown", "Galvanized", "Stainless", "Coated", "Painted", "Natural", "Blue", "Green", "Red" ];

const AddProductForm = ({ onClose, onProductAdded, onProductUpdated, editingProduct = null, isOpen = false, warehouse = null }) => {
  const isEditMode = !!editingProduct;
  
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const { data: completedLcData, isLoading: lcsLoading } = useCompletedLCs();
  const { data: unitsData, isLoading: unitsLoading } = useUnits();

  const createProductMutation = useCreateProduct(warehouse?._id);
  const updateProductMutation = useUpdateProduct(editingProduct?.warehouse?._id, editingProduct?._id);
  
  const initialFormData = useCallback(() => ({
    name: "", category: "", LC: "", thickness: "", width: "", length: "", grade: "", color: "", quantity: "", unit: "", unitPrice: "",
    warehouse: warehouse?._id || "", productDescription: "", supplierName: "",
  }), [warehouse]);

  const [formData, setFormData] = useState(initialFormData);

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
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const validateForm = () => {
    const requiredFields = ["name", "category", "LC", "quantity", "unit", "unitPrice", "warehouse"];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields`);
      return false;
    }
    if (isNaN(parseFloat(formData.quantity)) || parseFloat(formData.quantity) < 0) {
      toast.error("Quantity must be a non-negative number");
      return false;
    }
    if (isNaN(parseFloat(formData.unitPrice)) || parseFloat(formData.unitPrice) <= 0) {
      toast.error("Unit price must be greater than 0");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const dataToSave = { ...formData, quantity: Number(formData.quantity), unitPrice: Number(formData.unitPrice) };

    if (isEditMode) {
      updateProductMutation.mutate(dataToSave, {
        onSuccess: () => {
          onProductUpdated();
          onClose();
        },
      });
    } else {
      createProductMutation.mutate(dataToSave, {
        onSuccess: () => {
          onProductAdded();
          onClose();
        },
      });
    }
  };

  const isLoading = categoriesLoading || lcsLoading || unitsLoading;
  const isSubmitting = createProductMutation.isLoading || updateProductMutation.isLoading;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div style={{ backgroundColor: "rgb(0, 51, 102)" }} className="text-white p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg"><Package className="w-6 h-6" /></div>
                <div>
                  <h2 className="text-xl font-bold">{isEditMode ? "Edit Product" : "Add New Product"}</h2>
                  <p className="opacity-80 text-sm mt-1">{isEditMode ? "Update product information" : "Enter details of the new product"}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors" aria-label="Close" disabled={isSubmitting}><X className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: "rgb(0, 51, 102)" }} />
                <span className="ml-3 text-gray-600">Loading form data...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2"><Layers className="w-5 h-5" style={{ color: "rgb(0, 51, 102)" }} /><h3 className="text-lg font-semibold text-gray-900">Basic Information</h3></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Product Name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} required placeholder="Mild Steel Rod" icon={Package} disabled={isSubmitting} />
                    <SelectField label="Category" value={formData.category} onChange={(e) => handleInputChange("category", e.target.value)} options={categoriesData?.data?.map(c => ({ value: c._id, label: c.name }))} required icon={Tag} disabled={isSubmitting || categoriesLoading} loading={categoriesLoading} />
                    <SelectField label="LC" value={formData.LC} onChange={(e) => handleInputChange("LC", e.target.value)} options={completedLcData?.data?.map(lc => ({ value: lc._id, label: `${lc.basicInfo.lcNumber} - ${lc.basicInfo.supplierName}` }))} required icon={FileText} disabled={isSubmitting || lcsLoading} loading={lcsLoading} />
                    <InputField label="Supplier Name" value={formData.supplierName} onChange={(e) => handleInputChange("supplierName", e.target.value)} placeholder="Supplier company name" icon={Truck} disabled={isSubmitting} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2"><Ruler className="w-5 h-5" style={{ color: "rgb(0, 51, 102)" }} /><h3 className="text-lg font-semibold text-gray-900">Specifications</h3></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <InputField label="Thickness" type="text" value={formData.thickness} onChange={(e) => handleInputChange("thickness", e.target.value)} placeholder="e.g., 12mm" icon={Ruler} disabled={isSubmitting} />
                    <InputField label="Width" type="text" value={formData.width} onChange={(e) => handleInputChange("width", e.target.value)} placeholder="e.g., 1.2m" icon={Ruler} disabled={isSubmitting} />
                    <InputField label="Length" type="text" value={formData.length} onChange={(e) => handleInputChange("length", e.target.value)} placeholder="e.g., 2.4m" icon={Ruler} disabled={isSubmitting} />
                    <InputField label="Grade" value={formData.grade} onChange={(e) => handleInputChange("grade", e.target.value)} placeholder="ASTM A36" icon={Tag} disabled={isSubmitting} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SelectField label="Color/Finish" value={formData.color} onChange={(e) => handleInputChange("color", e.target.value)} options={colorOptions.map(c => ({ value: c, label: c }))} icon={Palette} disabled={isSubmitting} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2"><Hash className="w-5 h-5" style={{ color: "rgb(0, 51, 102)" }} /><h3 className="text-lg font-semibold text-gray-900">Inventory Details</h3></div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <InputField label="Quantity" type="number" value={formData.quantity} onChange={(e) => handleInputChange("quantity", e.target.value)} required placeholder="150" icon={Hash} min="0" step="1" disabled={isSubmitting} />
                    <SelectField label="Unit" value={formData.unit} onChange={(e) => handleInputChange("unit", e.target.value)} options={unitsData?.data?.map(u => ({ value: u._id, label: u.name }))} required icon={Package} disabled={isSubmitting || unitsLoading} loading={unitsLoading} />
                    <InputField label="Unit Price (BDT)" type="number" value={formData.unitPrice} onChange={(e) => handleInputChange("unitPrice", e.target.value)} required placeholder="25.50" icon={DollarSign} min="0.01" step="0.01" disabled={isSubmitting} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2"><FileText className="w-5 h-5" style={{ color: "rgb(0, 51, 102)" }} /><h3 className="text-lg font-semibold text-gray-900">Additional Information (Optional)</h3></div>
                  <TextAreaField label="Product Description" value={formData.productDescription || ""} onChange={(e) => handleInputChange("productDescription", e.target.value)} placeholder="Detailed description, material specifications, standards compliance, special features..." rows={3} disabled={isSubmitting} />
                </div>
                <div className="flex items-start gap-2 text-sm p-3 rounded-lg" style={{ backgroundColor: "rgba(0, 51, 102, 0.1)" }}>
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "rgb(0, 51, 102)" }} />
                  <span style={{ color: "rgb(0, 51, 102)" }}>Fields marked with * are required</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                  <button type="button" onClick={onClose} disabled={isSubmitting} className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} style={{ backgroundColor: "rgb(0, 51, 102)" }} className="px-6 py-2.5 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2">
                    {isSubmitting ? (<><Loader2 className="w-4 h-4 animate-spin" /> {isEditMode ? "Updating..." : "Creating..."}</>) : (<><Save className="w-4 h-4" /> {isEditMode ? "Update Product" : "Add Product"}</>)}
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
