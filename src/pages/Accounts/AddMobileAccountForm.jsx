import React, { useState, useEffect } from "react";
import FormDialog from "../../components/common/FormDialog";
import InputField from "../../components/forms/InputField";
import api from "../../api/axios";
import toast from "react-hot-toast";

const AddMobileAccountForm = ({
  isOpen,
  onClose,
  editingAccount,
  onSuccess,
}) => {
  const initialMobileData = {
    serviceName: "",
    mobileNumber: "",
    accountHolderName: "",
    accountName: "",
    balance: "",
  };

  const [mobileFormData, setMobileFormData] = useState(initialMobileData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingAccount) {
      setMobileFormData({
        serviceName: editingAccount.serviceName || "",
        mobileNumber: editingAccount.mobileNumber || "",
        accountHolderName: editingAccount.accountHolderName || "",
        accountName: editingAccount.accountName || "",
        balance: editingAccount.balance || "",
      });
    } else {
      setMobileFormData(initialMobileData);
    }
  }, [editingAccount, isOpen]);

  const handleMobileFormChange = (e) => {
    const { name, value } = e.target;
    setMobileFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAccount = async () => {
    setIsSubmitting(true);
    try {
      const isEditing = !!editingAccount;
      const url = isEditing
        ? `/account/update-account/${editingAccount._id}`
        : `/account/create-account`;
      const method = isEditing ? "patch" : "post";

      const payload = {
        ...mobileFormData,
        accountType: "Mobile Banking",
        balance: Number(mobileFormData.balance) || 0,
      };

      const response = await api[method](url, payload);

      if (response.data.success) {
        toast.success(
          response.data.message ||
            `Account ${isEditing ? "updated" : "created"} successfully!`
        );
        onSuccess();
      } else {
        toast.error(
          response.data.message ||
            `Failed to ${isEditing ? "update" : "create"} account.`
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An unexpected error occurred."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormDialog
      open={isOpen}
      onClose={onClose}
      title={
        editingAccount
          ? "Update Mobile Banking Account"
          : "Add New Mobile Banking Account"
      }
      primaryButtonText={
        isSubmitting
          ? editingAccount
            ? "Updating..."
            : "Adding..."
          : editingAccount
          ? "Update Account"
          : "Add Account"
      }
      secondaryButtonText="Cancel"
      onSubmit={handleSaveAccount}
      isPrimaryButtonDisabled={isSubmitting}
    >
      <div className="space-y-4">
        <InputField
          label="Service Name"
          name="serviceName"
          value={mobileFormData.serviceName}
          onChange={handleMobileFormChange}
          placeholder="e.g., Bkash, Nagad"
          required
        />
        <InputField
          label="Account Number"
          name="mobileNumber"
          value={mobileFormData.mobileNumber}
          onChange={handleMobileFormChange}
          required
        />
        <InputField
          label="Account Holder Name"
          name="accountHolderName"
          value={mobileFormData.accountHolderName}
          onChange={handleMobileFormChange}
          required
        />
        <InputField
          label="Account Name"
          name="accountName"
          value={mobileFormData.accountName}
          onChange={handleMobileFormChange}
          placeholder="e.g., Personal Bkash"
          required
        />
        <InputField
          label="Initial Balance"
          name="balance"
          type="number"
          value={mobileFormData.balance}
          onChange={handleMobileFormChange}
          required
        />
      </div>
    </FormDialog>
  );
};

export default AddMobileAccountForm;
