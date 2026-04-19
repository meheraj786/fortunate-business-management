import React from "react";
import { useForm } from "react-hook-form";
import { User, Phone, MapPin, Building, DollarSign } from "lucide-react";
import { useCreateCustomer } from "@/api/hooks/customer";
import { getBusinessDateTimeISO } from "@/utils/date.util";
import { useSettings } from "@/context/SettingsContext";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import FormDialog from "@/components/ui/FormDialog";

const QuickAddCustomerModal = ({ isOpen, onClose, onSave }) => {
  const { settings } = useSettings();
  const createCustomerMutation = useCreateCustomer();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, isSubmitting },
    reset,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      phone: "",
      billingAddress: "",
      customerType: "Retail",
      creditLimit: 0,
    },
  });

  // Reset form when opened
  React.useEffect(() => {
    if (isOpen) {
      reset({
        name: "",
        phone: "",
        billingAddress: "",
        customerType: "Retail",
        creditLimit: 0,
      });
    }
  }, [isOpen, reset]);

  const customerTypes = [
    { value: "Retail", label: "Retail" },
    { value: "Wholesale", label: "Wholesale" },
  ];

  const onSubmit = async (data) => {
    // Hidden default fields
    const processedData = {
      ...data,
      creditLimit: Number(data.creditLimit) || 0,
      customerStatus: "Active",
      openingDue: 0,
      joinDate: getBusinessDateTimeISO(settings?.timezone),
    };

    if (!processedData.phone?.trim()) delete processedData.phone;
    if (!processedData.billingAddress?.trim()) delete processedData.billingAddress;

    const formData = new FormData();
    formData.append("customerData", JSON.stringify(processedData));
    
    // Quick Add doesn't support documents, we just pass the form data
    createCustomerMutation.mutate(formData, {
      onSuccess: (responseData) => {
        if (onSave) onSave(responseData);
        onClose();
      },
    });
  };

  return (
    <FormDialog
      open={isOpen}
      onClose={onClose}
      title="Quick Create Customer"
      primaryButtonText="Create Customer"
      secondaryButtonText="Cancel"
      onSubmit={handleSubmit(onSubmit)}
      isPrimaryButtonDisabled={!isValid || isSubmitting}
      isSubmitting={isSubmitting || createCustomerMutation.isPending}
    >
      <div className="space-y-4 pt-2 pb-4">
        <InputField
          label="Full Name"
          name="name"
          register={register}
          required
          placeholder="New Customer Name"
          icon={User}
          error={errors.name?.message}
          validation={{ required: "Full name is required" }}
        />
        <InputField
          label="Phone Number"
          name="phone"
          register={register}
          placeholder="+880 1712-345678 (Optional)"
          icon={Phone}
          error={errors.phone?.message}
          validation={{
            pattern: {
              value: /^([+]?[0-9\s\-()]+)?$/,
              message: "Invalid phone number format",
            },
          }}
        />
        <InputField
          label="Address"
          name="billingAddress"
          register={register}
          placeholder="Dhanmondi, Dhaka (Optional)"
          icon={MapPin}
          error={errors.billingAddress?.message}
        />
        <SelectField
          label="Customer Type"
          name="customerType"
          control={control}
          options={customerTypes}
          icon={Building}
          error={errors.customerType?.message}
        />
        <InputField
          label="Credit Limit"
          name="creditLimit"
          register={register}
          type="number"
          placeholder="0"
          icon={DollarSign}
          min="0"
          step="0.01"
          error={errors.creditLimit?.message}
          validation={{
            min: { value: 0, message: "Credit limit cannot be negative" },
          }}
          helperText="Default 0 = No due allowed"
        />
      </div>
    </FormDialog>
  );
};

export default QuickAddCustomerModal;
