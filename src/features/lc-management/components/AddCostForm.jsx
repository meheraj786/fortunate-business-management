import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import api from "@/services/apiService";
import FormDialog from "@/components/ui/FormDialog";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import { DollarSign } from "lucide-react";

const INITIAL_EXPENSE_STATE = {
  name: "",
  amount: "",
  paymentMethod: "Cash",
  accountId: null,
};

const AddCostForm = ({ open, onClose, lcId, category, onSuccess }) => {
  const [expense, setExpense] = useState(INITIAL_EXPENSE_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    if (open) {
      const fetchAccounts = async () => {
        try {
          const response = await api.get(`/account/get-all-accounts`);
          if (response.data.success) {
            setAccounts(response.data.data);
          } else {
            toast.error("Failed to fetch accounts.");
          }
        } catch (error) {
          toast.error("An error occurred while fetching accounts.");
        }
      };
      fetchAccounts();
    }
  }, [open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExpense((prev) => ({
      ...prev,
      [name]: value,
      // Reset accountId if payment method is changed to Cash
      ...(name === "paymentMethod" && value === "Cash" && { accountId: null }),
    }));
  };

  const getFilteredAccounts = useCallback(() => {
    if (expense.paymentMethod === "Bank") {
      return accounts.filter((acc) => acc.accountType === "Bank");
    }
    if (expense.paymentMethod === "Mobile Banking") {
      return accounts.filter((acc) => acc.accountType === "Mobile Banking");
    }
    return [];
  }, [accounts, expense.paymentMethod]);

  const handleSubmit = async () => {
    if (!expense.name || !expense.amount) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (
      (expense.paymentMethod === "Bank" ||
        expense.paymentMethod === "Mobile Banking") &&
      !expense.accountId
    ) {
      toast.error("Please select an account for this payment method.");
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
          date: new Date(),
        },
      };

      await api.post(`/lc/add-expense`, payload);
      toast.success("Cost added successfully!", { id: toastId });
      onSuccess();
      handleClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add cost.",
        { id: toastId }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setExpense(INITIAL_EXPENSE_STATE);
    onClose();
  };

  const categoryTitle = category
    ? category
        .replace(/([A-Z])/g, " $1")
        .replace(/Info/gi, "")
        .trim()
    : "";

  return (
    <FormDialog
      open={open}
      onClose={handleClose}
      title={`Add Cost to ${categoryTitle}`}
      onSubmit={handleSubmit}
      isPrimaryButtonDisabled={isSubmitting}
      primaryButtonText={isSubmitting ? "Adding..." : "Add Cost"}
      secondaryButtonText="Cancel"
    >
      <div className="space-y-4">
        <InputField
          label="Expense Name"
          name="name"
          value={expense.name}
          onChange={handleInputChange}
          placeholder="e.g., Bank Fees"
          required
        />
        <InputField
          label="Amount"
          name="amount"
          type="number"
          value={expense.amount}
          onChange={handleInputChange}
          placeholder="Enter amount in BDT"
          required
          icon={DollarSign}
        />

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
        />
        {(expense.paymentMethod === "Bank" ||
          expense.paymentMethod === "Mobile Banking") && (
          <SelectField
            label="Select Account"
            name="accountId"
            value={expense.accountId || ""}
            onChange={handleInputChange}
            options={getFilteredAccounts().map((acc) => ({
              value: acc._id,
              label: `${acc.accountHolderName} (${
                acc.accountName || acc.serviceName
              }) - ${acc.accountNumber || acc.mobileNumber}`,
            }))}
            placeholder="Select an account"
            required
          />
        )}
      </div>
    </FormDialog>
  );
};

export default AddCostForm;
