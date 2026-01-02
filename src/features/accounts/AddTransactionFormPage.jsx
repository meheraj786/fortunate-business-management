import React, { useState } from "react";
import FormDialog from "@/components/ui/FormDialog";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import { handleError } from "@/utils/handle-error";
import toast from "react-hot-toast";
import { useAccounts } from "@/api/hooks/account";
import { useCreateTransaction } from "@/api/hooks/transaction";

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

  // Fetch accounts using react-query hook
  const { data: accountsData, isLoading: areAccountsLoading } = useAccounts();
  const accounts = accountsData?.data || [];

  // Mutation for creating a transaction
  const createTransactionMutation = useCreateTransaction();

  const handleTransactionFormChange = (e) => {
    const { name, value } = e.target;
    setTransactionFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTransaction = async () => {
    const { account, date, description, type, amount } = transactionFormData;
    if (!account || !description || !type || !amount) {
      toast.error("Please fill all required fields.");
      return;
    }

    const payload = {
      ...transactionFormData,
      amount: Number(amount),
    };

    createTransactionMutation.mutate(payload, {
      onSuccess: (response) => {
        toast.success(
          response.data.message || "Transaction created successfully!"
        );
        onSuccess();
      },
      // onError is handled by the hook definition
    });
  };

  return (
    <FormDialog
      open={isOpen}
      onClose={onClose}
      title="Add New Transaction"
      primaryButtonText={
        createTransactionMutation.isLoading ? "Adding..." : "Add Transaction"
      }
      secondaryButtonText="Cancel"
      onSubmit={handleAddTransaction}
      isSubmitting={createTransactionMutation.isLoading || areAccountsLoading}
    >
      <div className="space-y-4">
        <SelectField
          label="Account"
          name="account"
          value={transactionFormData.account}
          onChange={handleTransactionFormChange}
          options={accounts.map((acc) => ({
            value: acc._id,
            label: `${acc.accountName} (${
              acc.bankName || acc.serviceName || "Cash"
            })`,
          }))}
          required={true}
          loading={areAccountsLoading}
          placeholder="Select an account"
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
          required={true}
        />
        <InputField
          label="Amount"
          name="amount"
          type="number"
          value={transactionFormData.amount}
          onChange={handleTransactionFormChange}
          required={true}
        />
        <InputField
          label="Description"
          name="description"
          value={transactionFormData.description}
          onChange={handleTransactionFormChange}
          required={true}
        />
        <InputField
          label="Date"
          name="date"
          type="date"
          value={transactionFormData.date}
          onChange={handleTransactionFormChange}
          required={true}
        />
      </div>
    </FormDialog>
  );
};

export default AddTransactionForm;
