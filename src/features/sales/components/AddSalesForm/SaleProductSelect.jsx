import React, { useMemo } from "react";
import { Package, Tag, Ruler, Hash, DollarSign } from "lucide-react";
import { Controller } from "react-hook-form";
import SelectField from "@/components/ui/SelectField";
import InputField from "@/components/ui/InputField";
import { formatCurrency } from "@/utils/format";

const SaleProductSelect = ({
  register,
  errors,
  control,
  setValue,
  watch,
  warehouses,
  categories,
  products,
  units,
  isEditMode,
  isInitialLoading,
  formattedTotalAmount,
  validationRules,
  productsLoading,
}) => {
  const watchedWarehouseId = watch("warehouseId");

  const handleWarehouseChange = (warehouseId) => {
    setValue("warehouseId", warehouseId);
    setValue("productId", "");
    setValue("categoryId", "");
    setValue("quantity", "");
    setValue("unit", "");
    setValue("pricePerUnit", "");
  };

  const handleProductChange = (productId) => {
    // setValue("productId", productId, { shouldValidate: true }); // Handled by Controller
    const product = products.find((p) => p._id === productId);
    if (product) {
      // Logic removed: Do not auto-set category as it triggers a refetch and resets the product selection
      // setValue("categoryId", product.category?._id || "", { shouldValidate: true });
      setValue("unit", product.unit?._id || "", { shouldValidate: true });
      setValue("pricePerUnit", product.unitPrice ?? "", {
        shouldValidate: true,
      });
    } else {
      setValue("unit", "", { shouldValidate: true });
      setValue("pricePerUnit", "", { shouldValidate: true });
    }
  };

  const handleUnitChange = (unitId) => {
    const productId = watch("productId");
    const product = products.find((p) => p._id === productId);
    const selectedUnit = units.find((u) => u._id === unitId);

    if (
      product &&
      selectedUnit &&
      product.unit?.conversionFactor &&
      selectedUnit.conversionFactor
    ) {
      // Logic: Product Price is usually per its Base Unit (or current Unit)
      // We need to convert price relative to the NEW unit.
      // Base Price = ProductPrice / ProductUnitFactor
      // New Price = BasePrice * NewUnitFactor
      const pricePerBaseUnit =
        product.unitPrice / product.unit.conversionFactor;
      const newPriceForSale = pricePerBaseUnit * selectedUnit.conversionFactor;

      // setValue("unit", unitId); // Handled by Controller
      setValue("pricePerUnit", newPriceForSale.toFixed(2));
    } else {
      setValue("unit", unitId);
    }
  };

  // Stock Validation Logic
  const validateQuantity = (value) => {
    const selectedProductId = watch("productId");
    const selectedProduct = products.find((p) => p._id === selectedProductId);
    const selectedUnitId = watch("unit");
    const selectedUnit = units.find((u) => u._id === selectedUnitId);

    if (!selectedProduct) return true;

    // Calculate Request Quantity in Base Unit
    const requestQty = parseFloat(value || 0);
    // If we have unit info, convert. Else assume direct match.
    // Fallback to 1 if conversionFactor is missing to avoid NaN
    const conversionFactor = selectedUnit?.conversionFactor || 1;
    const requestQtyInBase = requestQty * conversionFactor;

    // Calculate Stock in Base Unit
    // Ensure product.unit is an object and has conversionFactor, otherwise default to 1
    const productUnit = selectedProduct.unit;
    const productConversionFactor =
      (typeof productUnit === "object" ? productUnit?.conversionFactor : 1) ||
      1;
    const stockInBase = selectedProduct.quantity * productConversionFactor;

    if (requestQtyInBase > stockInBase) {
      // Try to give a helpful message in the user's selected unit
      const maxQtyInSelectedUnit = stockInBase / conversionFactor;
      const productUnitName =
        (typeof productUnit === "object" ? productUnit?.name : "Base Unit") ||
        "Base Unit";

      return `Exceeds stock. Max available: ${maxQtyInSelectedUnit.toFixed(2)} ${selectedUnit?.name || "units"} (Stock: ${selectedProduct.quantity} ${productUnitName})`;
    }
    return true;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Controller
          name="warehouseId"
          control={control}
          rules={{ required: "Warehouse is required" }}
          render={({ field }) => (
            <SelectField
              label="Warehouse"
              name="warehouseId"
              value={field.value}
              error={errors.warehouseId?.message}
              options={warehouses.map((w) => ({
                value: w._id,
                label: w.name,
              }))}
              icon={Package} // Using Package generically, or Home if preferred
              disabled={isEditMode || isInitialLoading}
              onChange={(e) => {
                field.onChange(e); // Trigger RHF update
                handleWarehouseChange(e.target.value);
              }}
            />
          )}
        />

        <Controller
          name="categoryId"
          control={control}
          rules={{ required: "Category is required" }}
          render={({ field }) => (
            <SelectField
              label="Category"
              name="categoryId"
              value={field.value}
              error={errors.categoryId?.message}
              options={categories.map((c) => ({
                value: c._id,
                label: c.name,
              }))}
              icon={Tag}
              disabled={isEditMode || !watchedWarehouseId || productsLoading}
              onChange={(e) => {
                field.onChange(e);
                setValue("productId", "");
                setValue("unit", "");
                setValue("pricePerUnit", "");
              }}
            />
          )}
        />

        <Controller
          name="productId"
          control={control}
          rules={{ required: "Product is required" }}
          render={({ field }) => (
            <SelectField
              label="Product"
              name="productId"
              value={field.value}
              error={errors.productId?.message}
              options={products.map((p) => ({
                value: p._id,
                label: `${p.name} (Qty: ${p.quantity})`,
              }))}
              icon={Package}
              disabled={isEditMode || !watchedWarehouseId || productsLoading}
              loading={productsLoading}
              onChange={(e) => {
                field.onChange(e);
                handleProductChange(e.target.value);
              }}
            />
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InputField
          label="Quantity"
          name="quantity"
          type="number"
          step="any"
          register={register}
          error={errors.quantity?.message}
          icon={Hash}
          validation={{
            required: "Quantity is required",
            min: { value: 0.01, message: "Quantity must be greater than 0" },
            valueAsNumber: true,
            validate: validateQuantity,
          }}
        />
        <Controller
          name="unit"
          control={control}
          rules={{ required: "Unit is required" }}
          render={({ field }) => (
            <SelectField
              label="Unit"
              name="unit"
              value={field.value}
              error={errors.unit?.message}
              options={units.map((u) => ({ value: u._id, label: u.name }))}
              icon={Ruler}
              disabled={isInitialLoading}
              onChange={(e) => {
                field.onChange(e);
                handleUnitChange(e.target.value);
              }}
            />
          )}
        />
        <InputField
          label="Price Per Unit"
          name="pricePerUnit"
          type="number"
          step="any"
          register={register}
          error={errors.pricePerUnit?.message}
          icon={DollarSign}
          validation={{
            required: "Price Per Unit is required",
            min: { value: 0, message: "Price cannot be negative" },
            valueAsNumber: true,
          }}
        />
        <div className="p-3 bg-[var(--color-primary-light)] rounded-lg border border-[var(--color-primary-light)]">
          <p className="text-sm font-medium text-gray-700">Subtotal</p>
          <p className="text-lg font-semibold text-[var(--color-primary)]">
            {formattedTotalAmount}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SaleProductSelect;
