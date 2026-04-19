import React, { useState, useMemo } from "react";
import FormDialog from "@/components/ui/FormDialog";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import ComboboxField from "@/components/ui/ComboboxField";
import { showErrorToast } from "@/utils/notifications";
import { useAccounts } from "@/api/hooks/account";
import { useRefundAdvancePayment } from "@/api/hooks/advancePayment";
import { useSettings } from "@/context/SettingsContext";
import { formatAccountLabel } from "@/utils/format";

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

const RefundAdvanceModal = ({ isOpen, onClose, advancePayment, onSuccess }) => {
    const { formatCurrency } = useSettings();
    const { data: accountsData, isLoading: areAccountsLoading } = useAccounts();
    const accounts = accountsData?.data || [];
    const refundMutation = useRefundAdvancePayment();

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

    const addedAmount = advancePayment
        ? (advancePayment.additions || []).reduce(
            (sum, a) => sum + (a.amount || 0),
            0,
        )
        : 0;
    const totalAmount = advancePayment
        ? advancePayment.amount + addedAmount
        : 0;
    const refundedAmount = advancePayment
        ? (advancePayment.refunds || []).reduce(
            (sum, r) => sum + (r.amount || 0),
            0,
        )
        : 0;
    const remainingAmount = totalAmount - refundedAmount;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        const { amount, accountId, paymentMethod, date } = formData;

        if (!amount || !accountId || !paymentMethod || !date) {
            showErrorToast("Please fill all required fields.");
            return;
        }
        if (Number(amount) <= 0) {
            showErrorToast("Refund amount must be greater than zero.");
            return;
        }
        if (Number(amount) > remainingAmount + 0.01) {
            showErrorToast(
                `Refund amount cannot exceed the remaining amount (${formatCurrency(remainingAmount)}).`,
            );
            return;
        }

        refundMutation.mutate(
            {
                id: advancePayment._id,
                data: {
                    ...formData,
                    amount: Number(amount),
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
            title="Refund Advance Payment"
            primaryButtonText={
                refundMutation.isPending ? "Processing..." : "Process Refund"
            }
            secondaryButtonText="Cancel"
            onSubmit={handleSubmit}
            isSubmitting={refundMutation.isPending}
        >
            <div className="space-y-4">
                {/* Summary */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span className="text-blue-600">Original Advance</span>
                        <span className="font-medium text-blue-800">
                            {formatCurrency(advancePayment.amount)}
                        </span>
                    </div>
                    {refundedAmount > 0 && (
                        <div className="flex justify-between">
                            <span className="text-blue-600">Already Refunded</span>
                            <span className="font-medium text-blue-800">
                                {formatCurrency(refundedAmount)}
                            </span>
                        </div>
                    )}
                    <hr className="border-blue-200" />
                    <div className="flex justify-between">
                        <span className="text-blue-700 font-medium">Available to Refund</span>
                        <span className="font-bold text-blue-800">
                            {formatCurrency(remainingAmount)}
                        </span>
                    </div>
                </div>

                <InputField
                    label="Refund Amount"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    min="0"
                    max={remainingAmount}
                    placeholder={`Max: ${remainingAmount}`}
                />

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
                    placeholder="Select payment method"
                />

                <ComboboxField
                    label="Receive Into Account"
                    name="accountId"
                    value={formData.accountId}
                    onChange={(val) =>
                        handleChange({ target: { name: "accountId", value: val } })
                    }
                    options={filteredAccounts
                        .map((acc) => ({
                            value: acc._id,
                            label: formatAccountLabel(acc),
                        }))
                        .sort((a, b) => a.label.localeCompare(b.label))}
                    required
                    loading={areAccountsLoading}
                    placeholder={formData.paymentMethod ? "Search account for refund..." : "Select payment method first"}
                    disabled={!formData.paymentMethod}
                />

                <InputField
                    label="Date & Time"
                    name="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={handleChange}
                    required
                />

                <InputField
                    label="Note"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="Optional reason for refund..."
                />
            </div>
        </FormDialog>
    );
};

export default RefundAdvanceModal;
