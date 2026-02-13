import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useFieldArray, Controller } from "react-hook-form";
import { PlusCircle, MinusCircle, FileText, CreditCard } from "lucide-react";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import Button from "@/components/ui/Button";
import { useSettings } from "@/context/SettingsContext";
import { formatAccountLabel } from "@/utils/format";

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
  const { formatCurrency } = useSettings();
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
      setValue("paymentStatus", "Due payment");
    }
  };

  const handlePaymentStatusChange = (status) => {
    if (status === "Paid payment") {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setValue("payments", [
        {
          amount: parseFloat(totalAmountToBePaid).toFixed(2),
          date: now.toISOString().slice(0, 16),
          method: "",
          accountId: "",
        },
      ]);
    } else if (status === "Due payment") {
      setValue("payments", []);
    } else if (status === "Partial payment") {
      // Initialize with one empty row if there are no existing payments
      if (paymentsFields.length === 0) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        setValue("payments", [
          {
            amount: "",
            date: now.toISOString().slice(0, 16),
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
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 items-end bg-gray-50 p-3 rounded-md"
            >
              <InputField
                label="Charge Name"
                name={`charges.${index}.name`}
                register={register}
                error={errors.charges?.[index]?.name?.message}
                validation={{ required: "Charge name is required" }}
                disabled={isSubmitting}
              />
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-3 items-end bg-gray-50 p-3 rounded-md"
            >
              <InputField
                label="Cost Name"
                name={`costs.${index}.name`}
                register={register}
                error={errors.costs?.[index]?.name?.message}
                validation={{ required: "Required" }}
              />
              <InputField
                label="Amount"
                name={`costs.${index}.amount`}
                type="number"
                step="any"
                register={register}
                error={errors.costs?.[index]?.amount?.message}
                validation={{ required: "Required", valueAsNumber: true }}
              />
              <Controller
                name={`costs.${index}.method`}
                control={control}
                rules={{ required: "Required" }}
                render={({ field }) => (
                  <SelectField
                    {...field}
                    label="Method"
                    error={errors.costs?.[index]?.method?.message}
                    options={[
                      { value: "Cash", label: "Cash" },
                      { value: "Bank", label: "Bank" },
                      { value: "Mobile Banking", label: "Mobile Banking" },
                    ]}
                  />
                )}
              />
              <Controller
                name={`costs.${index}.accountId`}
                control={control}
                rules={{ required: "Required" }}
                render={({ field }) => (
                  <SelectField
                    {...field}
                    label="Account"
                    error={errors.costs?.[index]?.accountId?.message}
                    options={getFilteredAccounts(
                      watch(`costs.${index}.method`),
                    )}
                    disabled={!watch(`costs.${index}.method`)}
                  />
                )}
              />
              <Button
                type="button"
                onClick={() => removeCost(index)}
                variant="subtle"
                className="!h-10 text-[var(--color-danger)]"
              >
                <MinusCircle size={20} />
              </Button>
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
        <div className="p-4 bg-[var(--color-secondary)]/10 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-bold text-[var(--color-secondary)]">
              Net Payable:
            </span>
            <span className="text-xl font-bold text-[var(--color-secondary)]">
              {formatCurrency(totalAmountToBePaid)}
            </span>
          </div>
          {selectedCustomer && (
            <div className="flex justify-between items-center mt-1 pt-1 border-t border-[var(--color-secondary)]/20">
              <span className="text-xs font-medium text-[var(--color-primary)]">
                Customer Credit Balance:
              </span>
              <span className="text-sm font-bold text-[var(--color-primary)]">
                {formatCurrency(selectedCustomer.creditBalance || 0)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Invoice & Payment Status */}
      <h3 className="text-lg font-medium text-gray-800 pt-4 border-t border-gray-100">
        Payment & Invoice
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Controller
            name="invoiceStatus"
            control={control}
            render={({ field }) => (
              <SelectField
                {...field}
                label="Invoice Status"
                error={errors.invoiceStatus?.message}
                options={[
                  { value: "Not-invoiced", label: "Not Invoiced" },
                  { value: "Invoiced", label: "Invoiced" },
                ]}
                icon={FileText}
                disabled={customerType === "manual"} // Manual customers forced to Invoiced
                onChange={(e) => {
                  field.onChange(e);
                  handleInvoiceStatusChange(e.target.value);
                }}
              />
            )}
          />
          {customerType === "manual" && (
            <p className="text-xs text-amber-600 mt-1">
              Guest sales must be fully invoiced.
            </p>
          )}
        </div>

        <div className="space-y-4">
          <Controller
            name="paymentStatus"
            control={control}
            render={({ field }) => (
              <SelectField
                {...field}
                label="Payment Status"
                error={errors.paymentStatus?.message}
                options={[
                  { value: "Paid payment", label: "Paid" },
                  {
                    value: "Due payment",
                    label: "Due",
                    disabled: customerType === "manual",
                  },
                  {
                    value: "Partial payment",
                    label: "Partial",
                    disabled: customerType === "manual",
                  },
                ]}
                icon={CreditCard}
                disabled={watchedInvoiceStatus === "Not-invoiced"}
                onChange={(e) => {
                  field.onChange(e);
                  handlePaymentStatusChange(e.target.value);
                }}
              />
            )}
          />
          {customerType === "manual" && (
            <p className="text-xs text-amber-600 mt-1">
              Guest sales accept full payment only.
            </p>
          )}
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end p-3 bg-blue-50/50 rounded-lg border border-blue-100"
          >
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
            <InputField
              label="Date & Time"
              name={`payments.${index}.date`}
              type="datetime-local"
              register={register}
              error={errors.payments?.[index]?.date?.message}
              validation={{ required: "Required" }}
            />
            <div className="space-y-1">
              <Controller
                name={`payments.${index}.method`}
                control={control}
                rules={{ required: "Required" }}
                render={({ field }) => (
                  <SelectField
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      // Refresh customer data when Customer Credit is selected to get latest balance
                      if (e.target.value === "Customer Credit") {
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
                )}
              />
            </div>

            <Controller
              name={`payments.${index}.accountId`}
              control={control}
              rules={{
                required:
                  watch(`payments.${index}.method`) !== "Customer Credit" &&
                  "Required",
              }}
              render={({ field }) => (
                <SelectField
                  {...field}
                  label="To Account"
                  error={errors.payments?.[index]?.accountId?.message}
                  options={getFilteredAccounts(
                    watch(`payments.${index}.method`),
                  )}
                  disabled={
                    !watch(`payments.${index}.method`) ||
                    watch(`payments.${index}.method`) === "Customer Credit"
                  }
                />
              )}
            />
            <div className="flex gap-2">
              {watchedPaymentStatus === "Partial payment" && (
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
                watchedPaymentStatus === "Partial payment" && (
                  <Button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      now.setMinutes(
                        now.getMinutes() - now.getTimezoneOffset(),
                      );
                      appendPayment({
                        amount: "",
                        date: now.toISOString().slice(0, 16),
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
