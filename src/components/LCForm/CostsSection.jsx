import React, { memo, useCallback } from "react";
import PropTypes from "prop-types";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import Button from "@/components/ui/Button"; // Import Button component
import { useFieldArray } from "react-hook-form"; // Import useFieldArray
import { useSettings } from "@/context/SettingsContext";
import { formatAccountLabel } from "@/utils/format";

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
  const { settings } = useSettings();

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
        // Added for otherExpenses
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg"
          >
            <div className="lg:col-span-3 md:col-span-1">
              <InputField
                label={`Cost Name ${index + 1}`}
                name={`${section}[${index}].name`}
                register={register}
                error={getNestedErrorMessage(`${section}[${index}].name`)}
                placeholder={getCostNamePlaceholder(section, index)}
                validation={{ required: "Cost name is required" }}
                disabled={isSubmitting}
              />
            </div>
            <div className="lg:col-span-3 md:col-span-1">
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
                disabled={isSubmitting}
              />
            </div>
            <div className="lg:col-span-3 md:col-span-1">
              <SelectField
                label="Payment Method"
                name={`${section}[${index}].paymentMethod`}
                register={register}
                error={getNestedErrorMessage(
                  `${section}[${index}].paymentMethod`,
                )}
                options={paymentMethods.map((method) => ({
                  value: method,
                  label: method,
                }))}
                validation={{ required: "Payment method is required" }}
                disabled={isSubmitting}
              />
            </div>
            <div className="lg:col-span-2 md:col-span-1">
              {watch(`${section}[${index}].paymentMethod`) && ( // Watch the paymentMethod for this specific cost
                <SelectField
                  label="Select Account"
                  name={`${section}[${index}].accountId`}
                  register={register}
                  error={getNestedErrorMessage(
                    `${section}[${index}].accountId`,
                  )}
                  // ... imports


              // ... inside component

              options={accounts
                .filter(
                  (acc) =>
                    acc.accountType ===
                    watch(`${section}[${index}].paymentMethod`),
                )
                .map((acc) => ({
                  value: acc._id,
                  label: formatAccountLabel(acc),
                }))}
              placeholder="Choose account"
              validation={{ required: "Account is required" }}
              disabled={isSubmitting}
                />
              )}
            </div>
            <div className="lg:col-span-1 flex items-end justify-start sm:justify-end">
              <Button
                type="button"
                onClick={() => remove(index)}
                variant="subtle"
                className="!p-2 text-[var(--color-danger)] hover:bg-[var(--color-danger-light)]"
                aria-label="Remove cost"
                disabled={isSubmitting}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <Button
        type="button"
        onClick={() =>
          append({ name: "", amount: "", paymentMethod: "Cash", accountId: "" })
        }
        variant="secondary"
        className="w-full border-dashed border-gray-400 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        disabled={isSubmitting}
      >
        <Plus className="w-4 h-4 mr-2" />
        <span> Cost</span>
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
