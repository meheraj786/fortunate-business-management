import React, { memo } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";

const CostsSection = ({
  costs,
  section,
  onCostChange,
  onAddCost,
  onRemoveCost,
  accounts,
  paymentMethods,
  className = "",
}) => {
  const sectionAnimation = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.2 },
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-800">Costs</h4>
        <span className="text-sm text-gray-500">
          {costs.length} cost{costs.length !== 1 ? "s" : ""}
        </span>
      </div>

      <AnimatePresence>
        {costs.map((cost, index) => (
          <motion.div
            key={cost.id}
            {...sectionAnimation}
            className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <div className="sm:col-span-3">
              <InputField
                label={`Cost Name ${index + 1}`}
                value={cost.name}
                onChange={(e) =>
                  onCostChange(section, cost.id, "name", e.target.value)
                }
                placeholder="e.g., Port Fees"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <InputField
                label="Amount (BDT)"
                type="number"
                value={cost.amount}
                onChange={(e) =>
                  onCostChange(section, cost.id, "amount", e.target.value)
                }
                placeholder="e.g., 5000"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="sm:col-span-2">
              <InputField
                label="Date"
                type="date"
                value={cost.date}
                onChange={(e) =>
                  onCostChange(section, cost.id, "date", e.target.value)
                }
                required
              />
            </div>
            <div className="sm:col-span-2">
              <SelectField
                label="Payment Method"
                value={cost.paymentMethod}
                onChange={(e) =>
                  onCostChange(
                    section,
                    cost.id,
                    "paymentMethod",
                    e.target.value
                  )
                }
                options={paymentMethods.map((method) => ({
                  value: method,
                  label: method,
                }))}
                required
              />
            </div>
            <div className="sm:col-span-2">
              {(cost.paymentMethod === "Bank" ||
                cost.paymentMethod === "Mobile Banking") && (
                <SelectField
                  label="Select Account"
                  value={cost.accountId}
                  onChange={(e) =>
                    onCostChange(section, cost.id, "accountId", e.target.value)
                  }
                  options={accounts
                    .filter((acc) => acc.accountType === cost.paymentMethod)
                    .map((acc) => ({ value: acc._id, label: acc.accountName }))}
                  placeholder="Choose account"
                  required
                />
              )}
            </div>
            <div className="sm:col-span-1 flex items-end justify-end">
              <button
                type="button"
                onClick={() => onRemoveCost(cost.id)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                aria-label="Remove cost"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        type="button"
        onClick={onAddCost}
        className="flex items-center justify-center space-x-2 px-4 py-2 w-full border border-dashed border-gray-400 text-gray-600 rounded-lg hover:bg-gray-100 hover:border-gray-500 hover:text-gray-800 transition-colors"
      >
        <Plus className="w-4 h-4" />
        <span>Add Cost</span>
      </button>
    </div>
  );
};

CostsSection.propTypes = {
  costs: PropTypes.array.isRequired,
  section: PropTypes.string.isRequired,
  onCostChange: PropTypes.func.isRequired,
  onAddCost: PropTypes.func.isRequired,
  onRemoveCost: PropTypes.func.isRequired,
  accounts: PropTypes.array.isRequired,
  paymentMethods: PropTypes.arrayOf(PropTypes.string).isRequired,
  className: PropTypes.string,
};

export default memo(CostsSection);
