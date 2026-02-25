import React, { useState, useMemo } from "react";
import FormDialog from "@/components/ui/FormDialog";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import { showErrorToast } from "@/utils/notifications";
import { useAccounts } from "@/api/hooks/account";
import { useAddToAdvancePayment } from "@/api/hooks/advancePayment";
import { useSettings } from "@/context/SettingsContext";
import { formatAccountLabel } from "@/utils/format";
import { AlertCircle, CheckCircle2 } from "lucide-react";

// Helper: current local datetime in YYYY-MM-DDTHH:MM format for datetime-local input
const getCurrentDateTimeLocal = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
};

const paymentMethods = [
    { value: "Cash", label: "Cash" },
    { value: "Bank", label: "Bank" },
    { value: "Mobile Banking", label: "Mobile Banking" },
];

const AddToAdvanceModal = ({ isOpen, onClose, advancePayment, onSuccess }) => {
    const { formatCurrency } = useSettings();
    const { data: accountsData, isLoading: areAccountsLoading } = useAccounts();
    const accounts = accountsData?.data || [];
    const addMutation = useAddToAdvancePayment();

    const [formData, setFormData] = useState({
        amount: "",
        accountId: "",
        paymentMethod: "",
        date: getCurrentDateTimeLocal(),
        note: "",
    });

    const filteredAccounts = useMemo(() => {
        if (!formData.paymentMethod) return [];
        return accounts.filter((acc) => acc.accountType === formData.paymentMethod);
    }, [accounts, formData.paymentMethod]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Current total (original + past additions)
    const currentTotal = useMemo(() => {
        if (!advancePayment) return 0;
        const addedSoFar = (advancePayment.additions || []).reduce(
            (sum, a) => sum + (a.amount || 0),
            0,
        );
        return advancePayment.amount + addedSoFar;
    }, [advancePayment]);

    const parsedAmount = Number(formData.amount) || 0;
    const newTotal = currentTotal + parsedAmount;

    // Live balance feedback
    const selectedAccount = useMemo(() => {
        if (!formData.accountId) return null;
        return accounts.find((a) => a._id === formData.accountId);
    }, [formData.accountId, accounts]);

    const balanceAfter = selectedAccount
        ? selectedAccount.balance - parsedAmount
        : null;
    const isInsufficientBalance = balanceAfter !== null && balanceAfter < 0;

    const handleSubmit = () => {
        const { amount, accountId, paymentMethod, date } = formData;

        if (!amount || !accountId || !paymentMethod || !date) {
            showErrorToast("Please fill all required fields.");
            return;
        }
        if (parsedAmount <= 0) {
            showErrorToast("Amount must be greater than zero.");
            return;
        }
        if (isInsufficientBalance) {
            showErrorToast(
                `Insufficient balance in ${selectedAccount.accountName}. Available: ${formatCurrency(selectedAccount.balance)}`,
            );
            return;
        }

        addMutation.mutate(
            {
                id: advancePayment._id,
                data: {
                    ...formData,
                    amount: parsedAmount,
                    date: new Date(date).toISOString(),
                },
            },
            {
                onSuccess: () => {
                    setFormData({
                        amount: "",
                        accountId: "",
                        paymentMethod: "",
                        date: getCurrentDateTimeLocal(),
                        note: "",
                    });
                    onSuccess();
                },
            },
        );
    };

    const handleClose = () => {
        setFormData({
            amount: "",
            accountId: "",
            paymentMethod: "",
            date: getCurrentDateTimeLocal(),
            note: "",
        });
        onClose();
    };

    if (!advancePayment) return null;

    return (
        <FormDialog
            open={isOpen}
            onClose={handleClose}
            title="Add More to Advance"
            primaryButtonText={
                addMutation.isPending ? "Processing..." : "Add Amount"
            }
            secondaryButtonText="Cancel"
            onSubmit={handleSubmit}
            isSubmitting={addMutation.isPending}
        >
            <div className="space-y-4">
                {/* Context Summary */}
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span className="text-amber-600">Supplier</span>
                        <span className="font-medium text-amber-800">
                            {advancePayment.supplierName}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-amber-600">Current Total</span>
                        <span className="font-medium text-amber-800">
                            {formatCurrency(currentTotal)}
                        </span>
                    </div>
                    {parsedAmount > 0 && (
                        <>
                            <hr className="border-amber-200" />
                            <div className="flex justify-between">
                                <span className="text-amber-700 font-medium">New Total</span>
                                <span className="font-bold text-amber-800">
                                    {formatCurrency(newTotal)}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                <InputField
                    label="Additional Amount"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="0.00"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <SelectField
                        label="Payment Method"
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={(val) => {
                            handleChange({ target: { name: "paymentMethod", value: val } });
                            handleChange({ target: { name: "accountId", value: "" } });
                        }}
                        options={paymentMethods}
                        required
                        placeholder="Select method"
                    />
                    <SelectField
                        label="Pay From Account"
                        name="accountId"
                        value={formData.accountId}
                        onChange={(val) =>
                            handleChange({ target: { name: "accountId", value: val } })
                        }
                        options={filteredAccounts.map((acc) => ({
                            value: acc._id,
                            label: formatAccountLabel(acc),
                        }))}
                        required
                        loading={areAccountsLoading}
                        placeholder={formData.paymentMethod ? "Select account" : "Select payment method first"}
                        disabled={!formData.paymentMethod}
                    />
                </div>

                {/* Live Balance Feedback */}
                {selectedAccount && parsedAmount > 0 && (
                    <div
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${isInsufficientBalance
                            ? "bg-red-50 border-red-200 text-[var(--color-danger)]"
                            : "bg-green-50 border-green-200 text-green-700"
                            }`}
                    >
                        {isInsufficientBalance ? (
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        ) : (
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        )}
                        <div>
                            <span className="font-medium">
                                {selectedAccount.accountName}
                            </span>
                            {" · "}
                            Current: {formatCurrency(selectedAccount.balance)}
                            {" → "}
                            After: {formatCurrency(balanceAfter)}
                        </div>
                    </div>
                )}

                <InputField
                    label="Date & Time"
                    name="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={handleChange}
                    required
                />

                <InputField
                    label="Note (optional)"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="Reason for additional payment..."
                />
            </div>
        </FormDialog>
    );
};

export default AddToAdvanceModal;
