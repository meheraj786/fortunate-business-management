import React, { useState, useEffect, memo } from "react";
import PropTypes from "prop-types";
import { showErrorToast } from "@/utils/notifications";
import FormDialog from "@/components/ui/FormDialog";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import { DollarSign, Calendar } from "lucide-react";
import { useAccounts } from "@/api/hooks/account";
import { useAddExpenseToLC } from "@/api/hooks/lc";
import { useSettings } from "@/context/SettingsContext";

const INITIAL_EXPENSE_STATE = {
  name: "",
  amount: "",
  amountUsd: "",
  costExchangeRate: "",
  paymentMethod: "Cash",
  accountId: "",
};

const AddCostForm = ({
  open,
  onClose,
  lcId,
  category,
  onSuccess,
  initialData = null,
}) => {
  const [expense, setExpense] = useState(INITIAL_EXPENSE_STATE);
  const [errors, setErrors] = useState({});
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const addExpenseMutation = useAddExpenseToLC();
  const { settings } = useSettings();

  const isDocumentSection = category === "documentProductInfo";

  useEffect(() => {
    if (open) {
      if (initialData) {
        setExpense({
          name: initialData.name || "",
          amount: initialData.amount || "",
          amountUsd: initialData.amountUsd || "",
          costExchangeRate: initialData.costExchangeRate || "",
          date: initialData.date
            ? new Date(initialData.date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          paymentMethod: initialData.paymentMethod || "Cash",
          accountId: initialData.accountId?._id || initialData.accountId || "",
        });
      } else {
        setExpense(INITIAL_EXPENSE_STATE);
      }
      setErrors({});
    }
  }, [open, initialData]);

  // Auto-calculate BDT amount from USD × Exchange Rate for document section
  useEffect(() => {
    if (isDocumentSection && expense.amountUsd && expense.costExchangeRate) {
      const usd = parseFloat(expense.amountUsd) || 0;
      const rate = parseFloat(expense.costExchangeRate) || 0;
      const bdt = (usd * rate).toFixed(2);
      setExpense((prev) => ({ ...prev, amount: bdt }));
    }
  }, [expense.amountUsd, expense.costExchangeRate, isDocumentSection]);

  const validateForm = () => {
    const newErrors = {};
    if (!expense.name.trim()) newErrors.name = "Expense name is required";

    if (isDocumentSection) {
      if (!expense.amountUsd) newErrors.amountUsd = "USD amount is required";
      else if (parseFloat(expense.amountUsd) <= 0)
        newErrors.amountUsd = "USD amount must be greater than 0";
      if (!expense.costExchangeRate) newErrors.costExchangeRate = "Exchange rate is required";
      else if (parseFloat(expense.costExchangeRate) <= 0)
        newErrors.costExchangeRate = "Exchange rate must be greater than 0";
    } else {
      if (!expense.amount) newErrors.amount = "Amount is required";
      else if (parseFloat(expense.amount) <= 0)
        newErrors.amount = "Amount must be greater than 0";
    }

    if (
      (expense.paymentMethod === "Bank" ||
        expense.paymentMethod === "Mobile Banking" ||
        expense.paymentMethod === "Cash") &&
      !expense.accountId
    ) {
      newErrors.accountId = "Please select an account for this payment method";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExpense((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const getFilteredAccounts = () => {
    if (!accounts?.data) return [];
    return accounts.data.filter(
      (acc) => acc.accountType === expense.paymentMethod,
    );
  };

  const handleClose = () => {
    setExpense(INITIAL_EXPENSE_STATE);
    setErrors({});
    onClose();
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showErrorToast("Please fix the errors in the form");
      return;
    }

    const expensePayload = {
      ...expense,
      amount: parseFloat(expense.amount),
      date: new Date().toISOString(),
    };

    // Include USD fields only for document section
    if (isDocumentSection) {
      expensePayload.amountUsd = parseFloat(expense.amountUsd);
      expensePayload.costExchangeRate = parseFloat(expense.costExchangeRate);
    } else {
      delete expensePayload.amountUsd;
      delete expensePayload.costExchangeRate;
    }

    const payload = {
      lcId,
      category,
      expense: expensePayload,
    };

    addExpenseMutation.mutate(payload, {
      onSuccess: () => {
        if (onSuccess) onSuccess();
        handleClose();
      },
    });
  };

  const categoryTitle = category
    ? category
      .replace(/([A-Z])/g, " $1")
      .replace(/Info/gi, "")
      .trim()
    : "Cost";

  // Calculate auto BDT for display
  const autoBdtAmount = isDocumentSection && expense.amountUsd && expense.costExchangeRate
    ? (parseFloat(expense.amountUsd || 0) * parseFloat(expense.costExchangeRate || 0)).toFixed(2)
    : "";

  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      title={`Add Cost to ${categoryTitle}`}
      onSubmit={handleSubmit}
      isSubmitting={addExpenseMutation.isLoading || accountsLoading}
      primaryButtonText={
        addExpenseMutation.isLoading ? "Adding..." : "Add Cost"
      }
      secondaryButtonText="Cancel"
      size="md"
    >
      <div className="space-y-4">
        <InputField
          label="Expense Name"
          name="name"
          value={expense.name}
          onChange={handleInputChange}
          placeholder="e.g., Bank Fees"
          required
          error={errors.name}
          autoFocus
        />

        {isDocumentSection ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Amount (USD)"
                name="amountUsd"
                type="number"
                value={expense.amountUsd}
                onChange={handleInputChange}
                placeholder="e.g., 25000"
                required
                icon={DollarSign}
                error={errors.amountUsd}
                min="0.01"
                step="0.01"
              />
              <InputField
                label="Exchange Rate"
                name="costExchangeRate"
                type="number"
                value={expense.costExchangeRate}
                onChange={handleInputChange}
                placeholder="e.g., 115.50"
                required
                error={errors.costExchangeRate}
                min="0.01"
                step="0.01"
              />
            </div>
            <InputField
              label={`Amount (${settings?.currency || "BDT"}) — Auto-calculated`}
              name="amount"
              type="number"
              value={autoBdtAmount}
              disabled
              icon={DollarSign}
              placeholder="Calculated from USD × Rate"
            />
          </>
        ) : (
          <InputField
            label={`Amount (${settings?.currency || "BDT"})`}
            name="amount"
            type="number"
            value={expense.amount}
            onChange={handleInputChange}
            placeholder="Enter amount"
            required
            icon={DollarSign}
            error={errors.amount}
            min="0.01"
            step="0.01"
          />
        )}

        <SelectField
          label="Payment Method"
          name="paymentMethod"
          value={expense.paymentMethod}
          onChange={(val) => handleInputChange({ target: { name: "paymentMethod", value: val } })}
          options={[
            { value: "Cash", label: "Cash" },
            { value: "Bank", label: "Bank" },
            { value: "Mobile Banking", label: "Mobile Banking" },
          ]}
          required
          error={errors.paymentMethod}
        />

        {(expense.paymentMethod === "Bank" ||
          expense.paymentMethod === "Mobile Banking" ||
          expense.paymentMethod === "Cash") && (
            <SelectField
              label="Select Account"
              name="accountId"
              value={expense.accountId}
              onChange={(val) => handleInputChange({ target: { name: "accountId", value: val } })}
              options={getFilteredAccounts().map((acc) => {
                let label = "";
                if (acc.accountType === "Bank") {
                  label = `${acc.bankName} (${acc.accountHolderName}) - ${acc.accountNumber}`;
                } else if (acc.accountType === "Mobile Banking") {
                  label = `${acc.serviceName} (${acc.accountHolderName}) - ${acc.mobileNumber}`;
                } else if (acc.accountType === "Cash") {
                  label = `${acc.accountName} (${acc.accountHolderName})`;
                }
                return { value: acc._id, label: label };
              })}
              placeholder="Select an account"
              required
              loading={accountsLoading}
              error={errors.accountId}
            />
          )}
      </div>
    </FormDialog>
  );
};

AddCostForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  lcId: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  onSuccess: PropTypes.func,
  initialData: PropTypes.shape({
    name: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    amountUsd: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    costExchangeRate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    paymentMethod: PropTypes.string,
    accountId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }),
};

export default memo(AddCostForm);
