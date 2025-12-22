import React, { useState, useEffect } from "react";
import FormDialog from "@/components/ui/FormDialog";
import InputField from "@/components/ui/InputField";
import api from "@/services/apiService";
import toast from "react-hot-toast";

const AddCashAccountForm = ({
  isOpen,
  onClose,
  editingAccount,
  onSuccess,
}) => {
  const initialCashData = {
    accountHolderName: "",
    accountName: "",
    balance: "",
  };

  const [cashFormData, setCashFormData] = useState(initialCashData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingAccount) {
      setCashFormData({
        accountHolderName: editingAccount.accountHolderName || "",
        accountName: editingAccount.accountName || "",
        balance: editingAccount.balance || "",
      });
    } else {
      setCashFormData(initialCashData);
    }
  }, [editingAccount, isOpen]);

  const handleCashFormChange = (e) => {
    const { name, value } = e.target;
    setCashFormData((prev) => ({ ...prev, [name]: value }));
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
        ...cashFormData,
        accountType: "Cash",
        balance: Number(cashFormData.balance) || 0,
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
          ? "Update Cash Account"
          : "Add New Cash Account"
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
          label="Account Holder Name"
          name="accountHolderName"
          value={cashFormData.accountHolderName}
          onChange={handleCashFormChange}
          required
        />
        <InputField
          label="Account Name"
          name="accountName"
          value={cashFormData.accountName}
          onChange={handleCashFormChange}
          placeholder="e.g., Office Drawer"
          required
        />
        <InputField
          label="Initial Balance"
          name="balance"
          type="number"
          value={cashFormData.balance}
          onChange={handleCashFormChange}
          required
        />
      </div>
    </FormDialog>
  );
};

export default AddCashAccountForm;
