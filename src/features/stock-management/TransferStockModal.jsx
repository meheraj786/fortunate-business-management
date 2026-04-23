import React, { useState, useMemo, useCallback } from "react";
import {
  ArrowRightLeft,
  Warehouse,
  Package,
  AlertTriangle,
  Info,
} from "lucide-react";
import FormDialog from "@/components/ui/FormDialog";
import ComboboxField from "@/components/ui/ComboboxField";
import InputField from "@/components/ui/InputField";
import TextAreaField from "@/components/ui/TextAreaField";
import { showErrorToast } from "@/utils/notifications";
import { useWarehouses } from "@/api/hooks/warehouse";
import { useTransferStock } from "@/api/hooks/products";
import { useAuth } from "@/hooks/useAuth";

const TransferStockModal = ({
  isOpen,
  onClose,
  onSuccess,
  product,
  warehouseId,
}) => {
  const { user } = useAuth();

  const initialData = {
    destinationWarehouseId: "",
    transferType: "full",
    quantity: "",
    notes: "",
  };

  const [formData, setFormData] = useState(initialData);
  const [showFullConfirm, setShowFullConfirm] = useState(false);

  // Fetch all warehouses for the dropdown
  const { data: warehousesData, isLoading: warehousesLoading } =
    useWarehouses();
  const allWarehouses = warehousesData?.data?.warehouses || [];

  // Filter warehouses: exclude current, and for non-admin users only show accessible ones
  const availableWarehouses = useMemo(() => {
    const isAdmin =
      user?.roleName === "ADMIN" || user?.roleName === "SUPER_ADMIN";
    const userWarehouseIds = (user?.warehouse || []).map((id) => id.toString());

    return allWarehouses.filter((wh) => {
      // Exclude current warehouse
      if (wh._id === warehouseId) return false;
      // For non-admins, only show warehouses they have access to
      if (!isAdmin && !userWarehouseIds.includes(wh._id.toString()))
        return false;
      return true;
    });
  }, [allWarehouses, warehouseId, user]);

  const transferMutation = useTransferStock(warehouseId, product?._id);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTransferTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      transferType: type,
      // Clear quantity when switching to full
      quantity: type === "full" ? "" : prev.quantity,
    }));
  };

  const handleClose = useCallback(() => {
    setFormData(initialData);
    setShowFullConfirm(false);
    onClose();
  }, [onClose]);

  const formatQuantityDisplay = () => {
    if (!product) return "";
    const displayUnit = product?.unit?.name || "units";
    return `${product.quantity} ${displayUnit}`;
  };

  const handleSubmit = async () => {
    const { destinationWarehouseId, transferType, quantity, notes } = formData;

    if (!destinationWarehouseId) {
      showErrorToast("Please select a destination warehouse.");
      return;
    }

    if (transferType === "partial") {
      if (!quantity || Number(quantity) <= 0) {
        showErrorToast("Please enter a valid quantity to transfer.");
        return;
      }
      if (Number(quantity) >= product?.quantity) {
        showErrorToast(
          "Partial transfer quantity must be less than available stock. Use full transfer instead.",
        );
        return;
      }
    }

    // Two-step confirmation for full transfers
    if (transferType === "full" && !showFullConfirm) {
      setShowFullConfirm(true);
      return;
    }

    const payload = {
      destinationWarehouseId,
      transferType,
      notes: notes || undefined,
    };

    if (transferType === "partial") {
      payload.quantity = Number(quantity);
    }

    transferMutation.mutate(payload, {
      onSuccess: (response) => {
        setFormData(initialData);
        setShowFullConfirm(false);
        onSuccess?.(response);
        onClose();
      },
    });
  };

  const selectedDestination = availableWarehouses.find(
    (wh) => wh._id === formData.destinationWarehouseId,
  );

  const sourceWarehouse = allWarehouses.find((wh) => wh._id === warehouseId);

  const isPartial = formData.transferType === "partial";
  const transferQuantity = isPartial
    ? Number(formData.quantity) || 0
    : product?.quantity || 0;
  const unitName = product?.unit?.name || "units";

  return (
    <FormDialog
      open={isOpen}
      onClose={handleClose}
      title="Transfer Stock"
      primaryButtonText={
        transferMutation.isPending
          ? "Transferring..."
          : showFullConfirm
            ? "Yes, Transfer Everything"
            : "Confirm Transfer"
      }
      secondaryButtonText={showFullConfirm ? "Go Back" : "Cancel"}
      onSubmit={handleSubmit}
      onSecondaryClick={showFullConfirm ? () => setShowFullConfirm(false) : undefined}
      isSubmitting={transferMutation.isPending || warehousesLoading}
    >
      <div className="space-y-5 text-left">
        {showFullConfirm ? (
          /* Full Transfer Confirmation Step */
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="p-3 bg-amber-100 rounded-full">
                <AlertTriangle size={28} className="text-amber-600" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Confirm Full Transfer
              </h3>
              <p className="text-sm text-gray-600">
                This action will move the entire product to another warehouse.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Product</span>
                <span className="font-medium text-gray-900">{product?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Quantity</span>
                <span className="font-medium text-gray-900">{formatQuantityDisplay()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">From</span>
                <span className="font-medium text-gray-900">{sourceWarehouse?.name || "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">To</span>
                <span className="font-medium text-gray-900">{selectedDestination?.name || "—"}</span>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700">
                The product will no longer appear in {sourceWarehouse?.name || "the current warehouse"}&apos;s inventory.
                This cannot be undone automatically — you would need to transfer it back manually.
              </p>
            </div>
          </div>
        ) : (
          /* Normal Form Content */
          <>
        {/* Product Info Banner */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
            <Package size={18} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">
              {product?.name}
            </p>
            <p className="text-xs text-gray-600">
              Available: {formatQuantityDisplay()}
            </p>
          </div>
        </div>

        {/* Transfer Type Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transfer Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleTransferTypeChange("full")}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
                !isPartial
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              Full Transfer
            </button>
            <button
              type="button"
              onClick={() => handleTransferTypeChange("partial")}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
                isPartial
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              Partial Transfer
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            {isPartial
              ? "Move a specific quantity to the destination. A new product entry will be created there."
              : "Move the entire product (with all stock) to the destination warehouse."}
          </p>
        </div>

        {/* Destination Warehouse */}
        <ComboboxField
          label="Destination Warehouse"
          name="destinationWarehouseId"
          value={formData.destinationWarehouseId}
          onChange={(val) =>
            handleChange({
              target: { name: "destinationWarehouseId", value: val },
            })
          }
          options={availableWarehouses.map((wh) => ({
            value: wh._id,
            label: `${wh.name}${wh.location ? ` — ${wh.location}` : ""}`,
          }))}
          required={true}
          loading={warehousesLoading}
          placeholder="Select destination warehouse..."
          icon={Warehouse}
        />

        {/* Quantity (only for partial) */}
        {isPartial && (
          <div>
            <InputField
              label={`Quantity to Transfer (${unitName})`}
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              required={true}
              min="0"
              max={product?.quantity}
              step="any"
              placeholder={`Max: ${product?.quantity || 0}`}
            />
            {formData.quantity && Number(formData.quantity) > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                After transfer: source will have{" "}
                <span className="font-semibold">
                  {parseFloat(Math.max(0, (product?.quantity || 0) - Number(formData.quantity)).toFixed(3))}{" "}
                  {unitName}
                </span>{" "}
                remaining
              </p>
            )}
          </div>
        )}

        {/* Notes */}
        <TextAreaField
          label="Reason / Notes (Optional)"
          name="notes"
          value={formData.notes}
          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="e.g., Warehouse B needs more stock for upcoming orders"
          rows={2}
        />

        {/* Transfer Summary */}
        {formData.destinationWarehouseId && (
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 mb-1">
                  Transfer Summary
                </p>
                <p className="text-amber-700">
                  {isPartial ? (
                    <>
                      Move{" "}
                      <span className="font-semibold">
                        {formData.quantity || 0} {unitName}
                      </span>{" "}
                      of &quot;{product?.name}&quot;
                    </>
                  ) : (
                    <>
                      Move entire stock (
                      <span className="font-semibold">
                        {product?.quantity} {unitName}
                      </span>
                      ) of &quot;{product?.name}&quot;
                    </>
                  )}
                </p>
                <p className="text-amber-700 mt-0.5">
                  From{" "}
                  <span className="font-semibold">
                    {sourceWarehouse?.name || "Current Warehouse"}
                  </span>{" "}
                  → To{" "}
                  <span className="font-semibold">
                    {selectedDestination?.name || "—"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Warning for full transfer */}
        {!isPartial && formData.destinationWarehouseId && (
          <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
            <AlertTriangle
              size={16}
              className="text-red-500 mt-0.5 flex-shrink-0"
            />
            <p className="text-xs text-red-700">
              This will move the product entirely out of the current warehouse.
              It will no longer appear in this warehouse&apos;s inventory.
              Existing sales records will not be affected.
            </p>
          </div>
        )}
          </>
        )}
      </div>
    </FormDialog>
  );
};

export default TransferStockModal;
