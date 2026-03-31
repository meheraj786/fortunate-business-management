import React, { useState, useMemo } from "react";
import FormDialog from "@/components/ui/FormDialog";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import ComboboxField from "@/components/ui/ComboboxField";
import { showErrorToast } from "@/utils/notifications";
import { useAccounts } from "@/api/hooks/account";
import { useCreateAdvancePayment } from "@/api/hooks/advancePayment";
import { formatAccountLabel } from "@/utils/format";
import { useSettings } from "@/context/SettingsContext";
import { AlertCircle, CheckCircle2 } from "lucide-react";

// Helper: current local datetime in YYYY-MM-DDTHH:MM format for datetime-local input
const getCurrentDateTimeLocal = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
};

const initialData = {
    supplierName: "",
    supplierPhone: "",
    purpose: "",
    amount: "",
    accountId: "",
    paymentMethod: "",
    date: getCurrentDateTimeLocal(),
    notes: "",
};

const paymentMethods = [
    { value: "Cash", label: "Cash" },
    { value: "Bank", label: "Bank" },
    { value: "Mobile Banking", label: "Mobile Banking" },
];

const CreateAdvancePaymentModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState(initialData);
    const { formatCurrency } = useSettings();

    const { data: accountsData, isLoading: areAccountsLoading } = useAccounts();
    const accounts = accountsData?.data || [];
    const createMutation = useCreateAdvancePayment();

    const filteredAccounts = useMemo(() => {
        if (!formData.paymentMethod) return [];
        return accounts.filter((acc) => acc.accountType === formData.paymentMethod);
    }, [accounts, formData.paymentMethod]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Selected account info for live balance feedback
    const selectedAccount = useMemo(() => {
        if (!formData.accountId) return null;
        return accounts.find((a) => a._id === formData.accountId);
    }, [formData.accountId, accounts]);

    const parsedAmount = Number(formData.amount) || 0;
    const balanceAfter = selectedAccount
        ? selectedAccount.balance - parsedAmount
        : null;
    const isInsufficientBalance = balanceAfter !== null && balanceAfter < 0;

    const handleSubmit = async () => {
        const { supplierName, amount, accountId, paymentMethod, date } = formData;

        if (!supplierName || !amount || !accountId || !paymentMethod || !date) {
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

        const payload = {
            ...formData,
            amount: parsedAmount,
            date: new Date(date).toISOString(),
        };

        createMutation.mutate(payload, {
            onSuccess: () => {
                setFormData(initialData);
                onSuccess();
            },
        });
    };

    const handleClose = () => {
        setFormData(initialData);
        onClose();
    };

    return (
        <FormDialog
            open={isOpen}
            onClose={handleClose}
            title="New Advance Payment"
            primaryButtonText={
                createMutation.isPending ? "Creating..." : "Create Advance"
            }
            secondaryButtonText="Cancel"
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isPending}
        >
            <div className="space-y-5">
                {/* Section: Supplier Info */}
                <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Supplier Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <InputField
                            label="Supplier Name"
                            name="supplierName"
                            value={formData.supplierName}
                            onChange={handleChange}
                            placeholder="e.g., Rahman Steel"
                            required
                        />
                        <InputField
                            label="Phone (optional)"
                            name="supplierPhone"
                            value={formData.supplierPhone}
                            onChange={handleChange}
                            placeholder="e.g., 01XXXXXXXXX"
                        />
                    </div>
                </div>

                {/* Section: Payment Details */}
                <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Payment Details
                    </h3>
                    <div className="space-y-3">
                        <InputField
                            label="Purpose (optional)"
                            name="purpose"
                            value={formData.purpose}
                            onChange={handleChange}
                            placeholder="e.g., 10mm steel sheets"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <InputField
                                label="Amount"
                                name="amount"
                                type="number"
                                value={formData.amount}
                                onChange={handleChange}
                                required
                                min="0"
                                placeholder="0.00"
                            />
                            <InputField
                                label="Date & Time"
                                name="date"
                                type="datetime-local"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>
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
                            <ComboboxField
                                label="Account"
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
                                placeholder={formData.paymentMethod ? "Search account..." : "Select payment method first"}
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
                    </div>
                </div>

                {/* Section: Notes */}
                <div>
                    <InputField
                        label="Notes (optional)"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Any additional details..."
                    />
                </div>
            </div>
        </FormDialog>
    );
};

export default CreateAdvancePaymentModal;
