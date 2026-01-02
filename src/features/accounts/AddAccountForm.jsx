import React, { useEffect } from "react";
import FormDialog from "@/components/ui/FormDialog";
import InputField from "@/components/ui/InputField";
import { handleError } from "@/utils/handle-error";
import toast from "react-hot-toast";
import { useCreateAccount, useUpdateAccount } from "@/api/hooks/account";
import { useForm } from "react-hook-form"; // Import useForm

const AddAccountForm = ({
  isOpen,
  onClose,
  editingAccount,
  onSuccess,
  accountType,
}) => {
  const isEditing = !!editingAccount;
  const currentAccountType = isEditing
    ? editingAccount.accountType
    : accountType;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      accountName: "",
      initialBalance: "",
      accountHolderName: "",
      bankName: "",
      branchName: "",
      accountNumber: "",
      swiftCode: "",
      routingNumber: "",
      serviceName: "",
      mobileNumber: "",
    },
  });

  const createAccountMutation = useCreateAccount();
  const updateAccountMutation = useUpdateAccount();
  const isSubmitting =
    createAccountMutation.isLoading || updateAccountMutation.isLoading;

  useEffect(() => {
    if (isOpen) {
      if (isEditing && editingAccount) {
        reset({
          accountName: editingAccount.accountName || "",
          initialBalance: editingAccount.balance || "",
          accountHolderName: editingAccount.accountHolderName || "",
          bankName: editingAccount.bankName || "",
          branchName: editingAccount.branchName || "",
          accountNumber: editingAccount.accountNumber || "",
          swiftCode: editingAccount.swiftCode || "",
          routingNumber: editingAccount.routingNumber || "",
          serviceName: editingAccount.serviceName || "",
          mobileNumber: editingAccount.mobileNumber || "",
        });
      } else {
        reset();
      }
    }
  }, [editingAccount, isOpen, isEditing, reset]);

  // Watch account type for conditional rendering
  const watchedAccountType = watch("accountType") || currentAccountType;

  const onSubmit = (data) => {
    let payload = {
      accountType: watchedAccountType,
      accountName: data.accountName,
      accountHolderName: data.accountHolderName,
    };

    if (isEditing) {
      payload.balance = Number(data.initialBalance) || 0;
    } else {
      payload.initialBalance = Number(data.initialBalance) || 0;
    }

    if (watchedAccountType === "Bank") {
      payload = {
        ...payload,
        bankName: data.bankName,
        branchName: data.branchName,
        accountNumber: data.accountNumber,
        swiftCode: data.swiftCode,
        routingNumber: data.routingNumber,
      };
    } else if (watchedAccountType === "Mobile Banking") {
      payload = {
        ...payload,
        serviceName: data.serviceName,
        mobileNumber: data.mobileNumber,
      };
    }

    const mutation = isEditing ? updateAccountMutation : createAccountMutation;
    const mutationPayload = isEditing
      ? { id: editingAccount._id, data: payload }
      : payload;

    mutation.mutate(mutationPayload, {
      onSuccess: (response) => {
        toast.success(
          response.data.message ||
            `Account ${isEditing ? "updated" : "created"} successfully!`
        );
        onSuccess();
        onClose();
      },
      onError: (error) => {
        handleError(
          error,
          `Failed to ${isEditing ? "update" : "create"} account.`
        );
      },
    });
  };

  const getTitle = () => {
    const action = isEditing ? "Update" : "Add New";
    switch (currentAccountType) {
      case "Bank":
        return `${action} Bank Account`;
      case "Mobile Banking":
        return `${action} Mobile Banking Account`;
      case "Cash":
        return `${action} Cash Account`;
      default:
        return `${action} Account`;
    }
  };

  return (
    <FormDialog
      open={isOpen}
      onClose={onClose}
      title={getTitle()}
      primaryButtonText={
        isSubmitting
          ? isEditing
            ? "Updating..."
            : "Adding..."
          : isEditing
          ? "Update Account"
          : "Add Account"
      }
      secondaryButtonText="Cancel"
      onSubmit={handleSubmit(onSubmit)} // Use handleSubmit from react-hook-form
      isSubmitting={isSubmitting}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Account Name"
          name="accountName"
          register={register}
          error={errors.accountName?.message}
          validation={{ required: "Account Name is required" }}
          placeholder={
            currentAccountType === "Bank"
              ? "e.g., My Personal Checking"
              : currentAccountType === "Mobile Banking"
              ? "e.g., My Bkash Account"
              : "e.g., Office Petty Cash"
          }
        />
        <InputField
          label="Account Holder Name"
          name="accountHolderName"
          register={register}
          error={errors.accountHolderName?.message}
          validation={{ required: "Account Holder Name is required" }}
          placeholder="e.g., John Doe"
        />
        <InputField
          label={isEditing ? "Current Balance" : "Initial Balance"}
          name="initialBalance"
          type="number"
          register={register}
          error={errors.initialBalance?.message}
          validation={{
            required: "Initial Balance is required",
            min: { value: 0, message: "Balance cannot be negative" },
            valueAsNumber: true,
          }}
          disabled={isEditing}
          placeholder="e.g., 5000"
        />

        {watchedAccountType === "Bank" && (
          <>
            <InputField
              label="Bank Name"
              name="bankName"
              register={register}
              error={errors.bankName?.message}
              validation={{ required: "Bank Name is required" }}
              placeholder="e.g., Standard Chartered Bank"
            />
            <InputField
              label="Branch Name"
              name="branchName"
              register={register}
              error={errors.branchName?.message}
              validation={{ required: "Branch Name is required" }}
              placeholder="e.g., Gulshan Branch"
            />
            <InputField
              label="Account Number"
              name="accountNumber"
              register={register}
              error={errors.accountNumber?.message}
              validation={{ required: "Account Number is required" }}
              placeholder="e.g., 1234567890"
            />
            <InputField
              label="SWIFT Code"
              name="swiftCode"
              register={register}
              placeholder="e.g., SCBLBDDH"
            />
            <InputField
              label="Routing Number"
              name="routingNumber"
              register={register}
              placeholder="e.g., 001234567"
            />
          </>
        )}

        {watchedAccountType === "Mobile Banking" && (
          <>
            <InputField
              label="Service Name"
              name="serviceName"
              register={register}
              error={errors.serviceName?.message}
              validation={{ required: "Service Name is required" }}
              placeholder="e.g., Bkash, Nagad, Rocket"
            />
            <InputField
              label="Mobile Number"
              name="mobileNumber"
              register={register}
              error={errors.mobileNumber?.message}
              validation={{
                required: "Mobile Number is required",
                pattern: {
                  value: /^[0-9]+$/,
                  message: "Invalid mobile number",
                },
              }}
              placeholder="e.g., 01XXXXXXXXX"
            />
          </>
        )}
      </div>
    </FormDialog>
  );
};

export default AddAccountForm;
