import React, { useState, useEffect, memo } from "react";
import PropTypes from "prop-types";
import { showErrorToast } from "@/utils/notifications";
import FormDialog from "@/components/ui/FormDialog";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import { DollarSign, Calendar } from "lucide-react";
import { useAccounts } from "@/api/hooks/account";
import { useAddExpenseToLC } from "@/api/hooks/lc";
import { useUrl } from "@/hooks/useUrl";

const INITIAL_EXPENSE_STATE = {
  name: "",
  amount: "",
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

  useEffect(() => {
    if (open) {
      if (initialData) {
        setExpense({
          name: initialData.name || "",
          amount: initialData.amount || "",
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

  const validateForm = () => {
    const newErrors = {};
    if (!expense.name.trim()) newErrors.name = "Expense name is required";
    if (!expense.amount) newErrors.amount = "Amount is required";
    else if (parseFloat(expense.amount) <= 0)
      newErrors.amount = "Amount must be greater than 0";
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
    return accounts.data.filter((acc) => acc.accountType === expense.paymentMethod);
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

    const payload = {
      lcId,
      category,
      expense: {
        ...expense,
        amount: parseFloat(expense.amount),
        date: new Date().toISOString(),
      },
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

  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      title={`Add Cost to ${categoryTitle}`}
      onSubmit={handleSubmit}
      isSubmitting={addExpenseMutation.isLoading || accountsLoading}
      primaryButtonText={addExpenseMutation.isLoading ? "Adding..." : "Add Cost"}
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
          error={errors.name?.message}
          autoFocus
        />

        <div className="space-y-4">
          <InputField
            label="Amount (BDT)"
            name="amount"
            type="number"
            value={expense.amount}
            onChange={handleInputChange}
            placeholder="Enter amount"
            required
            icon={DollarSign}
            error={errors.amount?.message}
            min="0.01"
            step="0.01"
          />
        </div>
        <SelectField
          label="Payment Method"
          name="paymentMethod"
          value={expense.paymentMethod}
          onChange={handleInputChange}
          options={[
            { value: "Cash", label: "Cash" },
            { value: "Bank", label: "Bank" },
            { value: "Mobile Banking", label: "Mobile Banking" },
          ]}
          required
          error={errors.paymentMethod?.message}
        />

        {(expense.paymentMethod === "Bank" ||
          expense.paymentMethod === "Mobile Banking" ||
          expense.paymentMethod === "Cash") && (
          <SelectField
            label="Select Account"
            name="accountId"
            value={expense.accountId}
            onChange={handleInputChange}
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
            error={errors.accountId?.message}
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
    paymentMethod: PropTypes.string,
    accountId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }),
};

export default memo(AddCostForm);
