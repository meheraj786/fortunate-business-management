import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import FormDialog from "@/components/ui/FormDialog";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import TextAreaField from "@/components/ui/TextAreaField";
import { useWithdrawStoreCredit } from "@/api/hooks/customer";
import { useAccounts } from "@/api/hooks/account";
import { formatAccountLabel } from "@/utils/format";
import { showSuccessToast, showErrorToast } from "@/utils/notifications";
import { getBusinessDateTimeISO } from "@/utils/date.util";
import { useSettings } from "@/context/SettingsContext";

const WithdrawCreditModal = ({ isOpen, onClose, customerId, creditBalance = 0 }) => {
    const { settings, formatCurrency } = useSettings();
    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            amount: "",
            paymentMethod: "Cash",
            accountId: "",
            date: getBusinessDateTimeISO(settings?.timezone),
            reason: "",
        },
    });

    const { data: accountsData } = useAccounts();
    const accounts = React.useMemo(() => accountsData?.data || [], [accountsData]);
    const withdrawMutation = useWithdrawStoreCredit();

    const watchedPaymentMethod = watch("paymentMethod");
    const watchedAmount = watch("amount");

    useEffect(() => {
        if (isOpen) {
            reset({
                amount: "",
                paymentMethod: "Cash",
                accountId: "",
                date: getBusinessDateTimeISO(settings?.timezone),
                reason: "",
            });
        }
    }, [isOpen, reset]);

    // Set default account when method changes
    useEffect(() => {
        if (watchedPaymentMethod && accounts.length > 0) {
            const filtered = accounts.filter(
                (acc) => acc.accountType === watchedPaymentMethod,
            );
            if (filtered.length > 0) {
                setValue("accountId", filtered[0]._id);
            } else {
                setValue("accountId", "");
            }
        }
    }, [watchedPaymentMethod, accounts, setValue]);

    const handleClose = () => {
        reset();
        onClose();
    };

    const onSubmit = (data) => {
        withdrawMutation.mutate(
            {
                id: customerId,
                data: { ...data, amount: parseFloat(data.amount) },
            },
            {
                onSuccess: () => {
                    showSuccessToast("Credit withdrawn successfully");
                    handleClose();
                },
                onError: (err) => showErrorToast(err, "Failed to withdraw credit"),
            },
        );
    };

    const handleWithdrawAll = () => {
        setValue("amount", creditBalance);
    };

    return (
        <FormDialog
            open={isOpen}
            onClose={handleClose}
            title="Withdraw / Refund Credit"
            primaryButtonText={
                withdrawMutation.isPending ? "Processing..." : "Withdraw Credit"
            }
            secondaryButtonText="Cancel"
            onSubmit={handleSubmit(onSubmit)}
            isSubmitting={withdrawMutation.isPending || isSubmitting}
            maxWidth="max-w-md"
        >
            <div className="space-y-4">
                {/* Available Balance Banner */}
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Available Balance</p>
                        <p className="text-lg font-bold text-[var(--color-primary)]">
                            {formatCurrency(creditBalance)}
                        </p>
                    </div>
                    {creditBalance > 0 && (
                        <button
                            type="button"
                            onClick={handleWithdrawAll}
                            className="text-xs font-semibold text-[var(--color-primary)] bg-white border border-[var(--color-primary)] px-3 py-1.5 rounded-lg hover:bg-[var(--color-primary)] hover:text-white transition-all"
                        >
                            Withdraw All
                        </button>
                    )}
                </div>

                <InputField
                    label="Amount"
                    name="amount"
                    type="number"
                    step="any"
                    register={register}
                    error={errors.amount?.message}
                    validation={{
                        required: "Amount is required",
                        min: { value: 0.01, message: "Amount must be positive" },
                        validate: (value) =>
                            parseFloat(value) <= creditBalance ||
                            `Amount cannot exceed available balance (${formatCurrency(creditBalance)})`,
                    }}
                    placeholder="Enter refund amount"
                />

                {/* Settlement summary */}
                {(Number(watchedAmount) || 0) > 0 && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm space-y-1">
                        <div className="flex justify-between text-gray-600">
                            <span>Current Balance</span>
                            <span className="font-medium">{formatCurrency(creditBalance)}</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                            <span>Withdrawing</span>
                            <span className="font-medium">-{formatCurrency(Number(watchedAmount) || 0)}</span>
                        </div>
                        <div className="flex justify-between text-gray-900 font-bold border-t border-gray-200 pt-1">
                            <span>Remaining</span>
                            <span>{formatCurrency(Math.max(0, creditBalance - (Number(watchedAmount) || 0)))}</span>
                        </div>
                    </div>
                )}

                <SelectField
                    name="paymentMethod"
                    control={control}
                    validation={{ required: "Payment method is required" }}
                    label="Refund Via"
                    error={errors.paymentMethod?.message}
                    options={[
                        { value: "Cash", label: "Cash" },
                        { value: "Bank", label: "Bank Transfer" },
                        { value: "Mobile Banking", label: "Mobile Banking" },
                    ]}
                />

                <SelectField
                    name="accountId"
                    control={control}
                    validation={{ required: "Account is required" }}
                    label="Deduct From Account"
                    error={errors.accountId?.message}
                    options={accounts
                        .filter((acc) => acc.accountType === watchedPaymentMethod)
                        .map((acc) => ({
                            value: acc._id,
                            label: formatAccountLabel(acc),
                        }))}
                    disabled={!watchedPaymentMethod}
                />

                <InputField
                    label="Date"
                    name="date"
                    type="datetime-local"
                    register={register}
                    error={errors.date?.message}
                    validation={{ required: "Date is required" }}
                />

                <TextAreaField
                    label="Reason (Optional)"
                    name="reason"
                    register={register}
                    placeholder="e.g. Customer requested refund of remaining balance"
                    rows={2}
                    autoResize
                />
            </div>
        </FormDialog>
    );
};

export default WithdrawCreditModal;
