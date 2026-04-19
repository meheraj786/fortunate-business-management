import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import FormDialog from "@/components/ui/FormDialog";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import ComboboxField from "@/components/ui/ComboboxField";
import { useAddStoreCredit } from "@/api/hooks/customer";
import { useAccounts } from "@/api/hooks/account";
import { formatAccountLabel } from "@/utils/format";
import { showSuccessToast, showErrorToast } from "@/utils/notifications";
import { getBusinessDateTimeISO } from "@/utils/date.util";
import { useSettings } from "@/context/SettingsContext";

const AddCreditModal = ({ isOpen, onClose, customerId }) => {
    const { settings } = useSettings();
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
        },
    });

    const { data: accountsData } = useAccounts();
    const accounts = React.useMemo(() => accountsData?.data || [], [accountsData]);
    const addCreditMutation = useAddStoreCredit();

    const watchedPaymentMethod = watch("paymentMethod");

    useEffect(() => {
        if (isOpen) {
            reset({
                amount: "",
                paymentMethod: "Cash",
                accountId: "",
                date: getBusinessDateTimeISO(settings?.timezone),
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
        addCreditMutation.mutate(
            {
                id: customerId,
                data: { ...data, amount: parseFloat(data.amount) },
            },
            {
                onSuccess: () => {
                    showSuccessToast("Credit added successfully");
                    handleClose();
                },
                onError: (err) => showErrorToast(err, "Failed to add credit"),
            },
        );
    };

    return (
        <FormDialog
            open={isOpen}
            onClose={handleClose}
            title="Add Store Credit"
            primaryButtonText={
                addCreditMutation.isPending ? "Adding..." : "Add Credit"
            }
            secondaryButtonText="Cancel"
            onSubmit={handleSubmit(onSubmit)}
            isSubmitting={addCreditMutation.isPending || isSubmitting}
            maxWidth="max-w-md"
        >
            <div className="space-y-4">
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
                        valueAsNumber: true,
                    }}
                    placeholder="Enter amount"
                />

                <SelectField
                    name="paymentMethod"
                    control={control}
                    validation={{ required: "Payment method is required" }}
                    label="Payment Method"
                    error={errors.paymentMethod?.message}
                    options={[
                        { value: "Cash", label: "Cash" },
                        { value: "Bank", label: "Bank Transfer" },
                        { value: "Mobile Banking", label: "Mobile Banking" },
                    ]}
                />

                <ComboboxField
                    name="accountId"
                    control={control}
                    validation={{ required: "Account is required" }}
                    label="Deposit To Account"
                    error={errors.accountId?.message}
                    placeholder={watchedPaymentMethod ? "Search account..." : "Select payment method first"}
                    options={accounts
                        .filter((acc) => acc.accountType === watchedPaymentMethod)
                        .map((acc) => ({
                            value: acc._id,
                            label: formatAccountLabel(acc),
                        }))
                        .sort((a, b) => a.label.localeCompare(b.label))}
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
            </div>
        </FormDialog>
    );
};

export default AddCreditModal;
