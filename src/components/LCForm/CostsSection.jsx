import React, { memo, useCallback } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import Button from "@/components/ui/Button"; // Import Button component
import { useFieldArray } from "react-hook-form"; // Import useFieldArray

const CostsSection = ({
  control, // from react-hook-form
  register, // from react-hook-form
  errors, // from react-hook-form
  watch, // from react-hook-form
  section, // the path to the costs array in the form data
  accounts,
  paymentMethods,
  className = "",
  isSubmitting = false,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: section, // e.g., "financialInfo.costs"
  });

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
      "otherExpenses.costs": { // Added for otherExpenses
        first: "e.g., Utility Bills",
        other: "e.g., Miscellaneous expenses",
      },
    };

    const sectionPlaceholders = placeholders[sectionName];
    if (!sectionPlaceholders) {
      return "Enter cost name"; // Fallback
    }

    return index === 0 ? sectionPlaceholders.first : sectionPlaceholders.other;
  }, []);

  // Helper to get nested error message
  const getNestedError = useCallback((fieldErrors, path) => {
    const pathParts = path.split('.');
    let current = fieldErrors;
    for (let i = 0; i < pathParts.length; i++) {
      if (!current) return undefined;
      current = current[pathParts[i]];
    }
    return current?.message;
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-800">Costs</h4>
        <span className="text-sm text-gray-500">
          {fields.length} cost{fields.length !== 1 ? "s" : ""}
        </span>
      </div>

      <AnimatePresence>
        {fields.map((cost, index) => (
          <motion.div
            key={cost.id}
            {...sectionAnimation}
            className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <div className="sm:col-span-3">
              <InputField
                label={`Cost Name ${index + 1}`}
                name={`${section}[${index}].name`}
                register={register}
                error={getNestedError(errors, `${section}[${index}].name`)}
                placeholder={getCostNamePlaceholder(section, index)}
                validation={{ required: "Cost name is required" }}
                disabled={isSubmitting}
              />
            </div>
            <div className="sm:col-span-3">
              <InputField
                label="Amount (BDT)"
                name={`${section}[${index}].amount`}
                type="number"
                register={register}
                error={getNestedError(errors, `${section}[${index}].amount`)}
                placeholder="e.g., 5000"
                validation={{ required: "Amount is required", min: { value: 0, message: "Amount must be positive" }, valueAsNumber: true }}
                disabled={isSubmitting}
              />
            </div>
            <div className="sm:col-span-3">
              <SelectField
                label="Payment Method"
                name={`${section}[${index}].paymentMethod`}
                register={register}
                error={getNestedError(errors, `${section}[${index}].paymentMethod`)}
                options={paymentMethods.map((method) => ({
                  value: method,
                  label: method,
                }))}
                validation={{ required: "Payment method is required" }}
                disabled={isSubmitting}
              />
            </div>
            <div className="sm:col-span-2">
              {watch(`${section}[${index}].paymentMethod`) && ( // Watch the paymentMethod for this specific cost
                <SelectField
                  label="Select Account"
                  name={`${section}[${index}].accountId`}
                  register={register}
                  error={getNestedError(errors, `${section}[${index}].accountId`)}
                  options={accounts
                    .filter(
                      (acc) =>
                        acc.accountType ===
                        watch(`${section}[${index}].paymentMethod`)
                    )
                    .map((acc) => {
                      let label = "";
                      if (acc.accountType === "Bank") {
                        label = `${acc.bankName || 'N/A'} (${acc.accountHolderName || 'N/A'}) - ${acc.accountNumber || 'N/A'}`;
                      } else if (acc.accountType === "Mobile Banking") {
                        label = `${acc.serviceName || 'N/A'} (${acc.accountHolderName || 'N/A'}) - ${acc.mobileNumber || 'N/A'}`;
                      } else if (acc.accountType === "Cash") {
                        label = `${acc.accountName || acc.accountType} (${acc.accountHolderName || 'N/A'})`;
                      }
                      return { value: acc._id, label: label };
                    })}
                  placeholder="Choose account"
                  validation={{ required: "Account is required" }}
                  disabled={isSubmitting}
                />
              )}
            </div>
            <div className="sm:col-span-1 flex items-end justify-end">
              <Button
                type="button"
                onClick={() => remove(index)}
                variant="subtle"
                className="!p-2 text-[var(--color-danger)] hover:bg-[var(--color-danger-light)]"
                aria-label="Remove cost"
                disabled={isSubmitting}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <Button
        type="button"
        onClick={() => append({ name: "", amount: 0, paymentMethod: "Cash", accountId: "" })}
        variant="secondary"
        className="w-full border-dashed border-gray-400 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        disabled={isSubmitting}
      >
        <Plus className="w-4 h-4 mr-2" />
        <span>Add Cost</span>
      </Button>
    </div>
  );
};

CostsSection.propTypes = {
  control: PropTypes.object.isRequired,
  register: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  watch: PropTypes.func.isRequired,
  section: PropTypes.string.isRequired,
  accounts: PropTypes.array.isRequired,
  paymentMethods: PropTypes.arrayOf(PropTypes.string).isRequired,
  className: PropTypes.string,
  isSubmitting: PropTypes.bool,
};

export default memo(CostsSection);
