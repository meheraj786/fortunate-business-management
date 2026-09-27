import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import PropTypes from "prop-types";
import { ChevronDown, Loader2, UserX } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useUpdateCustomerStatusDirect } from "@/api/hooks/customer";
import { useAuth } from "@/hooks/useAuth";

const CUSTOMER_STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Suspended", label: "Suspended" },
];

const CustomerStatusDropdown = ({
  customerId,
  customerName = "",
  currentStatus = "Active",
  size = "sm",
  showIcon = false,
  className = "",
  onStatusUpdated,
}) => {
  const { hasPermission } = useAuth();
  const canUpdate = hasPermission("CUSTOMER_UPDATE");
  const updateMutation = useUpdateCustomerStatusDirect();

  const [isOpen, setIsOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const executeStatusChange = useCallback(
    (newStatus) => {
      setIsOpen(false);
      setSuspendModalOpen(false);
      updateMutation.mutate(
        { id: customerId, status: newStatus },
        {
          onSuccess: (data) => {
            if (onStatusUpdated) onStatusUpdated(data);
          },
        },
      );
    },
    [customerId, updateMutation, onStatusUpdated],
  );

  const handleSelectOption = useCallback(
    (newStatus, e) => {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      setIsOpen(false);
      if (newStatus === "Suspended") {
        setSuspendModalOpen(true);
      } else {
        executeStatusChange(newStatus);
      }
    },
    [executeStatusChange],
  );

  if (!canUpdate) {
    return (
      <StatusBadge
        status={currentStatus}
        size={size}
        showIcon={showIcon}
        className={className}
      />
    );
  }

  return (
    <>
      <div
        className={`relative inline-block text-left ${className}`}
        ref={dropdownRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          disabled={updateMutation.isPending}
          className="inline-flex items-center gap-1 cursor-pointer group transition-all rounded-full hover:ring-2 hover:ring-offset-1 hover:ring-gray-300 focus:outline-none"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={`Change status of ${customerName || "customer"}`}
          id={`customer-status-trigger-${customerId}`}
        >
          <StatusBadge
            status={currentStatus}
            size={size}
            showIcon={showIcon}
          />
          {updateMutation.isPending ? (
            <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin flex-shrink-0" />
          ) : (
            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-400 transition-transform group-hover:text-gray-600 flex-shrink-0 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </button>

        {isOpen && (
          <div
            className="absolute z-30 mt-1 left-1/2 -translate-x-1/2 min-w-[150px] bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-in fade-in slide-in-from-top-1 duration-150"
            role="listbox"
            aria-label="Select customer status"
            onClick={(e) => e.stopPropagation()}
          >
            {CUSTOMER_STATUS_OPTIONS.map((option) => {
              const isActive = option.value === currentStatus;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={(e) => !isActive && handleSelectOption(option.value, e)}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center gap-2 ${
                    isActive
                      ? "bg-gray-50 text-gray-400 cursor-default font-medium"
                      : "text-gray-700 hover:bg-gray-50 cursor-pointer"
                  }`}
                  disabled={isActive}
                  id={`customer-status-option-${customerId}-${option.value.toLowerCase()}`}
                >
                  <StatusBadge status={option.value} size="sm" showIcon={false} />
                  {isActive && (
                    <span className="ml-auto text-[10px] text-gray-400">Current</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={suspendModalOpen}
        onClose={() => setSuspendModalOpen(false)}
        onConfirm={() => executeStatusChange("Suspended")}
        title="Suspend Customer"
        description={`Are you sure you want to suspend customer "${customerName}"? Suspended customers cannot make new purchases or be selected for new sales.`}
        confirmText="Suspend Customer"
        cancelText="Cancel"
        isConfirming={updateMutation.isPending}
        icon={UserX}
        variant="danger"
      />
    </>
  );
};

CustomerStatusDropdown.propTypes = {
  customerId: PropTypes.string.isRequired,
  customerName: PropTypes.string,
  currentStatus: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  showIcon: PropTypes.bool,
  className: PropTypes.string,
  onStatusUpdated: PropTypes.func,
};

export default memo(CustomerStatusDropdown);
