import React, { useState, useEffect } from "react";
import FormDialog from "@/components/ui/FormDialog";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import { handleError } from "@/utils/handle-error";
import api from "@/services/apiService";
import toast from "react-hot-toast";

const AddTransactionForm = ({ isOpen, onClose, onSuccess }) => {
  const initialTransactionData = {
    account: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    type: "Credit",
    amount: "",
  };

  const [transactionFormData, setTransactionFormData] = useState(
    initialTransactionData
  );
  const [accounts, setAccounts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api
        .get(`/account/get-all-accounts`)
        .then((res) => {
          if (res.data.success) {
            setAccounts(res.data.data);
          }
        })
        .catch((err) => {
          handleError(err, "Failed to load accounts for the form.");
        });
    }
  }, [isOpen]);

  const handleTransactionFormChange = (e) => {
    const { name, value } = e.target;
    setTransactionFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTransaction = async () => {
    setIsSubmitting(true);
    try {
      const { account, date, description, type, amount } =
        transactionFormData;
      if (!account || !description || !type || !amount) {
        toast.error("Please fill all required fields.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        ...transactionFormData,
        amount: Number(amount),
      };

      const response = await api.post(`/transaction`, payload);

      if (response.data.success) {
        toast.success(
          response.data.message || "Transaction created successfully!"
        );
        onSuccess();
      } else {
        handleError(response, "Failed to create transaction.");
      }
    } catch (error) {
      handleError(error, "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormDialog
      open={isOpen}
      onClose={onClose}
      title="Add New Transaction"
      primaryButtonText={isSubmitting ? "Adding..." : "Add Transaction"}
      secondaryButtonText="Cancel"
      onSubmit={handleAddTransaction}
      isPrimaryButtonDisabled={isSubmitting}
    >
      <div className="space-y-4">
        <SelectField
          label="Account"
          name="account"
          value={transactionFormData.account}
          onChange={handleTransactionFormChange}
          options={accounts.map((acc) => ({
            value: acc._id,
            label: `${acc.accountName} (${acc.bankName || acc.serviceName})`,
          }))}
          required
        />
        <SelectField
          label="Transaction Type"
          name="type"
          value={transactionFormData.type}
          onChange={handleTransactionFormChange}
          options={[
            { value: "Credit", label: "Incoming (Credit)" },
            { value: "Debit", label: "Outgoing (Debit)" },
          ]}
          required
        />
        <InputField
          label="Amount"
          name="amount"
          type="number"
          value={transactionFormData.amount}
          onChange={handleTransactionFormChange}
          required
        />
        <InputField
          label="Description"
          name="description"
          value={transactionFormData.description}
          onChange={handleTransactionFormChange}
          required
        />
        <InputField
          label="Date"
          name="date"
          type="date"
          value={transactionFormData.date}
          onChange={handleTransactionFormChange}
          required
        />
      </div>
    </FormDialog>
  );
};

export default AddTransactionForm;
