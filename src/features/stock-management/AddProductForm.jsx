import React, { useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  Loader2,
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
} from "lucide-react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form"; // Import useForm

import { useCategories } from "@/api/hooks/category";
import { useCompletedLCs } from "@/api/hooks/lc";
import { useUnits } from "@/api/hooks/unit";
import { useCreateProduct, useUpdateProduct } from "@/api/hooks/products";
import { handleError } from "@/utils/handle-error"; // Import handleError

import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import TextAreaField from "@/components/ui/TextAreaField";
import Button from "@/components/ui/Button"; // Import Button component

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
  const currentWarehouseId = warehouse?._id; // Ensure we have a current warehouse ID

  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories();
  const { data: completedLcData, isLoading: lcsLoading } = useCompletedLCs();
  const { data: unitsData, isLoading: unitsLoading } = useUnits();

  const categories = categoriesData?.data || [];
  const completedLcs = completedLcData?.data || [];
  const units = unitsData?.data || [];

  const createProductMutation = useCreateProduct(currentWarehouseId);
  const updateProductMutation = useUpdateProduct(
    editingProduct?.warehouse?.id,
    editingProduct?._id
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting: formSubmitting },
    setValue,
  } = useForm({
    defaultValues: useMemo(() => {
      if (isEditMode && editingProduct) {
        return {
          name: editingProduct.name || "",
          category: editingProduct.category?.id || "",
          LC: editingProduct.LC?.id || "",
          thickness: editingProduct.thickness || "",
          width: editingProduct.width || "",
          length: editingProduct.length || "",
          grade: editingProduct.grade || "",
          color: editingProduct.color || "",
          quantity: editingProduct.quantity || "",
          unit: editingProduct.unit?.id || "",
          unitPrice: editingProduct.unitPrice || "",
          warehouse: editingProduct.warehouse?.id || currentWarehouseId || "",
          productDescription: editingProduct.productDescription || "",
          supplierName: editingProduct.supplierName || "",
        };
      }
      return {
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
        warehouse: currentWarehouseId || "",
        productDescription: "",
        supplierName: "",
      };
    }, [isEditMode, editingProduct, currentWarehouseId]),
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingProduct) {
        reset({
          name: editingProduct.name || "",
          category: editingProduct.category?.id || "",
          LC: editingProduct.LC?.id || "",
          thickness: editingProduct.thickness || "",
          width: editingProduct.width || "",
          length: editingProduct.length || "",
          grade: editingProduct.grade || "",
          color: editingProduct.color || "",
          quantity: editingProduct.quantity || "",
          unit: editingProduct.unit?.id || "",
          unitPrice: editingProduct.unitPrice || "",
          warehouse: editingProduct.warehouse?.id || currentWarehouseId || "",
          productDescription: editingProduct.productDescription || "",
          supplierName: editingProduct.supplierName || "",
        });
      } else {
        reset({
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
          warehouse: currentWarehouseId || "",
          productDescription: "",
          supplierName: "",
        });
      }
    }
  }, [isEditMode, editingProduct, isOpen, currentWarehouseId, reset]);

  const onSubmit = async (data) => {
    const dataToSave = {
      name: data.name,
      category: data.category,
      LC: data.LC,
      supplierName: data.supplierName,
      thickness: data.thickness,
      width: data.width,
      length: data.length,
      grade: data.grade,
      color: data.color,
      quantity: Number(data.quantity),
      unit: data.unit,
      unitPrice: Number(data.unitPrice),
      warehouse: data.warehouse,
      productDescription: data.productDescription,
    };

    try {
      if (isEditMode) {
        await updateProductMutation.mutateAsync(dataToSave);
        onProductUpdated?.(); // Optional callback
        toast.success("Product updated successfully!");
      } else {
        await createProductMutation.mutateAsync(dataToSave);
        onProductAdded?.(); // Optional callback
        toast.success("Product created successfully!");
      }
      onClose();
    } catch (error) {
      handleError(
        error,
        `Failed to ${isEditMode ? "update" : "create"} product.`
      );
    }
  };

  const isLoadingData = categoriesLoading || lcsLoading || unitsLoading;
  const isSubmitting =
    createProductMutation.isLoading ||
    updateProductMutation.isLoading ||
    formSubmitting;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 0 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-[var(--color-primary)] text-white p-5">
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
              <Button
                onClick={onClose}
                variant="subtle"
                className="!p-2 hover:bg-[var(--color-primary-hover)] rounded-lg transition-colors"
                aria-label="Close"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="p-5 overflow-y-auto max-h-[calc(90vh-140px)]">
            {isLoadingData ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
                <span className="ml-3 text-gray-600">Loading form data...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[var(--color-primary)]" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Basic Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Product Name"
                      name="name"
                      register={register}
                      error={errors.name?.message}
                      validation={{ required: "Product Name is required" }}
                      placeholder="Mild Steel Rod"
                      icon={Package}
                      disabled={isSubmitting}
                    />
                    <SelectField
                      label="Category"
                      name="category"
                      register={register}
                      error={errors.category?.message}
                      options={categories.map((c) => ({
                        value: c._id,
                        label: c.name,
                      }))}
                      validation={{ required: "Category is required" }}
                      icon={Tag}
                      disabled={isSubmitting || categoriesLoading}
                      loading={categoriesLoading}
                    />
                    <SelectField
                      label="LC"
                      name="LC"
                      register={register}
                      error={errors.LC?.message}
                      options={completedLcs.map((lc) => ({
                        value: lc._id,
                        label: `${lc.basicInfo.lcNumber} - ${lc.basicInfo.supplierName}`,
                      }))}
                      validation={{ required: "LC is required" }}
                      icon={FileText}
                      disabled={isSubmitting || lcsLoading}
                      loading={lcsLoading}
                    />
                    <InputField
                      label="Supplier Name"
                      name="supplierName"
                      register={register}
                      error={errors.supplierName?.message}
                      placeholder="Supplier company name"
                      icon={Truck}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-[var(--color-primary)]" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Specifications
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <InputField
                      label="Thickness"
                      name="thickness"
                      type="text"
                      register={register}
                      error={errors.thickness?.message}
                      placeholder="e.g., 12mm"
                      icon={Ruler}
                      disabled={isSubmitting}
                    />
                    <InputField
                      label="Width"
                      name="width"
                      type="text"
                      register={register}
                      error={errors.width?.message}
                      placeholder="e.g., 1.2m"
                      icon={Ruler}
                      disabled={isSubmitting}
                    />
                    <InputField
                      label="Length"
                      name="length"
                      type="text"
                      register={register}
                      error={errors.length?.message}
                      placeholder="e.g., 2.4m"
                      icon={Ruler}
                      disabled={isSubmitting}
                    />
                    <InputField
                      label="Grade"
                      name="grade"
                      register={register}
                      error={errors.grade?.message}
                      placeholder="ASTM A36"
                      icon={Tag}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SelectField
                      label="Color/Finish"
                      name="color"
                      register={register}
                      error={errors.color?.message}
                      options={colorOptions.map((c) => ({
                        value: c,
                        label: c,
                      }))}
                      icon={Palette}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Hash className="w-5 h-5 text-[var(--color-primary)]" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Inventory Details
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <InputField
                      label="Quantity"
                      name="quantity"
                      type="number"
                      register={register}
                      error={errors.quantity?.message}
                      validation={{
                        required: "Quantity is required",
                        min: {
                          value: 0,
                          message: "Quantity cannot be negative",
                        },
                        valueAsNumber: true,
                      }}
                      placeholder="150"
                      icon={Hash}
                      disabled={isSubmitting}
                    />
                    <SelectField
                      label="Unit"
                      name="unit"
                      register={register}
                      error={errors.unit?.message}
                      options={units.map((u) => ({
                        value: u._id,
                        label: u.name,
                      }))}
                      validation={{ required: "Unit is required" }}
                      icon={Package}
                      disabled={isSubmitting || unitsLoading}
                      loading={unitsLoading}
                    />
                    <InputField
                      label="Unit Price (BDT)"
                      name="unitPrice"
                      type="number"
                      register={register}
                      error={errors.unitPrice?.message}
                      validation={{
                        required: "Unit Price is required",
                        min: {
                          value: 0.01,
                          message: "Unit Price must be greater than 0",
                        },
                        valueAsNumber: true,
                      }}
                      placeholder="25.50"
                      icon={DollarSign}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[var(--color-primary)]" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Additional Information (Optional)
                    </h3>
                  </div>
                  <TextAreaField
                    label="Product Description"
                    name="productDescription"
                    register={register}
                    error={errors.productDescription?.message}
                    placeholder="Detailed description, material specifications, standards compliance, special features..."
                    rows={3}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex items-start gap-2 text-sm p-3 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--color-primary)]" />
                  <span>Fields marked with * are required</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    variant="secondary"
                  >
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    variant="primary"
                  >
                    <Save className="w-4 h-4 mr-2" />{" "}
                    {isSubmitting
                      ? isEditMode
                        ? "Updating..."
                        : "Creating..."
                      : isEditMode
                      ? "Update Product"
                      : "Add Product"}
                  </Button>
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
