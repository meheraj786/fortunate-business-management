import React, { useState } from "react";
import FormDialog from "@/components/ui/FormDialog";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import { showErrorToast } from "@/utils/notifications";
import { useAccounts } from "@/api/hooks/account";
import { useTransferMoney } from "@/api/hooks/transaction";
import { formatAccountLabel } from "@/utils/format";
import { useSettings } from "@/context/SettingsContext";

const TransferMoneyModal = ({ isOpen, onClose, onSuccess }) => {
    const { settings } = useSettings();
    const initialTransferData = {
        fromAccountId: "",
        toAccountId: "",
        amount: "",
        description: "",
    };

    const [transferData, setTransferData] = useState(initialTransferData);

    // Fetch accounts using react-query hook
    const { data: accountsData, isLoading: areAccountsLoading } = useAccounts();
    const accounts = accountsData?.data || [];

    // Mutation for transfer
    const transferMutation = useTransferMoney();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTransferData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        const { fromAccountId, toAccountId, amount } = transferData;

        if (!fromAccountId || !toAccountId || !amount) {
            showErrorToast("Please fill all required fields.");
            return;
        }

        if (fromAccountId === toAccountId) {
            showErrorToast("Source and destination accounts must be different.");
            return;
        }

        if (Number(amount) <= 0) {
            showErrorToast("Amount must be greater than zero.");
            return;
        }

        // Optional: Client-side balance check
        const sourceAccount = accounts.find((a) => a._id === fromAccountId);
        if (sourceAccount && sourceAccount.balance < Number(amount)) {
            showErrorToast(`Insufficient balance in ${sourceAccount.accountName}.`);
            return;
        }

        // Automatically set the date to current ISO string
        const payload = {
            ...transferData,
            date: new Date().toISOString(),
            amount: Number(amount),
        };

        transferMutation.mutate(payload, {
            onSuccess: () => {
                setTransferData(initialTransferData);
                onSuccess();
                onClose();
            },
        });
    };

    // Filter accounts for destination dropdown
    const destinationAccounts = accounts.filter(
        (acc) => acc._id !== transferData.fromAccountId
    );

    return (
        <FormDialog
            open={isOpen}
            onClose={onClose}
            title="Transfer Money"
            primaryButtonText={
                transferMutation.isLoading ? "Transferring..." : "Transfer"
            }
            secondaryButtonText="Cancel"
            onSubmit={handleSubmit}
            isSubmitting={transferMutation.isLoading || areAccountsLoading}
        >
            <div className="space-y-4">
                <SelectField
                    label="From Account"
                    name="fromAccountId"
                    value={transferData.fromAccountId}
                    onChange={handleChange}
                    options={accounts.map((acc) => ({
                        value: acc._id,
                        label: `${formatAccountLabel(acc)} - Balance: ${acc.balance}`,
                    }))}
                    required={true}
                    loading={areAccountsLoading}
                    placeholder="Select source account"
                />

                <SelectField
                    label="To Account"
                    name="toAccountId"
                    value={transferData.toAccountId}
                    onChange={handleChange}
                    options={destinationAccounts.map((acc) => ({
                        value: acc._id,
                        label: formatAccountLabel(acc),
                    }))}
                    required={true}
                    loading={areAccountsLoading}
                    placeholder="Select destination account"
                    disabled={!transferData.fromAccountId}
                />

                <InputField
                    label="Amount"
                    name="amount"
                    type="number"
                    value={transferData.amount}
                    onChange={handleChange}
                    required={true}
                    min="0"
                />



                <InputField
                    label="Description / Reference"
                    name="description"
                    value={transferData.description}
                    onChange={handleChange}
                    placeholder="e.g., Transfer for petty cash"
                />
            </div>
        </FormDialog>
    );
};

export default TransferMoneyModal;
