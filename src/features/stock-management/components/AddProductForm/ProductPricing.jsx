import React, { useMemo } from "react";
import { Hash, Package, DollarSign } from "lucide-react";
import { Controller } from "react-hook-form";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import { useSettings } from "@/context/SettingsContext";

const ProductPricing = ({
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
  const { settings } = useSettings();

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
              required={true}
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
        <SelectField
          name="unit"
          control={control}
          validation={{ required: "Unit is required" }}
          label="Unit"
          required={true}
          error={errors.unit?.message}
          options={unitOptions}
          icon={Package}
          disabled={isSubmitting || unitsLoading}
          loading={unitsLoading}
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
              label={`Unit Price (${settings?.currency || "BDT"})`}
              required={true}
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
