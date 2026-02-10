import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import FormDialog from "@/components/ui/FormDialog";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import { useAddStoreCredit } from "@/api/hooks/customer";
import { useAccounts } from "@/api/hooks/account";
import { formatAccountLabel } from "@/utils/format";
import { showSuccessToast, showErrorToast } from "@/utils/notifications";

const AddCreditModal = ({ isOpen, onClose, customerId }) => {
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
            date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
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
                date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
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

                <Controller
                    name="paymentMethod"
                    control={control}
                    rules={{ required: "Payment method is required" }}
                    render={({ field }) => (
                        <SelectField
                            {...field}
                            label="Payment Method"
                            error={errors.paymentMethod?.message}
                            options={[
                                { value: "Cash", label: "Cash" },
                                { value: "Bank", label: "Bank Transfer" },
                                { value: "Mobile Banking", label: "Mobile Banking" },
                            ]}
                        />
                    )}
                />

                <Controller
                    name="accountId"
                    control={control}
                    rules={{ required: "Account is required" }}
                    render={({ field }) => (
                        <SelectField
                            {...field}
                            label="Deposit To Account"
                            error={errors.accountId?.message}
                            options={accounts
                                .filter((acc) => acc.accountType === watchedPaymentMethod)
                                .map((acc) => ({
                                    value: acc._id,
                                    label: formatAccountLabel(acc),
                                }))}
                            disabled={!watchedPaymentMethod}
                        />
                    )}
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
