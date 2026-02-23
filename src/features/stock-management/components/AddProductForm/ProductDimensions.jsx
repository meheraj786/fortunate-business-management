import React from "react";
import { Ruler, Tag, Palette } from "lucide-react";
import { Controller } from "react-hook-form";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";

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
].map((c) => ({ value: c, label: c }));

const ProductDimensions = ({ control, errors, isSubmitting }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Controller
          name="thickness"
          control={control}
          render={({ field }) => (
            <InputField
              {...field}
              label="Thickness"
              error={errors.thickness?.message}
              placeholder="e.g., 12mm"
              icon={Ruler}
              disabled={isSubmitting}
            />
          )}
        />
        <Controller
          name="width"
          control={control}
          render={({ field }) => (
            <InputField
              {...field}
              label="Width"
              error={errors.width?.message}
              placeholder="e.g., 1.2m"
              icon={Ruler}
              disabled={isSubmitting}
            />
          )}
        />
        <Controller
          name="length"
          control={control}
          render={({ field }) => (
            <InputField
              {...field}
              label="Length"
              error={errors.length?.message}
              placeholder="e.g., 2.4m"
              icon={Ruler}
              disabled={isSubmitting}
            />
          )}
        />
        <Controller
          name="grade"
          control={control}
          render={({ field }) => (
            <InputField
              {...field}
              label="Grade"
              error={errors.grade?.message}
              placeholder="ASTM A36"
              icon={Tag}
              disabled={isSubmitting}
            />
          )}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField
          name="color"
          control={control}
          label="Color/Finish"
          error={errors.color?.message}
          options={colorOptions}
          icon={Palette}
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
};

export default ProductDimensions;
