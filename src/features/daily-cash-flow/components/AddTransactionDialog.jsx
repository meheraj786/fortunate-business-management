import React, { useState, useMemo, useCallback, useEffect } from "react";
import FormDialog from "@/components/ui/FormDialog";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import ComboboxField from "@/components/ui/ComboboxField";

import TextAreaField from "@/components/ui/TextAreaField";
import {
  showErrorToast,
  showSuccessToast,
  showLoadingToast,
  dismissToast,
} from "@/utils/notifications";
import api from "@/services/apiService";
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  INITIAL_TRANSACTION_STATE,
} from "../constants";
import { useForm } from "react-hook-form";
import { formatAccountLabel } from "@/utils/format";

const AddTransactionDialog = ({
  open,
  onClose,
  onSuccess,
  transactionType,
  accounts,
  accountsLoading,
  activeLc,
  activeSales,
  selectedDate,
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: INITIAL_TRANSACTION_STATE,
  });

  const [isSubmittingMutation, setIsSubmittingMutation] = useState(false); // Renamed to avoid clash with r-h-f isSubmitting

  const watchedCategory = watch("category");
  const watchedPaymentMethod = watch("paymentMethod");

  useEffect(() => {
    if (open) {
      reset(INITIAL_TRANSACTION_STATE);
      // Pre-select category if only one available
      if (transactionType === "income" && INCOME_CATEGORIES.length === 1) {
        setValue("category", INCOME_CATEGORIES[0]);
      } else if (
        transactionType === "expense" &&
        EXPENSE_CATEGORIES.length === 1
      ) {
        setValue("category", EXPENSE_CATEGORIES[0]);
      }
      // Pre-select account if only one available for default method
      const defaultAccounts = accounts.filter(
        (acc) => acc.accountType === "Cash",
      );
      if (defaultAccounts.length === 1) {
        setValue("accountId", defaultAccounts[0]._id);
      }
    }
  }, [open, reset, accounts, setValue, transactionType]);

  useEffect(() => {
    // Auto-select account when payment method changes if only one option
    const filteredAccounts = accounts.filter(
      (acc) => acc.accountType === watchedPaymentMethod,
    );
    if (filteredAccounts.length === 1) {
      setValue("accountId", filteredAccounts[0]._id);
    } else {
      setValue("accountId", ""); // Clear if multiple or none
    }
  }, [watchedPaymentMethod, accounts, setValue]);

  const onSubmit = async (data) => {
    setIsSubmittingMutation(true);

    const endpoint = transactionType === "income" ? "income" : "expense";
    const toastId = showLoadingToast(`Adding ${transactionType}...`);

    const payload = {
      date: selectedDate,
      amount: parseFloat(data.amount),
      category: data.category,
      name: data.name,
      paymentMethod: data.paymentMethod,
      accountId: data.accountId,
      description: data.description || undefined,
    };

    if (data.category === "LC") {
      payload.lcId = data.lcId;
      if (transactionType === "expense") {
        payload.lcCostCategory = data.lcCostCategory;
      }
    }
    if (data.category === "Sales") {
      payload.salesId = data.salesId;
    }

    try {
      await api.post(`/cash/${endpoint}`, payload);
      showSuccessToast(
        `${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)
        } added successfully!`,
        { id: toastId, duration: 3000 },
      );
      onSuccess();
      onClose();
    } catch (err) {
      showErrorToast(err, `Failed to add ${transactionType}.`, { id: toastId });
    } finally {
      dismissToast(toastId);
      setIsSubmittingMutation(false);
    }
  };

  const getFilteredAccounts = useCallback(() => {
    return accounts.filter((acc) => acc.accountType === watchedPaymentMethod);
  }, [accounts, watchedPaymentMethod]);

  const nameLabel = useMemo(() => {
    if (transactionType === "income") {
      return "Income Name";
    }
    if (watchedCategory === "LC" || watchedCategory === "Sales") {
      return "Cost Name";
    }
    return "Expense Name";
  }, [transactionType, watchedCategory]);

  const namePlaceholder = useMemo(() => {
    if (transactionType === "income") {
      switch (watchedCategory) {
        case "LC":
          return "e.g., LC final settlement";
        case "Sales":
          return "e.g., Payment from customer";
        case "Donation":
          return "e.g., From Acme Corp";
        case "Commission":
          return "e.g., Sales commission for Q3";
        case "Interest":
          return "e.g., Bank interest";
        case "Service Charge":
          return "e.g., Consultation fee";
        default:
          return "e.g., Miscellaneous income";
      }
    } else {
      // expense
      switch (watchedCategory) {
        case "LC":
          return "e.g., Port handling fee";
        case "Sales":
          return "e.g., Return processing fee";
        case "Rent":
          return "e.g., Office rent for May";
        case "Salary":
          return "e.g., Monthly salary for John Doe";
        case "Office Expense":
          return "e.g., Stationery purchase";
        case "Transport":
          return "e.g., Delivery truck fuel";
        case "Utility":
          return "e.g., Electricity bill";
        case "Jakat":
          return "e.g., Annual Jakat Payment";
        case "Self":
          return "e.g., Personal Expense";
        default:
          return "e.g., Miscellaneous expense";
      }
    }
  }, [transactionType, watchedCategory]);

  const descriptionPlaceholder = useMemo(() => {
    if (transactionType === "income") {
      switch (watchedCategory) {
        case "Donation":
          return "e.g., Donation for office party";
        case "Commission":
          return "e.g., Commission from sales of product X";
        case "Interest":
          return "e.g., Monthly interest from savings account";
        case "Service Charge":
          return "e.g., Service charge for project Y";
        default:
          return "Enter description";
      }
    } else {
      // expense
      switch (watchedCategory) {
        case "Rent":
          return "e.g., Office rent for the month of May";
        case "Salary":
          return "e.g., Salary for John Doe";
        case "Office Expense":
          return "e.g., Purchase of office supplies";
        case "Transport":
          return "e.g., Fuel for delivery vehicle";
        case "Utility":
          return "e.g., Electricity bill for May";
        case "Jakat":
          return "e.g., Payment for annual Jakat";
        case "Self":
          return "e.g., Money withdrawn for personal expenses";
        default:
          return "Enter description";
      }
    }
  }, [transactionType, watchedCategory]);

  const transactionCategories =
    transactionType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={`Add ${transactionType === "income" ? "Income" : "Expense"}`}
      primaryButtonText={isSubmittingMutation ? "Adding..." : "Add Transaction"}
      secondaryButtonText="Cancel"
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmittingMutation || accountsLoading}
      size="md"
    >
      <div className="space-y-4">
        <InputField
          label="Amount"
          name="amount"
          type="number"
          register={register}
          error={errors.amount?.message}
          placeholder="e.g., 5000"
          validation={{
            required: "Amount is required",
            min: { value: 0.01, message: "Amount must be greater than 0" },
            valueAsNumber: true,
          }}
        />

        <SelectField
          label="Category"
          name="category"
          control={control}
          error={errors.category?.message}
          options={transactionCategories.map((item) => ({
            value: item,
            label: item.charAt(0).toUpperCase() + item.slice(1),
          }))}
          validation={{ required: "Category is required" }}
          placeholder="Select category"
        />

        <InputField
          label={nameLabel}
          name="name"
          register={register}
          error={errors.name?.message}
          placeholder={namePlaceholder}
          validation={{
            required: "Name is required",
          }}
        />

        {watchedCategory === "LC" && (
          <SelectField
            label="Select LC"
            name="lcId"
            control={control}
            error={errors.lcId?.message}
            options={activeLc.map((lc) => ({
              value: lc._id,
              label: lc.basicInfo?.lcNumber || `LC ${lc._id?.slice(-6)}`,
            }))}
            validation={{
              required: "Please select an LC for this transaction",
            }}
            placeholder="Select LC..."
          />
        )}

        {transactionType === "expense" && watchedCategory === "LC" && (
          <SelectField
            label="LC Cost Category"
            name="lcCostCategory"
            control={control}
            error={errors.lcCostCategory?.message}
            options={[
              { value: "financialInfo", label: "Financial" },
              { value: "shippingCustomsInfo", label: "Shipping & Customs" },
              { value: "agentTransportInfo", label: "Agent & Transport" },
              { value: "otherExpenses", label: "Other Expenses" },
            ]}
            validation={{ required: "LC Cost Category is required" }}
          />
        )}

        {watchedCategory === "Sales" && (
          <SelectField
            label="Select Sale"
            name="salesId"
            control={control}
            error={errors.salesId?.message}
            options={activeSales.map((sale) => ({
              value: sale._id,
              label: sale.saleId || `Sale ${sale._id?.slice(-6)}`,
            }))}
            validation={{
              required: "Please select a Sale for this transaction",
            }}
            placeholder="Select sale..."
          />
        )}

        {!(watchedCategory === "LC" || watchedCategory === "Sales") && (
          <TextAreaField
            label="Description"
            name="description"
            register={register}
            error={errors.description?.message}
            placeholder={descriptionPlaceholder}
            rows="3"
            validation={{
              required: "Description is required",
            }}
            required={true}
          />
        )}

        <SelectField
          label="Payment Method"
          name="paymentMethod"
          control={control}
          error={errors.paymentMethod?.message}
          options={[
            { value: "Cash", label: "💵 Cash Only (Daily Cash)" },
          ]}
          validation={{ required: "Payment Method is required" }}
        />
        {(watchedPaymentMethod === "Cash") && (
            <ComboboxField
              label="Select Account"
              name="accountId"
              control={control}
              error={errors.accountId?.message}
              options={getFilteredAccounts()
                .map((acc) => ({
                  value: acc._id,
                  label: formatAccountLabel(acc),
                }))
                .sort((a, b) => a.label.localeCompare(b.label))}
              placeholder="Search account..."
              validation={{ required: "Account is required" }}
              loading={accountsLoading}
            />
          )}
      </div>
    </FormDialog>
  );
};

export default AddTransactionDialog;
