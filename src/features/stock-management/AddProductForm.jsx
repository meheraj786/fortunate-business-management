import React, { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  Loader2,
  Package,
  Layers,
  Ruler,
  Hash,
  FileText,
  AlertCircle,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useCategories } from "@/api/hooks/category";
import { useCompletedLCs } from "@/api/hooks/lc";
import { useUnits } from "@/api/hooks/unit";
import { useCreateProduct, useUpdateProduct } from "@/api/hooks/products";

import Button from "@/components/ui/Button";
import TextAreaField from "@/components/ui/TextAreaField";

// Sub-components
import ProductBasicInfo from "./components/AddProductForm/ProductBasicInfo";
import ProductDimensions from "./components/AddProductForm/ProductDimensions";
import ProductPricing from "./components/AddProductForm/ProductPricing";

const AddProductForm = ({
  onClose,
  onProductAdded,
  onProductUpdated,
  editingProduct = null,
  isOpen = false,
  warehouse = null,
}) => {
  const isEditMode = !!editingProduct;
  const currentWarehouseId = warehouse?._id;

  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories();
  const { data: completedLcData, isLoading: lcsLoading } = useCompletedLCs();
  const { data: unitsData, isLoading: unitsLoading } = useUnits();

  const categories = useMemo(
    () => categoriesData?.data || [],
    [categoriesData],
  );
  const completedLcs = useMemo(
    () => completedLcData?.data || [],
    [completedLcData],
  );
  const units = useMemo(() => unitsData?.data || [], [unitsData]);

  const createProductMutation = useCreateProduct(currentWarehouseId);
  const updateProductMutation = useUpdateProduct(
    editingProduct?.warehouse?.id,
    editingProduct?._id,
  );

  const initialValues = useMemo(() => {
    const getSafeId = (obj) => obj?.id || obj?._id || obj || "";

    if (isEditMode && editingProduct) {
      return {
        name: editingProduct.name || "",
        category: getSafeId(editingProduct.category),
        LC: getSafeId(editingProduct.LC),
        thickness: editingProduct.thickness || "",
        width: editingProduct.width || "",
        length: editingProduct.length || "",
        grade: editingProduct.grade || "",
        color: editingProduct.color || "",
        quantity: editingProduct.quantity || "",
        unit: getSafeId(editingProduct.unit),
        unitPrice: editingProduct.unitPrice || "",
        warehouse:
          getSafeId(editingProduct.warehouse) || currentWarehouseId || "",
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
  }, [isEditMode, editingProduct, currentWarehouseId]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting: formSubmitting },
    setValue,
    watch,
  } = useForm({
    defaultValues: initialValues,
  });

  const selectedLcId = watch("LC");
  const isSupplierNameReadOnly = useMemo(() => !!selectedLcId, [selectedLcId]);

  // Handle supplier name auto-update from LC
  useEffect(() => {
    if (selectedLcId) {
      const selectedLc = completedLcs.find((lc) => lc._id === selectedLcId);
      if (selectedLc && selectedLc.basicInfo?.supplierName) {
        // Only set if it's different to avoid unnecessary re-renders or clearing
        const currentSupplier = watch("supplierName");
        if (currentSupplier !== selectedLc.basicInfo.supplierName) {
          setValue("supplierName", selectedLc.basicInfo.supplierName, {
            shouldValidate: true,
          });
        }
      }
    } else if (!isEditMode) {
      // Only clear if not in edit mode to avoid clearing existing manual supplier names
      const currentSupplier = watch("supplierName");
      if (currentSupplier) {
        setValue("supplierName", "", { shouldValidate: true });
      }
    }
  }, [selectedLcId, completedLcs, setValue, isEditMode, watch]);

  // Sync form when initialValues change (e.g. if prop updates While mounted)
  useEffect(() => {
    if (isOpen) {
      reset(initialValues);
    }
  }, [initialValues, isOpen, reset]);

  const onSubmit = async (data) => {
    const dataToSave = {
      ...data,
      quantity: Number(data.quantity),
      unitPrice: Number(data.unitPrice),
    };

    const mutationOptions = {
      onSuccess: () => {
        if (isEditMode) onProductUpdated?.();
        else onProductAdded?.();
        onClose();
      },
    };

    if (isEditMode) {
      updateProductMutation.mutate(dataToSave, mutationOptions);
    } else {
      createProductMutation.mutate(dataToSave, mutationOptions);
    }
  };

  const isLoadingData = categoriesLoading || lcsLoading || unitsLoading;
  const isSubmitting =
    createProductMutation.isLoading ||
    updateProductMutation.isLoading ||
    formSubmitting;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full transform overflow-hidden transition-all data-closed:opacity-0 data-closed:scale-95 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
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
                  <span className="ml-3 text-gray-600">
                    Loading form data...
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Info Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-[var(--color-primary)]" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Basic Information
                      </h3>
                    </div>
                    <ProductBasicInfo
                      register={register}
                      control={control}
                      errors={errors}
                      categories={categories}
                      completedLcs={completedLcs}
                      isSubmitting={isSubmitting}
                      categoriesLoading={categoriesLoading}
                      lcsLoading={lcsLoading}
                      isSupplierNameReadOnly={isSupplierNameReadOnly}
                    />
                  </div>

                  {/* Specifications Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Ruler className="w-5 h-5 text-[var(--color-primary)]" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Specifications
                      </h3>
                    </div>
                    <ProductDimensions
                      register={register}
                      control={control}
                      errors={errors}
                      isSubmitting={isSubmitting}
                    />
                  </div>

                  {/* Inventory Details Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Hash className="w-5 h-5 text-[var(--color-primary)]" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Inventory Details
                      </h3>
                    </div>
                    <ProductPricing
                      register={register}
                      control={control}
                      errors={errors}
                      units={units}
                      isSubmitting={isSubmitting}
                      unitsLoading={unitsLoading}
                    />
                  </div>

                  {/* Additional Info Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[var(--color-primary)]" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Additional Information (Optional)
                      </h3>
                    </div>
                    <Controller
                      name="productDescription"
                      control={control}
                      render={({ field }) => (
                        <TextAreaField
                          {...field}
                          label="Product Description"
                          error={errors.productDescription?.message}
                          placeholder="Detailed description, material specifications, standards compliance, special features..."
                          rows={3}
                          disabled={isSubmitting}
                        />
                      )}
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
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default AddProductForm;
