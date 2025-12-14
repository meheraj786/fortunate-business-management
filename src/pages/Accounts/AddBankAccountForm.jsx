import React, { useState, useEffect } from "react";
import FormDialog from "../../components/common/FormDialog";
import InputField from "../../components/forms/InputField";
import api from "../../api/axios";
import toast from "react-hot-toast";

const AddBankAccountForm = ({
  isOpen,
  onClose,
  editingAccount,
  onSuccess,
}) => {
  const initialBankData = {
    bankName: "",
    branchName: "",
    accountHolderName: "",
    accountName: "",
    accountNumber: "",
    swiftCode: "",
    routingNumber: "",
    balance: "",
  };

  const [bankFormData, setBankFormData] = useState(initialBankData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingAccount) {
      setBankFormData({
        bankName: editingAccount.bankName || "",
        branchName: editingAccount.branchName || "",
        accountHolderName: editingAccount.accountHolderName || "",
        accountName: editingAccount.accountName || "",
        accountNumber: editingAccount.accountNumber || "",
        swiftCode: editingAccount.swiftCode || "",
        routingNumber: editingAccount.routingNumber || "",
        balance: editingAccount.balance || "",
      });
    } else {
      setBankFormData(initialBankData);
    }
  }, [editingAccount, isOpen]);

  const handleBankFormChange = (e) => {
    const { name, value } = e.target;
    setBankFormData((prev) => ({ ...prev, [name]: value }));
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
        ...bankFormData,
        accountType: "Bank",
        balance: Number(bankFormData.balance) || 0,
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
      title={editingAccount ? "Update Bank Account" : "Add New Bank Account"}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          label="Bank Name"
          name="bankName"
          value={bankFormData.bankName}
          onChange={handleBankFormChange}
          required
        />
        <InputField
          label="Branch Name"
          name="branchName"
          value={bankFormData.branchName}
          onChange={handleBankFormChange}
          required
        />
        <InputField
          label="Account Holder Name"
          name="accountHolderName"
          value={bankFormData.accountHolderName}
          onChange={handleBankFormChange}
          required
        />
        <InputField
          label="Account Name"
          name="accountName"
          value={bankFormData.accountName}
          onChange={handleBankFormChange}
          placeholder="e.g., Primary Business Account"
          required
        />
        <InputField
          label="Account Number"
          name="accountNumber"
          value={bankFormData.accountNumber}
          onChange={handleBankFormChange}
          required
        />
        <InputField
          label="SWIFT Code"
          name="swiftCode"
          value={bankFormData.swiftCode}
          onChange={handleBankFormChange}
        />
        <InputField
          label="Routing Number"
          name="routingNumber"
          value={bankFormData.routingNumber}
          onChange={handleBankFormChange}
        />
        <InputField
          label="Initial Balance"
          name="balance"
          type="number"
          value={bankFormData.balance}
          onChange={handleBankFormChange}
          required
        />
      </div>
    </FormDialog>
  );
};

export default AddBankAccountForm;
