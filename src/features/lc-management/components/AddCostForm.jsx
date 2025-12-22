import React, { useState, useEffect, useCallback, memo } from "react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";
import api from "@/services/apiService";
import FormDialog from "@/components/ui/FormDialog";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import { DollarSign, Calendar } from "lucide-react";

// Custom hook for account fetching
const useAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/account/get-all-accounts");
      if (response.data.success) {
        setAccounts(response.data.data || []);
      } else {
        throw new Error("Failed to fetch accounts");
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      toast.error("Failed to load accounts. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { accounts, loading, fetchAccounts };
};

const INITIAL_EXPENSE_STATE = {
  name: "",
  amount: "",
  date: new Date().toISOString().split("T")[0],
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const { accounts, loading: accountsLoading, fetchAccounts } = useAccounts();

  // Initialize form
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
      fetchAccounts();
    }
  }, [open, initialData, fetchAccounts]);

  // Validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!expense.name.trim()) {
      newErrors.name = "Expense name is required";
    }

    if (!expense.amount) {
      newErrors.amount = "Amount is required";
    } else if (parseFloat(expense.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!expense.date) {
      newErrors.date = "Date is required";
    }

    if (expense.paymentMethod !== "Cash" && !expense.accountId) {
      newErrors.accountId = "Please select an account for this payment method";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [expense]);

  // Handlers
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setExpense((prev) => ({
        ...prev,
        [name]: value,
        ...(name === "paymentMethod" && value === "Cash" && { accountId: "" }),
      }));

      // Clear error for this field
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [errors]
  );

  const getFilteredAccounts = useCallback(() => {
    if (expense.paymentMethod === "Bank") {
      return accounts.filter((acc) => acc.accountType === "Bank");
    }
    if (expense.paymentMethod === "Mobile Banking") {
      return accounts.filter((acc) => acc.accountType === "Mobile Banking");
    }
    return [];
  }, [accounts, expense.paymentMethod]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Adding cost...");

    try {
      const payload = {
        lcId,
        category,
        expense: {
          ...expense,
          amount: parseFloat(expense.amount),
          date: new Date(expense.date).toISOString(),
        },
      };

      await api.post("/lc/add-expense", payload);
      toast.success("Cost added successfully!", { id: toastId });

      if (onSuccess) {
        onSuccess();
      }

      handleClose();
    } catch (error) {
      console.error("Failed to add cost:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to add cost. Please try again.";
      toast.error(errorMessage, { id: toastId, duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  }, [expense, lcId, category, validateForm, onSuccess]);

  const handleClose = useCallback(() => {
    setExpense(INITIAL_EXPENSE_STATE);
    setErrors({});
    onClose();
  }, [onClose]);

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
      isPrimaryButtonDisabled={isSubmitting || accountsLoading}
      primaryButtonText={isSubmitting ? "Adding..." : "Add Cost"}
      secondaryButtonText="Cancel"
      isLoading={accountsLoading}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Amount (BDT)"
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

          <InputField
            label="Date"
            name="date"
            type="date"
            value={expense.date}
            onChange={handleInputChange}
            required
            icon={Calendar}
            error={errors.date}
            max={new Date().toISOString().split("T")[0]}
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
          error={errors.paymentMethod}
        />

        {(expense.paymentMethod === "Bank" ||
          expense.paymentMethod === "Mobile Banking") && (
          <SelectField
            label="Select Account"
            name="accountId"
            value={expense.accountId}
            onChange={handleInputChange}
            options={getFilteredAccounts().map((acc) => ({
              value: acc._id,
              label: `${acc.accountHolderName} - ${
                acc.accountNumber || acc.mobileNumber || ""
              }`.trim(),
            }))}
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
    date: PropTypes.string,
    paymentMethod: PropTypes.string,
    accountId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }),
};

export default memo(AddCostForm);
