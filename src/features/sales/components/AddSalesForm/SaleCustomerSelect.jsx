import React from "react";
import { User, MapPin, Phone } from "lucide-react";
import SelectField from "@/components/ui/SelectField";
import InputField from "@/components/ui/InputField";

const SaleCustomerSelect = ({
  register,
  errors,
  setValue,
  watch,
  customers,
  isEditMode,
  isInitialLoading,
}) => {
  const watchedCustomerType = watch("customerType");

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
          register={register}
          error={errors.customerType?.message}
          options={[
            { value: "existing", label: "Existing Customer" },
            { value: "manual", label: "Manual Input" },
          ]}
          validation={{ required: "Customer type is required" }}
          disabled={isEditMode}
          onChange={(e) => {
            setValue("customerType", e.target.value);
            if (e.target.value === "manual") {
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
        <SelectField
          label="Select Customer"
          name="customerId"
          required={true}
          register={register}
          error={errors.customerId?.message}
          options={customers.map((c) => ({
            value: c._id,
            label: `${c.name} - ${c.phone}`,
          }))}
          validation={{ required: "Customer is required" }}
          icon={User}
          disabled={isEditMode || isInitialLoading}
          onChange={(e) => {
            setValue("customerId", e.target.value, { shouldValidate: true });
            handleCustomerSelect(e.target.value);
          }}
        />
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
