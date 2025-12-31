import React, { useState, useMemo, useCallback } from "react";
import FormDialog from "@/components/ui/FormDialog";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import TextAreaField from "@/components/ui/TextAreaField";
import { handleError } from "@/utils/handle-error";
import api from "@/services/apiService";
import toast from "react-hot-toast";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, INITIAL_TRANSACTION_STATE } from "../constants";

const AddTransactionDialog = ({ open, onClose, onSuccess, transactionType, accounts, accountsLoading, activeLc, activeSales, selectedDate }) => {
  const [newTransaction, setNewTransaction] = useState(INITIAL_TRANSACTION_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewTransactionChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewTransaction((prev) => {
      let newState = { ...prev, [name]: value };

      if (name === "paymentMethod") {
        newState.accountId = "";
      }
      if (name === "category") {
        newState.lcId = "";
        newState.salesId = "";
        if (transactionType === 'expense') {
          newState.name = "";
        }
        if ((value === "LC" || value === "Sales") && !prev.description) {
          newState.description = `Auto-generated description for ${value}`;
        } else if ((prev.category === "LC" || prev.category === "Sales") && prev.description.startsWith("Auto-generated")) {
          newState.description = "";
        }
      }
      return newState;
    });
  }, [transactionType]);

  const handleAddTransactionSubmit = async () => {
    // Validation and submission logic here
    // This logic is copied and adapted from DailyCashFlowPage.jsx
    if (!newTransaction.amount || parseFloat(newTransaction.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!newTransaction.category) {
      toast.error("Please select a category");
      return;
    }
    if (!newTransaction.name && (newTransaction.category === 'LC' || newTransaction.category === 'Sales')) {
        toast.error(`A name is required for ${newTransaction.category} ${transactionType}`);
        return;
    }
    if (!newTransaction.accountId) {
      toast.error("Please select an account");
      return;
    }
    if (newTransaction.category === "LC" && !newTransaction.lcId) {
      toast.error("Please select an LC for this transaction");
      return;
    }
    if (newTransaction.category === "Sales" && !newTransaction.salesId) {
      toast.error("Please select a Sale for this transaction");
      return;
    }
    if (transactionType === 'expense' && !(newTransaction.category === "LC" || newTransaction.category === "Sales") && !newTransaction.description) {
      toast.error("Please enter a description");
      return;
    }

    const endpoint = transactionType === "income" ? "income" : "expense";
    const toastId = toast.loading(`Adding ${transactionType}...`);
    setIsSubmitting(true);

    const payload = {
      date: selectedDate,
      amount: parseFloat(newTransaction.amount),
      category: newTransaction.category,
      name: newTransaction.name,
      paymentMethod: newTransaction.paymentMethod,
      accountId: newTransaction.accountId,
      description: newTransaction.description || undefined,
    };

    if (newTransaction.category === "LC") {
      payload.lcId = newTransaction.lcId;
      if (transactionType === 'expense') {
        payload.lcCostCategory = newTransaction.lcCostCategory;
      }
    }
    if (newTransaction.category === "Sales") {
      payload.salesId = newTransaction.salesId;
    }

    try {
      await api.post(`/cash/${endpoint}`, payload);
      toast.success(
        `${
          transactionType.charAt(0).toUpperCase() + transactionType.slice(1)
        } added successfully!`,
        { id: toastId, duration: 3000 }
      );
      setNewTransaction(INITIAL_TRANSACTION_STATE);
      onSuccess();
      onClose();
    } catch (err) {
      handleError(err, `Failed to add ${transactionType}.`);
      toast.dismiss(toastId);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getFilteredAccounts = useCallback(() => {
    return accounts.filter((acc) => acc.accountType === newTransaction.paymentMethod);
  }, [accounts, newTransaction.paymentMethod]);

  const nameLabel = useMemo(() => {
    if (transactionType === 'income') {
      return 'Income Name';
    }
    if (newTransaction.category === 'LC' || newTransaction.category === 'Sales') {
      return 'Cost Name';
    }
    return 'Expense Name';
  }, [transactionType, newTransaction.category]);

  const namePlaceholder = useMemo(() => {
    if (transactionType === 'income') {
      switch (newTransaction.category) {
        case 'LC': return "e.g., LC final settlement";
        case 'Sales': return "e.g., Payment from customer";
        case 'Donation': return "e.g., From Acme Corp";
        case 'Commission': return "e.g., Sales commission for Q3";
        case 'Interest': return "e.g., Bank interest";
        case 'Service Charge': return "e.g., Consultation fee";
        default: return "e.g., Miscellaneous income";
      }
    } else { // expense
      switch (newTransaction.category) {
        case 'LC': return "e.g., Port handling fee";
        case 'Sales': return "e.g., Return processing fee";
        case 'Rent': return "e.g., Office rent for May";
        case 'Salary': return "e.g., Monthly salary for John Doe";
        case 'Office Expense': return "e.g., Stationery purchase";
        case 'Transport': return "e.g., Delivery truck fuel";
        case 'Utility': return "e.g., Electricity bill";
        default: return "e.g., Miscellaneous expense";
      }
    }
  }, [transactionType, newTransaction.category]);
  
  const descriptionPlaceholder = useMemo(() => {
    if (transactionType === 'income') {
        switch (newTransaction.category) {
            case 'Donation': return "e.g., Donation for office party";
            case 'Commission': return "e.g., Commission from sales of product X";
            case 'Interest': return "e.g., Monthly interest from savings account";
            case 'Service Charge': return "e.g., Service charge for project Y";
            default: return "Enter description";
        }
    } else { // expense
        switch (newTransaction.category) {
            case 'Rent': return "e.g., Office rent for the month of May";
            case 'Salary': return "e.g., Salary for John Doe";
            case 'Office Expense': return "e.g., Purchase of office supplies";
            case 'Transport': return "e.g., Fuel for delivery vehicle";
            case 'Utility': return "e.g., Electricity bill for May";
            default: return "Enter description";
        }
    }
  }, [transactionType, newTransaction.category]);

  const transactionCategories = transactionType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={`Add ${transactionType === "income" ? "Income" : "Expense"}`}
      primaryButtonText={isSubmitting ? "Adding..." : "Add Transaction"}
      secondaryButtonText="Cancel"
      onSubmit={handleAddTransactionSubmit}
      isPrimaryButtonDisabled={isSubmitting || accountsLoading}
      size="md"
    >
      <div className="space-y-4">
        <InputField
          label="Amount"
          name="amount"
          type="number"
          value={newTransaction.amount}
          onChange={handleNewTransactionChange}
          placeholder="e.g., 5000"
          required
          min="0"
          step="0.01"
        />

        <SelectField
          label="Category"
          name="category"
          value={newTransaction.category}
          onChange={handleNewTransactionChange}
          options={transactionCategories.map((item) => ({
              value: item,
              label: item.charAt(0).toUpperCase() + item.slice(1),
          }))}
          required
          placeholder="Select category"
        />

        <InputField
          label={nameLabel}
          name="name"
          value={newTransaction.name}
          onChange={handleNewTransactionChange}
          placeholder={namePlaceholder}
          required
        />

        {newTransaction.category === "LC" && (
          <SelectField
            label="Select LC"
            name="lcId"
            value={newTransaction.lcId}
            onChange={handleNewTransactionChange}
            options={activeLc.map((lc) => ({
              value: lc._id,
              label: lc.basicInfo?.lcNumber || `LC ${lc._id?.slice(-6)}`,
            }))}
            required
            placeholder="Select an LC"
          />
        )}

        {transactionType === 'expense' && newTransaction.category === "LC" && (
          <SelectField
            label="LC Cost Category"
            name="lcCostCategory"
            value={newTransaction.lcCostCategory}
            onChange={handleNewTransactionChange}
            options={[
              { value: "financialInfo", label: "Financial" },
              { value: "shippingCustomsInfo", label: "Shipping & Customs" },
              { value: "agentTransportInfo", label: "Agent & Transport" },
              { value: "otherExpenses", label: "Other Expenses" },
            ]}
            required
          />
        )}

        {newTransaction.category === "Sales" && (
          <SelectField
            label="Select Sale"
            name="salesId"
            value={newTransaction.salesId}
            onChange={handleNewTransactionChange}
            options={activeSales.map((sale) => ({
              value: sale._id,
              label: sale.saleId || `Sale ${sale._id?.slice(-6)}`,
            }))}
            required
            placeholder="Select a Sale"
          />
        )}

        {!(newTransaction.category === "LC" || newTransaction.category === "Sales") && (
          <TextAreaField
            label="Description"
            name="description"
            value={newTransaction.description}
            onChange={handleNewTransactionChange}
            placeholder={descriptionPlaceholder}
            rows="3"
            required
          />
        )}

        <SelectField
          label="Payment Method"
          name="paymentMethod"
          value={newTransaction.paymentMethod}
          onChange={handleNewTransactionChange}
          options={[
            { value: "Cash", label: "💵 Cash" },
            { value: "Bank", label: "🏦 Bank Transfer" },
            { value: "Mobile Banking", label: "📱 Mobile Banking" },
          ]}
          required
        />
        {(newTransaction.paymentMethod === "Bank" ||
          newTransaction.paymentMethod === "Mobile Banking" ||
          newTransaction.paymentMethod === "Cash") && (
          <SelectField
            label="Select Account"
            name="accountId"
            value={newTransaction.accountId}
            onChange={handleNewTransactionChange}
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
          />
        )}
      </div>
    </FormDialog>
  );
};

export default AddTransactionDialog;
