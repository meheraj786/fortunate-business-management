import React, { memo, useCallback, useState } from "react";
import PropTypes from "prop-types";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2, Pencil, Lock } from "lucide-react";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import ComboboxField from "@/components/ui/ComboboxField";
import Button from "@/components/ui/Button";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useFieldArray } from "react-hook-form";
import { useSettings } from "@/context/SettingsContext";
import { formatAccountLabel } from "@/utils/format";
import { searchAccounts } from "@/api/account.api";

const CostsSection = ({
  control, // from react-hook-form
  register, // from react-hook-form
  errors, // from react-hook-form
  watch, // from react-hook-form
  setValue, // from react-hook-form (needed for auto-calc)
  section, // the path to the costs array in the form data
  accounts,
  paymentMethods,
  className = "",
  isSubmitting = false,
  isDocumentSection = false,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: section, // e.g., "financialInfo.costs"
  });
  const { settings } = useSettings();

  // Confirmation state for removing existing (financially processed) costs
  const [pendingRemoveIndex, setPendingRemoveIndex] = useState(null);
  // Track which existing costs have been unlocked for editing
  const [unlockedCosts, setUnlockedCosts] = useState(new Set());

  const handleRemoveCost = useCallback(
    (index) => {
      const cost = fields[index];
      // If the cost has a DB _id, it's an existing cost that was already financially processed.
      // Removing it will trigger a reversal on save — confirm with the user first.
      if (cost._id) {
        setPendingRemoveIndex(index);
      } else {
        remove(index);
      }
    },
    [fields, remove],
  );

  const confirmRemoveCost = useCallback(() => {
    if (pendingRemoveIndex !== null) {
      remove(pendingRemoveIndex);
      setPendingRemoveIndex(null);
    }
  }, [pendingRemoveIndex, remove]);

  const toggleUnlock = useCallback((costId) => {
    setUnlockedCosts((prev) => {
      const next = new Set(prev);
      if (next.has(costId)) {
        next.delete(costId);
      } else {
        next.add(costId);
      }
      return next;
    });
  }, []);

  const sectionAnimation = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.2 },
  };

  const getCostNamePlaceholder = useCallback((sectionName, index) => {
    const placeholders = {
      "financialInfo.costs": {
        first: "e.g., Bank Commission",
        other: "e.g., Swift Fees, Insurance",
      },
      "shippingCustomsInfo.costs": {
        first: "e.g., Customs Duty",
        other: "e.g., Port Fees, Freight Charges",
      },
      "agentTransportInfo.costs": {
        first: "e.g., C&F Agent Bill",
        other: "e.g., Local Transport, Labor Cost",
      },
      "otherExpenses.costs": {
        first: "e.g., Utility Bills",
        other: "e.g., Miscellaneous expenses",
      },
      "documentProductInfo.costs": {
        first: "e.g., Document Payment",
        other: "e.g., Shipment Payment",
      },
    };

    const sectionPlaceholders = placeholders[sectionName];
    if (!sectionPlaceholders) {
      return "Enter cost name"; // Fallback
    }

    return index === 0 ? sectionPlaceholders.first : sectionPlaceholders.other;
  }, []);

  // Helper to get nested error message safely
  const getNestedErrorMessage = useCallback(
    (path) => {
      const pathParts = path.replace(/\[/g, ".").replace(/\]/g, "").split(".");
      let current = errors;
      for (const part of pathParts) {
        if (current === null || current === undefined) {
          return undefined;
        }
        current = current[part];
      }
      return current?.message;
    },
    [errors],
  );

  // Helper: recalculate BDT when user changes USD or Rate.
  // Called from onChange handlers on the USD and Rate inputs (not useEffect).
  // This ensures BDT is NEVER overwritten on initial form load — only when
  // the user actively types in these fields.
  const recalcBdt = useCallback(
    (index, { usd, rate }) => {
      if (usd > 0 && rate > 0) {
        const bdt = parseFloat((usd * rate).toFixed(2));
        setValue(`${section}[${index}].amount`, bdt);
      }
    },
    [section, setValue],
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-800">Costs</h4>
        <span className="text-sm text-gray-500">
          {fields.length} cost{fields.length !== 1 ? "s" : ""}
        </span>
      </div>

      <AnimatePresence>
        {fields.map((cost, index) => {
          // Existing costs (with _id) are frozen by default
          const isExisting = !!cost._id;
          const isUnlocked = !isExisting || unlockedCosts.has(cost._id);
          const isFrozen = isExisting && !isUnlocked;

          return (
            <motion.div
              key={cost.id}
              {...sectionAnimation}
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 p-4 rounded-lg relative ${
                isFrozen
                  ? "bg-gray-100/80 border border-gray-200"
                  : isExisting && isUnlocked
                    ? "bg-amber-50/60 border border-amber-200"
                    : "bg-gray-50"
              }`}
            >
              {/* Frozen overlay indicator */}
              {isFrozen && (
                <div className="absolute top-2 left-3 flex items-center gap-1.5 text-xs text-gray-400 z-10">
                  <Lock className="w-3 h-3" />
                  <span>Saved</span>
                </div>
              )}

              <div className={isDocumentSection ? "lg:col-span-3 md:col-span-1" : "lg:col-span-4 md:col-span-1"}>
                <InputField
                  label={`Cost Name ${index + 1}`}
                  name={`${section}[${index}].name`}
                  register={register}
                  error={getNestedErrorMessage(`${section}[${index}].name`)}
                  placeholder={getCostNamePlaceholder(section, index)}
                  validation={{ required: "Cost name is required" }}
                  disabled={isSubmitting || isFrozen}
                />
              </div>

              {isDocumentSection ? (
                <>
                  <div className="lg:col-span-2 md:col-span-1">
                    <InputField
                      label="Amount (USD)"
                      name={`${section}[${index}].amountUsd`}
                      type="number"
                      register={register}
                      error={getNestedErrorMessage(`${section}[${index}].amountUsd`)}
                      placeholder="e.g., 25000"
                      validation={{
                        min: { value: 0.01, message: "Must be positive" },
                        valueAsNumber: true,
                        onChange: (e) => {
                          const usd = parseFloat(e.target.value) || 0;
                          const rate = parseFloat(watch(`${section}[${index}].costExchangeRate`)) || 0;
                          recalcBdt(index, { usd, rate });
                        },
                      }}
                      disabled={isSubmitting || isFrozen}
                      step="0.01"
                    />
                  </div>
                  <div className="lg:col-span-2 md:col-span-1">
                    <InputField
                      label="Rate"
                      name={`${section}[${index}].costExchangeRate`}
                      type="number"
                      register={register}
                      error={getNestedErrorMessage(`${section}[${index}].costExchangeRate`)}
                      placeholder="e.g., 115.50"
                      validation={{
                        min: { value: 0.01, message: "Must be positive" },
                        valueAsNumber: true,
                        onChange: (e) => {
                          const usd = parseFloat(watch(`${section}[${index}].amountUsd`)) || 0;
                          const rate = parseFloat(e.target.value) || 0;
                          recalcBdt(index, { usd, rate });
                        },
                      }}
                      disabled={isSubmitting || isFrozen}
                      step="0.01"
                    />
                  </div>
                  <div className="lg:col-span-2 md:col-span-1">
                    <InputField
                      label={`${settings?.currency || "BDT"}`}
                      name={`${section}[${index}].amount`}
                      type="number"
                      register={register}
                      error={getNestedErrorMessage(`${section}[${index}].amount`)}
                      placeholder="Enter amount"
                      validation={{
                        required: "Amount is required",
                        min: { value: 0.01, message: "Must be positive" },
                        valueAsNumber: true,
                      }}
                      disabled={isSubmitting || isFrozen}
                    />
                  </div>
                </>
              ) : (
                <div className="lg:col-span-2 md:col-span-1">
                  <InputField
                    label={`Amount (${settings?.currency || "BDT"})`}
                    name={`${section}[${index}].amount`}
                    type="number"
                    register={register}
                    error={getNestedErrorMessage(`${section}[${index}].amount`)}
                    placeholder="e.g., 5000"
                    validation={{
                      required: "Amount is required",
                      min: { value: 0.01, message: "Amount must be positive" },
                      valueAsNumber: true,
                    }}
                    disabled={isSubmitting || isFrozen}
                  />
                </div>
              )}

              <div className={isDocumentSection ? "lg:col-span-2 md:col-span-1" : "lg:col-span-2 md:col-span-1"}>
                <SelectField
                  label="Payment Method"
                  name={`${section}[${index}].paymentMethod`}
                  control={control}
                  error={getNestedErrorMessage(
                    `${section}[${index}].paymentMethod`,
                  )}
                  options={paymentMethods.map((method) => ({
                    value: method,
                    label: method,
                  }))}
                  validation={{ required: "Payment method is required" }}
                  disabled={isSubmitting || isFrozen}
                />
              </div>
              <div className={isDocumentSection ? "lg:col-span-2 md:col-span-1" : "lg:col-span-3 md:col-span-1"}>
                {watch(`${section}[${index}].paymentMethod`) && (
                  <ComboboxField
                    label="Select Account"
                    name={`${section}[${index}].accountId`}
                    control={control}
                    error={getNestedErrorMessage(
                      `${section}[${index}].accountId`,
                    )}
                    fetchOptions={async (q) => {
                      const method = watch(`${section}[${index}].paymentMethod`);
                      if (!method) return [];
                      try {
                        const res = await searchAccounts(q, method);
                        return (res.data?.data || []).map((acc) => ({
                          value: acc._id,
                          label: formatAccountLabel(acc),
                        }));
                      } catch {
                        return [];
                      }
                    }}
                    placeholder="Search account..."
                    validation={{ required: "Account is required" }}
                    disabled={isSubmitting || isFrozen}
                    initialOption={
                      cost._accountLabel && cost.accountId
                        ? { value: cost.accountId, label: cost._accountLabel }
                        : undefined
                    }
                  />
                )}
              </div>
              <div className="lg:col-span-1 flex items-end justify-start sm:justify-end gap-1">
                {/* Edit/Lock toggle button for existing costs */}
                {isExisting && (
                  <Button
                    type="button"
                    onClick={() => toggleUnlock(cost._id)}
                    variant="subtle"
                    className={`!p-2 ${
                      isUnlocked
                        ? "text-amber-600 hover:bg-amber-50"
                        : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    }`}
                    aria-label={isUnlocked ? "Lock cost" : "Edit cost"}
                    disabled={isSubmitting}
                    title={isUnlocked ? "Lock this cost" : "Unlock to edit this cost"}
                  >
                    {isUnlocked ? <Lock className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={() => handleRemoveCost(index)}
                  variant="subtle"
                  className="!p-2 text-[var(--color-danger)] hover:bg-[var(--color-danger-light)]"
                  aria-label="Remove cost"
                  disabled={isSubmitting || isFrozen}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <Button
        type="button"
        onClick={() =>
          append({
            name: "",
            amount: "",
            ...(isDocumentSection ? { amountUsd: "", costExchangeRate: "" } : {}),
            paymentMethod: "Cash",
            accountId: "",
          })
        }
        variant="secondary"
        className="w-full border-dashed border-gray-400 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        disabled={isSubmitting}
      >
        <Plus className="w-4 h-4 mr-2" />
        <span> Cost</span>
      </Button>

      <ConfirmationModal
        isOpen={pendingRemoveIndex !== null}
        onClose={() => setPendingRemoveIndex(null)}
        onConfirm={confirmRemoveCost}
        title="Remove Existing Cost?"
        description="This cost has already been financially processed. Removing it will reverse the transaction and refund the amount to the linked account when you save. Are you sure?"
        confirmText="Yes, Remove Cost"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

CostsSection.propTypes = {
  control: PropTypes.object.isRequired,
  register: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  watch: PropTypes.func.isRequired,
  setValue: PropTypes.func,
  section: PropTypes.string.isRequired,
  accounts: PropTypes.array.isRequired,
  paymentMethods: PropTypes.arrayOf(PropTypes.string).isRequired,
  className: PropTypes.string,
  isSubmitting: PropTypes.bool,
  isDocumentSection: PropTypes.bool,
};

export default memo(CostsSection);
