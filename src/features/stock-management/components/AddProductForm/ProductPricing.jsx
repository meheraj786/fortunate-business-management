import React, { useMemo } from "react";
import { Hash, Package, DollarSign } from "lucide-react";
import { Controller } from "react-hook-form";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";

const ProductPricing = ({
  register,
  control,
  errors,
  units,
  isSubmitting,
  unitsLoading,
}) => {
  const unitOptions = useMemo(
    () => units.map((u) => ({ value: u._id, label: u.name })),
    [units],
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Controller
          name="quantity"
          control={control}
          rules={{
            required: "Quantity is required",
            min: { value: 0, message: "Quantity cannot be negative" },
          }}
          render={({ field }) => (
            <InputField
              {...field}
              label="Quantity"
              type="number"
              error={errors.quantity?.message}
              placeholder="150"
              icon={Hash}
              disabled={isSubmitting}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          )}
        />
        {/* ... Unit select is already controlled ... */}
        <Controller
          name="unit"
          control={control}
          rules={{ required: "Unit is required" }}
          render={({ field }) => (
            <SelectField
              {...field}
              label="Unit"
              error={errors.unit?.message}
              options={unitOptions}
              icon={Package}
              disabled={isSubmitting || unitsLoading}
              loading={unitsLoading}
            />
          )}
        />
        <Controller
          name="unitPrice"
          control={control}
          rules={{
            required: "Unit Price is required",
            min: { value: 0.01, message: "Unit Price must be greater than 0" },
          }}
          render={({ field }) => (
            <InputField
              {...field}
              label="Unit Price (BDT)"
              type="number"
              error={errors.unitPrice?.message}
              placeholder="25.50"
              icon={DollarSign}
              disabled={isSubmitting}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          )}
        />
      </div>
    </div>
  );
};

export default ProductPricing;
