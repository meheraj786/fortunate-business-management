import React, { useCallback } from "react";
import { User, MapPin, Phone } from "lucide-react";
import SelectField from "@/components/ui/SelectField";
import InputField from "@/components/ui/InputField";
import { useSettings } from "@/context/SettingsContext";

const SaleCustomerSelect = ({
  register,
  control,
  errors,
  setValue,
  watch,
  customers,
  isEditMode,
  isInitialLoading,
}) => {
  const { formatCurrency } = useSettings();
  const watchedCustomerType = watch("customerType");
  const watchedCustomerId = watch("customerId");
  const selectedCustomer = customers?.find((c) => c._id === watchedCustomerId);



  const handleCustomerSelect = (customerId) => {
    const customer = customers.find((c) => c._id === customerId);
    if (customer) {
      setValue("customerId", customer._id);
      setValue("customerName", customer.name || "");
      setValue("customerPhone", customer.phone || "");
      setValue("customerAddress", customer.address || "");
    }
  };

  return (
    <div className="space-y-4 border-t border-gray-100 pt-4">
      <h3 className="text-lg font-medium text-gray-800">Customer Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="Customer Type"
          name="customerType"
          required={true}
          control={control}
          error={errors.customerType?.message}
          options={[
            { value: "existing", label: "Existing Customer" },
            { value: "manual", label: "Manual Input" },
          ]}
          validation={{ required: "Customer type is required" }}
          disabled={isEditMode}
          onChange={(val) => {
            setValue("customerType", val);
            if (val === "manual") {
              setValue("customerId", "");
            } else {
              setValue("customerName", "");
              setValue("customerPhone", "");
              setValue("customerAddress", "");
            }
          }}
        />
      </div>

      {watchedCustomerType === "existing" ? (
        <div>
          <SelectField
            label="Select Customer"
            name="customerId"
            required={true}
            control={control}
            error={errors.customerId?.message}
            options={customers.map((c) => ({
              value: c._id,
              label: `${c.name} - ${c.phone}`,
            }))}
            validation={{ required: "Customer is required" }}
            icon={User}
            disabled={isEditMode || isInitialLoading}
            placeholder="Select a customer..."
            onChange={(val) => {
              setValue("customerId", val, { shouldValidate: true });
              handleCustomerSelect(val);
            }}
          />
          {selectedCustomer && (
            <div className="mt-2 text-sm text-[var(--color-primary)] font-medium bg-blue-50 p-2 rounded-md inline-block">
              Available Credit: <span className="font-bold">{formatCurrency(selectedCustomer.creditBalance || 0)}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="Customer Name"
            name="customerName"
            register={register}
            error={errors.customerName?.message}
            validation={{ required: "Customer Name is required" }}
            icon={User}
            disabled={isEditMode}
          />
          <InputField
            label="Phone Number"
            name="customerPhone"
            register={register}
            error={errors.customerPhone?.message}
            icon={Phone}
            disabled={isEditMode}
          />
          <InputField
            label="Address"
            name="customerAddress"
            register={register}
            error={errors.customerAddress?.message}
            icon={MapPin}
            disabled={isEditMode}
          />
        </div>
      )}
    </div>
  );
};

export default SaleCustomerSelect;
