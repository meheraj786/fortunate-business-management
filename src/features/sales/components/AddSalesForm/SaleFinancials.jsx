import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useFieldArray, Controller } from "react-hook-form";
import { PlusCircle, MinusCircle, FileText, CreditCard, Info } from "lucide-react";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import ComboboxField from "@/components/ui/ComboboxField";
import Button from "@/components/ui/Button";
import { useSettings } from "@/context/SettingsContext";
import { formatAccountLabel } from "@/utils/format";
import { getBusinessDateTimeISO } from "@/utils/date.util";

const SaleFinancials = ({
  register,
  control,
  errors,
  isSubmitting,
  setValue,
  watch,
  accounts,
  totalAmountToBePaid = 0,
  customerType,
  selectedCustomer,
}) => {
  const { formatCurrency, settings } = useSettings();
  const queryClient = useQueryClient();
  const {
    fields: chargesFields,
    append: appendCharge,
    remove: removeCharge,
  } = useFieldArray({
    control,
    name: "charges",
  });

  const {
    fields: costsFields,
    append: appendCost,
    remove: removeCost,
  } = useFieldArray({
    control,
    name: "costs",
  });

  const {
    fields: paymentsFields,
    append: appendPayment,
    remove: removePayment,
  } = useFieldArray({
    control,
    name: "payments",
  });

  const watchedInvoiceStatus = watch("invoiceStatus");
  const watchedPaymentStatus = watch("paymentStatus");

  const handleInvoiceStatusChange = (status) => {
    setValue("invoiceStatus", status);
    if (status === "Not-invoiced") {
      setValue("paymentStatus", "");
      setValue("payments", []);
    } else if (status === "Invoiced") {
      if (customerType === "manual") {
        setValue("paymentStatus", "Paid payment");
        const businessDateTime = getBusinessDateTimeISO(settings?.timezone);
        setValue("payments", [
          {
            amount: parseFloat(totalAmountToBePaid).toFixed(2),
            date: businessDateTime,
            method: "",
            accountId: "",
          },
        ]);
      } else {
        setValue("paymentStatus", "Due payment");
      }
    }
  };

  const handlePaymentStatusChange = (status) => {
    if (status === "Paid payment") {
      const businessDateTime = getBusinessDateTimeISO(settings?.timezone);
      setValue("payments", [
        {
          amount: parseFloat(totalAmountToBePaid).toFixed(2),
          date: businessDateTime,
          method: "",
          accountId: "",
        },
      ]);
    } else if (status === "Due payment") {
      setValue("payments", []);
    } else if (status === "Partial payment") {
      // Initialize with one empty row if there are no existing payments
      if (paymentsFields.length === 0) {
        const businessDateTime = getBusinessDateTimeISO(settings?.timezone);
        setValue("payments", [
          {
            amount: "",
            date: businessDateTime,
            method: "",
            accountId: "",
          },
        ]);
      }
    }
  };

  const getFilteredAccounts = (method) => {
    if (!accounts) return [];
    return accounts
      .filter((acc) => acc.accountType === method)
      .map((acc) => ({
        value: acc._id,
        label: formatAccountLabel(acc),
      }));
  };

  return (
    <div className="space-y-6 border-t border-gray-100 pt-4">
      {/* Additional Charges Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-lg font-medium text-gray-800">
            Additional Charges
          </label>
          <Button
            type="button"
            onClick={() => appendCharge({ name: "", amount: "" })}
            variant="subtle"
            className="!h-8 text-sm"
            disabled={isSubmitting}
          >
            <PlusCircle size={16} className="mr-2" />
            Add Charge
          </Button>
        </div>
        <AnimatePresence>
          {chargesFields.map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-3 items-end bg-gray-50 p-3 rounded-md"
            >
              <div className="sm:col-span-2">
              <InputField
                label="Charge Name"
                name={`charges.${index}.name`}
                register={register}
                error={errors.charges?.[index]?.name?.message}
                validation={{ required: "Charge name is required" }}
                disabled={isSubmitting}
              />
              </div>
              <div className="sm:col-span-2">
              <InputField
                label="Amount"
                name={`charges.${index}.amount`}
                type="number"
                step="any"
                register={register}
                error={errors.charges?.[index]?.amount?.message}
                validation={{
                  required: "Required",
                  valueAsNumber: true,
                  min: { value: 0, message: "Positive only" },
                }}
                disabled={isSubmitting}
              />
              </div>
              <Button
                type="button"
                onClick={() => removeCharge(index)}
                variant="subtle"
                className="!h-10 text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] w-full sm:w-auto"
                disabled={isSubmitting}
              >
                <MinusCircle size={20} className="mr-2" /> Removed
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Internal Costs Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="text-lg font-medium text-gray-800">
            Associated Costs (Internal)
          </label>
          <Button
            type="button"
            onClick={() =>
              appendCost({ name: "", amount: "", method: "", accountId: "" })
            }
            variant="subtle"
            className="!h-8 text-sm"
            disabled={isSubmitting}
          >
            <PlusCircle size={16} className="mr-2" />
            Add Cost
          </Button>
        </div>
        <AnimatePresence>
          {costsFields.map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-9 gap-3 mb-3 items-end bg-gray-50 p-3 rounded-md"
            >
              <div className="lg:col-span-3">
              <InputField
                label="Cost Name"
                name={`costs.${index}.name`}
                register={register}
                error={errors.costs?.[index]?.name?.message}
                validation={{ required: "Required" }}
              />
              </div>
              <div className="lg:col-span-1">
              <InputField
                label="Amount"
                name={`costs.${index}.amount`}
                type="number"
                step="any"
                register={register}
                error={errors.costs?.[index]?.amount?.message}
                validation={{ required: "Required", valueAsNumber: true }}
              />
              </div>
              <div className="lg:col-span-1">
              <SelectField
                name={`costs.${index}.method`}
                control={control}
                validation={{ required: "Required" }}
                label="Method"
                error={errors.costs?.[index]?.method?.message}
                options={[
                  { value: "Cash", label: "Cash" },
                  { value: "Bank", label: "Bank" },
                  { value: "Mobile Banking", label: "Mobile Banking" },
                ]}
              />
              </div>
              <div className="lg:col-span-3">
              <ComboboxField
                name={`costs.${index}.accountId`}
                control={control}
                validation={{ required: "Required" }}
                label="Account"
                error={errors.costs?.[index]?.accountId?.message}
                options={getFilteredAccounts(watch(`costs.${index}.method`))}
                placeholder="Select account..."
                disabled={!watch(`costs.${index}.method`)}
              />
              </div>
              <div className="lg:col-span-1">
              <Button
                type="button"
                onClick={() => removeCost(index)}
                variant="subtle"
                className="!h-10 text-[var(--color-danger)]"
              >
                <MinusCircle size={20} />
              </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Discount"
          name="discount"
          type="number"
          step="any"
          register={register}
          error={errors.discount?.message}
          validation={{
            min: { value: 0, message: "No negative discount" },
            valueAsNumber: true,
          }}
        />
        {/*
         * Financial Summary Box (display next to discount)
         *
         * "Total Payable" is a DISPLAY-ONLY calculation:
         *   Total Payable = Net Payable (current sale) + Outstanding Due (past invoiced dues)
         *
         * It is NOT used for any payment logic, backend submission, or invoice calculation.
         * It simply gives the user a quick glance at the customer's overall financial picture.
         * The "Net Payable" (totalAmountToBePaid) is the only value that matters for this sale.
         */}
        <div className="p-4 bg-[var(--color-secondary)]/10 rounded-lg space-y-2">
          {/* 1. Net Payable — the actual amount due for THIS sale */}
          <div className="flex justify-between items-center">
            <span className="font-bold text-[var(--color-secondary)]">
              Net Payable:
            </span>
            <span className="text-xl font-bold text-[var(--color-secondary)]">
              {formatCurrency(totalAmountToBePaid)}
            </span>
          </div>

          {selectedCustomer && (
            <>
              {/* 2. Outstanding Due — total unpaid from past invoiced sales */}
              {(selectedCustomer.outstandingDue > 0) && (
                <div className="flex justify-between items-center pt-1 border-t border-[var(--color-secondary)]/20">
                  <span className="text-xs font-medium text-amber-700">
                    Outstanding Due:
                  </span>
                  <span className="text-sm font-bold text-amber-700">
                    {formatCurrency(selectedCustomer.outstandingDue)}
                  </span>
                </div>
              )}

              {/* 3. Total Payable — display-only: Net Payable + Outstanding Due (NOT used for payments or backend) */}
              {(selectedCustomer.outstandingDue > 0) && (
                <div className="flex justify-between items-center pt-1 border-t border-[var(--color-secondary)]/20">
                  <span className="text-xs font-medium text-red-700">
                    Total Payable:
                  </span>
                  <span className="text-sm font-bold text-red-700">
                    {formatCurrency(totalAmountToBePaid + (selectedCustomer.outstandingDue || 0))}
                  </span>
                </div>
              )}

              {/* 4. Customer Credit Balance */}
              <div className="flex justify-between items-center pt-1 border-t border-[var(--color-secondary)]/20">
                <span className="text-xs font-medium text-[var(--color-primary)]">
                  Credit Balance:
                </span>
                <span className="text-sm font-bold text-[var(--color-primary)]">
                  {formatCurrency(selectedCustomer.creditBalance || 0)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Invoice & Payment Status */}
      <h3 className="text-lg font-medium text-gray-800 pt-4 border-t border-gray-100">
        Payment & Invoice
      </h3>

      {customerType === "manual" && watchedInvoiceStatus === "Invoiced" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3 text-blue-800 mb-1"
        >
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold block mb-0.5">Full Payment Required</span>
            Guest sales do not support due or partial balances. The total amount must be paid in full to issue an invoice.
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <SelectField
            name="invoiceStatus"
            control={control}
            label="Invoice Status"
            error={errors.invoiceStatus?.message}
            options={[
              { value: "Not-invoiced", label: "Not Invoiced" },
              { value: "Invoiced", label: "Invoiced" },
            ]}
            icon={FileText}
            onChange={(val) => {
              handleInvoiceStatusChange(val);
            }}
          />
        </div>

        <div className="space-y-4">
          <SelectField
            name="paymentStatus"
            control={control}
            label="Payment Status"
            error={errors.paymentStatus?.message}
            options={[
              { value: "Paid payment", label: "Paid" },
              ...(customerType !== "manual" ? [
                { value: "Due payment", label: "Due" },
                { value: "Partial payment", label: "Partial" },
              ] : []),
            ]}
            icon={CreditCard}
            disabled={watchedInvoiceStatus === "Not-invoiced" || customerType === "manual"} // lock it completely if manual since Paid is forced
            onChange={(val) => {
              handlePaymentStatusChange(val);
            }}
          />
        </div>
      </div>

      {/* Payments List */}
      <AnimatePresence>
        {paymentsFields.map((field, index) => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-11 gap-3 items-end p-3 bg-blue-50/50 rounded-lg border border-blue-100"
          >
            <div className="lg:col-span-2">
            <InputField
              label="Amount Paid"
              name={`payments.${index}.amount`}
              type="number"
              step="any"
              register={register}
              error={errors.payments?.[index]?.amount?.message}
              validation={{
                required: "Required",
                valueAsNumber: true,
                validate: (value) => {
                  if (value <= 0) return "Must be positive";
                  const allPayments = watch("payments") || [];
                  const otherPayments = allPayments.reduce((sum, p, i) => {
                    return i === index ? sum : sum + (parseFloat(p.amount) || 0);
                  }, 0);
                  // Use a small epsilon for float comparison if needed, but strict check is safer
                  const remaining = Math.max(0, totalAmountToBePaid - otherPayments);
                  // Allow slight floating point tolerance (e.g. 0.001)
                  if (value > remaining + 0.001) {
                    return `Maximum allowed: ${formatCurrency(remaining)}`;
                  }
                  return true;
                },
              }}
            />
            </div>
            <div className="lg:col-span-3">
            <InputField
              label="Date & Time"
              name={`payments.${index}.date`}
              type="datetime-local"
              register={register}
              error={errors.payments?.[index]?.date?.message}
              validation={{ required: "Required" }}
            />
            </div>
            <div className="lg:col-span-2 space-y-1">
              <SelectField
                name={`payments.${index}.method`}
                control={control}
                validation={{ required: "Required" }}
                onChange={(val) => {
                  // Refresh customer data when Customer Credit is selected to get latest balance
                  if (val === "Customer Credit") {
                    queryClient.invalidateQueries({ queryKey: ["customers"] });
                  }
                }}
                label="Method"
                error={errors.payments?.[index]?.method?.message}
                options={[
                  { value: "Cash", label: "Cash" },
                  { value: "Bank", label: "Bank" },
                  { value: "Mobile Banking", label: "Mobile Banking" },
                  {
                    value: "Customer Credit",
                    label: "Customer Credit",
                    disabled:
                      customerType === "manual" ||
                      !selectedCustomer?.creditBalance ||
                      selectedCustomer.creditBalance <= 0,
                  },
                ]}
              />
            </div>

            <div className="lg:col-span-3">
            <ComboboxField
              name={`payments.${index}.accountId`}
              control={control}
              validation={{
                required:
                  watch(`payments.${index}.method`) !== "Customer Credit" &&
                  "Required",
              }}
              label="To Account"
              error={errors.payments?.[index]?.accountId?.message}
              options={getFilteredAccounts(watch(`payments.${index}.method`))}
              placeholder="Select account..."
              disabled={
                !watch(`payments.${index}.method`) ||
                watch(`payments.${index}.method`) === "Customer Credit"
              }
            />
            </div>
            <div className="lg:col-span-1 flex gap-2">
              {(watchedPaymentStatus === "Partial payment" || watchedPaymentStatus === "Paid payment") && (
                <Button
                  type="button"
                  onClick={() => removePayment(index)}
                  variant="subtle"
                  className="!h-10 text-[var(--color-danger)]"
                >
                  <MinusCircle size={20} />
                </Button>
              )}
              {index === paymentsFields.length - 1 &&
                (watchedPaymentStatus === "Partial payment" || watchedPaymentStatus === "Paid payment") && (
                  <Button
                    type="button"
                    onClick={() => {
                      const businessDateTime = getBusinessDateTimeISO(settings?.timezone);
                      appendPayment({
                        amount: "",
                        date: businessDateTime,
                        method: "",
                        accountId: "",
                      });
                    }}
                    variant="subtle"
                    className="!h-10 text-[var(--color-primary)]"
                  >
                    <PlusCircle size={20} />
                  </Button>
                )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div >
  );
};

export default SaleFinancials;
