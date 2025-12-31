import React, { useState, useEffect } from "react";
import FormDialog from "@/components/ui/FormDialog";
import InputField from "@/components/ui/InputField";
import { handleError } from "@/utils/handle-error";
import api from "@/services/apiService";
import toast from "react-hot-toast";

const initialFormData = {
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
};

const AddAccountForm = ({ isOpen, onClose, editingAccount, onSuccess, accountType }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditing = !!editingAccount;
  const currentAccountType = isEditing ? editingAccount.accountType : accountType;

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setFormData({
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
        setFormData(initialFormData);
      }
    }
  }, [editingAccount, isOpen, isEditing]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAccount = async () => {
    setIsSubmitting(true);
    try {
      const url = isEditing
        ? `/account/update-account/${editingAccount._id}`
        : `/account/create-account`;
      const method = isEditing ? "patch" : "post";

      const { accountName, initialBalance, accountHolderName } = formData;
      let payload = { accountType: currentAccountType, accountName, accountHolderName };
      
      if (isEditing) {
        payload.balance = Number(formData.initialBalance) || 0;
      } else {
        payload.initialBalance = Number(initialBalance) || 0;
      }

      if (currentAccountType === "Bank") {
        payload = { ...payload, bankName: formData.bankName, branchName: formData.branchName, accountNumber: formData.accountNumber, swiftCode: formData.swiftCode, routingNumber: formData.routingNumber };
      } else if (currentAccountType === "Mobile Banking") {
        payload = { ...payload, serviceName: formData.serviceName, mobileNumber: formData.mobileNumber };
      }
      
      const response = await api[method](url, payload);

      if (response.data.success) {
        toast.success(response.data.message || `Account ${isEditing ? "updated" : "created"} successfully!`);
        onSuccess();
        onClose();
      } else {
        handleError(response, `Failed to ${isEditing ? "update" : "create"} account.`);
      }
    } catch (error) {
      handleError(error, "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
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
      primaryButtonText={isSubmitting ? (isEditing ? "Updating..." : "Adding...") : (isEditing ? "Update Account" : "Add Account")}
      secondaryButtonText="Cancel"
      onSubmit={handleSaveAccount}
      isPrimaryButtonDisabled={isSubmitting}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Account Name"
          name="accountName"
          value={formData.accountName}
          onChange={handleFormChange}
          placeholder={
            currentAccountType === "Bank"
              ? "e.g., My Personal Checking"
              : currentAccountType === "Mobile Banking"
              ? "e.g., My Bkash Account"
              : "e.g., Office Petty Cash"
          }
          required
        />
        <InputField
          label="Account Holder Name"
          name="accountHolderName"
          value={formData.accountHolderName}
          onChange={handleFormChange}
          placeholder="e.g., John Doe"
          required
        />
         <InputField
          label={isEditing ? "Current Balance" : "Initial Balance"}
          name="initialBalance"
          type="number"
          value={formData.initialBalance}
          onChange={handleFormChange}
          placeholder="e.g., 5000"
          disabled={isEditing}
        />

        {currentAccountType === "Bank" && (
          <>
            <InputField label="Bank Name" name="bankName" value={formData.bankName} onChange={handleFormChange} placeholder="e.g., Standard Chartered Bank" required />
            <InputField label="Branch Name" name="branchName" value={formData.branchName} onChange={handleFormChange} placeholder="e.g., Gulshan Branch" required />
            <InputField label="Account Number" name="accountNumber" value={formData.accountNumber} onChange={handleFormChange} placeholder="e.g., 1234567890" required />
            <InputField label="SWIFT Code" name="swiftCode" value={formData.swiftCode} onChange={handleFormChange} placeholder="e.g., SCBLBDDH" />
            <InputField label="Routing Number" name="routingNumber" value={formData.routingNumber} onChange={handleFormChange} placeholder="e.g., 001234567" />
          </>
        )}

        {currentAccountType === "Mobile Banking" && (
          <>
            <InputField label="Service Name" name="serviceName" value={formData.serviceName} onChange={handleFormChange} placeholder="e.g., Bkash, Nagad, Rocket" required />
            <InputField label="Mobile Number" name="mobileNumber" value={formData.mobileNumber} onChange={handleFormChange} placeholder="e.g., 01XXXXXXXXX" required />
          </>
        )}
      </div>
    </FormDialog>
  );
};

export default AddAccountForm;