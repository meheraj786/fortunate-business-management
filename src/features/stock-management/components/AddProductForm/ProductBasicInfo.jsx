import React, { useMemo } from "react";
import { Package, Tag, FileText, Truck } from "lucide-react";
import { Controller } from "react-hook-form";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import ComboboxField from "@/components/ui/ComboboxField";

const ProductBasicInfo = ({
  control,
  errors,
  categories,
  completedLcs,
  isSubmitting,
  categoriesLoading,
  lcsLoading,
  isSupplierNameReadOnly,
}) => {
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c._id, label: c.name })),
    [categories],
  );

  const lcOptions = useMemo(
    () =>
      completedLcs.map((lc) => ({
        value: lc._id,
        label: `${lc.basicInfo.lcNumber} - ${lc.basicInfo.supplierName}`,
      })),
    [completedLcs],
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name="name"
          control={control}
          rules={{ required: "Product Name is required" }}
          render={({ field }) => (
            <InputField
              {...field}
              label="Product Name"
              error={errors.name?.message}
              placeholder="Mild Steel Rod"
              icon={Package}
              disabled={isSubmitting}
              required={true}
            />
          )}
        />
        <SelectField
          name="category"
          control={control}
          validation={{ required: "Category is required" }}
          label="Category"
          required={true}
          error={errors.category?.message}
          options={categoryOptions}
          icon={Tag}
          disabled={isSubmitting || categoriesLoading}
          loading={categoriesLoading}
        />
        <ComboboxField
          name="LC"
          control={control}
          label="LC (Optional)"
          error={errors.LC?.message}
          options={lcOptions}
          icon={FileText}
          disabled={isSubmitting || lcsLoading}
          loading={lcsLoading}
          placeholder="Search LC..."
        />
        <Controller
          name="supplierName"
          control={control}
          render={({ field }) => (
            <InputField
              {...field}
              label="Supplier Name"
              error={errors.supplierName?.message}
              placeholder="Supplier company name"
              icon={Truck}
              disabled={isSubmitting}
              readOnly={isSupplierNameReadOnly}
            />
          )}
        />
      </div>
    </div>
  );
};

export default ProductBasicInfo;
