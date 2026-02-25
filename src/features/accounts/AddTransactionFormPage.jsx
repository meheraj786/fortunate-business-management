import React, { useState } from "react";
import FormDialog from "@/components/ui/FormDialog";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import { showErrorToast } from "@/utils/notifications";
import { useAccounts } from "@/api/hooks/account";
import { useCreateTransaction } from "@/api/hooks/transaction";
import { formatAccountLabel } from "@/utils/format";
import { useSettings } from "@/context/SettingsContext";
import { getBusinessDateISO, getBusinessDateTimeISO } from "@/utils/date.util";

const AddTransactionForm = ({ isOpen, onClose, onSuccess }) => {
  const { settings } = useSettings();
  const initialTransactionData = {
    account: "",
    date: getBusinessDateTimeISO(settings?.timezone),
    description: "",
    type: "Credit",
    amount: "",
  };

  const [transactionFormData, setTransactionFormData] = useState(
    initialTransactionData,
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
    const { account, description, type, amount } = transactionFormData;
    if (!account || !description || !type || !amount) {
      showErrorToast("Please fill all required fields.");
      return;
    }

    const payload = {
      ...transactionFormData,
      amount: Number(amount),
    };

    createTransactionMutation.mutate(payload, {
      onSuccess: () => {
        onSuccess();
      },
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
          onChange={(val) => handleTransactionFormChange({ target: { name: "account", value: val } })}
          options={accounts.map((acc) => ({
            value: acc._id,
            label: formatAccountLabel(acc),
          }))}
          required={true}
          loading={areAccountsLoading}
          placeholder="Select an account"
        />
        <SelectField
          label="Transaction Type"
          name="type"
          value={transactionFormData.type}
          onChange={(val) => handleTransactionFormChange({ target: { name: "type", value: val } })}
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
          label="Date & Time"
          name="date"
          type="datetime-local"
          value={transactionFormData.date}
          onChange={handleTransactionFormChange}
          required={true}
        />
      </div>
    </FormDialog>
  );
};

export default AddTransactionForm;
