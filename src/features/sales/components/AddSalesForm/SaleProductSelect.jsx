import React, { useState, useCallback, useRef, useMemo } from "react";
import { Package, Tag, Ruler, Hash, DollarSign, Plus, Trash2, ShoppingCart, Lock, AlertTriangle, Pencil, Check, X } from "lucide-react";
import { Controller } from "react-hook-form";
import SelectField from "@/components/ui/SelectField";
import ComboboxField from "@/components/ui/ComboboxField";

import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import { useSettings } from "@/context/SettingsContext";


const SaleProductSelect = ({
  register,
  errors,
  control,
  setValue,
  watch,
  warehouses,
  categories,
  products,
  units,
  isEditMode,
  isInitialLoading,
  formattedTotalAmount,
  productsLoading,
  fields,
  append,
  remove,
  update,
  isItemsLocked = false,
  canAddItem = true,
  canDeleteItem = true,
  invoiceStatus,
}) => {
  const { formatCurrency } = useSettings();
  const watchedWarehouseId = watch("warehouseId");

  // Local state for the "Add Item" / "Edit Item" section
  const [newItem, setNewItem] = useState({
    productId: "",
    quantity: "",
    unit: "",
    pricePerUnit: "",
  });
  const [addItemError, setAddItemError] = useState("");

  // ── Edit Mode State ──
  // When editingIndex is not null, the "Add Items" section becomes "Edit Item"
  const [editingIndex, setEditingIndex] = useState(null);
  const editSectionRef = useRef(null);

  const handleWarehouseChange = (warehouseId) => {
    setValue("warehouseId", warehouseId);
    setValue("categoryId", "");
    setNewItem({ productId: "", quantity: "", unit: "", pricePerUnit: "" });
    // Cancel any active editing when warehouse changes
    setEditingIndex(null);
  };

  const handleProductChange = (productId) => {
    const product = products.find((p) => p._id === productId);
    if (product) {
      const price = product.unitPrice ?? "";
      const unit = product.unit?._id || "";

      setNewItem(prev => ({
        ...prev,
        productId,
        unit,
        pricePerUnit: price
      }));
    } else {
      setNewItem(prev => ({ ...prev, productId }));
    }
  };

  const handleUnitChange = (unitId) => {
    const product = products.find((p) => p._id === newItem.productId);
    const selectedUnit = units.find((u) => u._id === unitId);

    if (
      product &&
      selectedUnit &&
      product.unit?.conversionFactor &&
      selectedUnit.conversionFactor
    ) {
      const pricePerBaseUnit =
        product.unitPrice / product.unit.conversionFactor;
      const newPriceForSale = pricePerBaseUnit * selectedUnit.conversionFactor;

      setNewItem(prev => ({
        ...prev,
        unit: unitId,
        pricePerUnit: newPriceForSale.toFixed(2)
      }));
    } else {
      setNewItem(prev => ({ ...prev, unit: unitId }));
    }
  };

  // ── Dual-purpose handler: Add new item OR Save edited item ──
  const handleAddItem = () => {
    setAddItemError("");
    const { productId, quantity, unit, pricePerUnit } = newItem;

    if (!productId || !quantity || !unit || !pricePerUnit) {
      setAddItemError("All fields are required to add an item.");
      return;
    }

    // Stock Validation
    const product = products.find(p => p._id === productId);
    const selectedUnit = units.find(u => u._id === unit);

    if (product) {
      const requestQty = parseFloat(quantity);
      const conversionFactor = selectedUnit?.conversionFactor || 1;
      const requestQtyInBase = requestQty * conversionFactor;

      const productUnit = product.unit;
      const productConversionFactor = (typeof productUnit === "object" ? productUnit?.conversionFactor : 1) || 1;
      const stockInBase = product.quantity * productConversionFactor;

      // When editing, add back the original item's base quantity to available stock
      // because that quantity hasn't left the warehouse yet (it's the same sale)
      let availableStockInBase = stockInBase;
      if (editingIndex !== null) {
        const originalItem = fields[editingIndex];
        if (originalItem && originalItem.productId === productId) {
          const originalUnit = units.find(u => u._id === originalItem.unit);
          const originalConversion = originalUnit?.conversionFactor || 1;
          availableStockInBase += parseFloat(originalItem.quantity) * originalConversion;
        }
      }

      if (requestQtyInBase > availableStockInBase) {
        const maxQtyInSelectedUnit = availableStockInBase / conversionFactor;
        const productUnitName = (typeof productUnit === "object" ? productUnit?.name : "Base Unit") || "Base Unit";
        setAddItemError(`Exceeds stock. Max: ${maxQtyInSelectedUnit.toFixed(2)} ${selectedUnit?.name || "units"} (Stock: ${product.quantity} ${productUnitName})`);
        return;
      }
    }

    const itemData = {
      productId,
      quantity,
      unit,
      pricePerUnit,
      total: parseFloat(quantity) * parseFloat(pricePerUnit)
    };

    if (editingIndex !== null) {
      // Save edited item
      update(editingIndex, itemData);
      setEditingIndex(null);
    } else {
      // Add new item
      append(itemData);
    }

    // Reset new item form
    setNewItem({
      productId: "",
      quantity: "",
      unit: "",
      pricePerUnit: ""
    });
  };

  // ── Start editing an item ──
  const handleStartEdit = (index) => {
    const item = fields[index];
    setAddItemError("");

    // Clear category filter so the edited product is visible in the dropdown
    // (it may be from a different category than the current filter)
    setValue("categoryId", "");

    setNewItem({
      productId: item.productId || "",
      quantity: String(item.quantity ?? ""),
      unit: item.unit || "",
      pricePerUnit: String(item.pricePerUnit ?? ""),
    });
    setEditingIndex(index);

    // Scroll to the edit section
    setTimeout(() => {
      editSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  };

  // ── Cancel editing ──
  const handleCancelEdit = () => {
    setNewItem({ productId: "", quantity: "", unit: "", pricePerUnit: "" });
    setEditingIndex(null);
    setAddItemError("");
  };

  // ── Remove item (with editing-index safety) ──
  const handleRemoveItem = (index) => {
    // If deleting the item currently being edited, cancel the edit
    if (editingIndex === index) {
      handleCancelEdit();
    } else if (editingIndex !== null && index < editingIndex) {
      // Adjust editing index since an item before it was removed
      setEditingIndex(prev => prev - 1);
    }
    remove(index);
  };

  // Helper to get name for display in list
  const getProductName = (id) => {
    const p = products.find(prod => prod._id === id);
    if (p) return p.name;
    return p ? p.name : "Product";
  };

  const getUnitName = (id) => {
    const u = units.find(unit => unit._id === id);
    return u ? u.name : "Unit";
  };

  // Group and format total quantities cleanly by unit type
  const formattedTotalQuantities = useMemo(() => {
    if (!fields || fields.length === 0 || !units || units.length === 0) return "";

    const totalsByType = {};

    fields.forEach((item) => {
      const selectedUnit = units.find((u) => u._id === item.unit);
      if (selectedUnit) {
        const type = selectedUnit.type;
        const baseQty = parseFloat(item.quantity) * selectedUnit.conversionFactor;

        if (!totalsByType[type]) {
          totalsByType[type] = 0;
        }
        totalsByType[type] += baseQty;
      }
    });

    const displayStrings = [];

    for (const [type, totalBase] of Object.entries(totalsByType)) {
      if (totalBase === 0) continue;

      const typeUnits = units
        .filter((u) => u.type === type)
        .sort((a, b) => a.conversionFactor - b.conversionFactor);

      if (typeUnits.length === 0) continue;

      let bestUnit = typeUnits[0];

      for (const unit of typeUnits) {
        if (totalBase >= unit.conversionFactor) {
          bestUnit = unit;
        }
      }

      const convertedValue = totalBase / bestUnit.conversionFactor;
      // Strip trailing zeros neatly up to 3 decimal places
      const formattedValue = parseFloat(convertedValue.toFixed(3)).toString();

      displayStrings.push(`${formattedValue} ${bestUnit.name}`);
    }

    return displayStrings.join(" + ");
  }, [fields, units]);

  // Whether to show the action column (hide when locked, show otherwise)
  const showActionColumn = !isItemsLocked;
  const totalColumns = showActionColumn ? 5 : 4;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Global Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <SelectField
          name="warehouseId"
          control={control}
          validation={{ required: "Warehouse is required" }}
          label="Warehouse"
          required={true}
          error={errors.warehouseId?.message}
          options={warehouses.map((w) => ({
            value: w._id,
            label: w.name,
          }))}
          icon={Package}
          disabled={isEditMode || isInitialLoading || fields.length > 0}
          onChange={(val) => {
            handleWarehouseChange(val);
          }}
        />

        <SelectField
          name="categoryId"
          control={control}
          label="Category Filter (Optional)"
          error={errors.categoryId?.message}
          options={[
            { value: "", label: "All Categories" },
            ...categories.map((c) => ({
              value: c._id,
              label: c.name,
            }))
          ]}
          icon={Tag}
          disabled={!watchedWarehouseId || productsLoading || isItemsLocked}
          onChange={() => {
            setValue("productId", "");
          }}
        />
      </div>

      {/* Lock Banner for Invoiced/Cancelled Sales */}
      {isItemsLocked && (
        <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
          <Lock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold">
              Items are locked
            </p>
            <p className="text-[10px] sm:text-xs mt-0.5 leading-tight">
              {invoiceStatus === 'Invoiced'
                ? 'This sale has been invoiced. Items cannot be added, removed, or modified.'
                : 'This sale has been cancelled. Items cannot be modified.'}
            </p>
          </div>
        </div>
      )}

      {/* Add / Edit Item Section — hidden when locked */}
      {!isItemsLocked && (
      <div ref={editSectionRef} className={`p-3 sm:p-4 rounded-lg border space-y-3 sm:space-y-4 ${
        editingIndex !== null
          ? 'bg-blue-50/50 border-blue-300'
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
            {editingIndex !== null ? (
              <>
                <Pencil size={16} /> Edit Item
              </>
            ) : (
              <>
                <ShoppingCart size={16} /> Add Items
              </>
            )}
          </h3>
          {editingIndex !== null && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
            >
              <X size={14} /> Cancel
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3 sm:gap-4">
          <div className="col-span-2 md:col-span-3">
            <ComboboxField
              label="Product"
              name="newItemProductId"
              value={newItem.productId}
              options={products.map((p) => ({
                value: p._id,
                label: `${p.name} (Qty: ${p.quantity})`,
              }))}
              icon={Package}
              disabled={!watchedWarehouseId || productsLoading || !canAddItem}
              loading={productsLoading}
              placeholder="Search product..."
              onChange={(val) => handleProductChange(val)}
            />
          </div>
          <div>
            <InputField
              label="Quantity"
              name="newItemQuantity"
              type="number"
              step="any"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              icon={Hash}
              disabled={!canAddItem}
            />
          </div>
          <div>
            <SelectField
              label="Unit"
              name="newItemUnit"
              value={newItem.unit}
              options={units.map((u) => ({ value: u._id, label: u.name }))}
              icon={Ruler}
              onChange={(val) => handleUnitChange(val)}
              disabled={!canAddItem}
            />
          </div>
          <div className="col-span-2 flex items-end gap-2">
            <div className="flex-grow">
              <InputField
                label="Price"
                name="newItemPrice"
                type="number"
                step="any"
                value={newItem.pricePerUnit}
                onChange={(e) => setNewItem({ ...newItem, pricePerUnit: e.target.value })}
                icon={DollarSign}
                disabled={!canAddItem}
              />
            </div>
            <Button
              type="button"
              onClick={handleAddItem}
              className="mb-[2px]"
              disabled={!canAddItem}
              title={editingIndex !== null ? "Save changes" : "Add item"}
            >
              {editingIndex !== null ? <Check size={18} /> : <Plus size={18} />}
            </Button>
          </div>
        </div>
        {!canAddItem && isEditMode && (
          <p className="text-[10px] sm:text-xs text-amber-600 flex items-center gap-1">
            <AlertTriangle size={12} /> You don't have permission to add items to this sale.
          </p>
        )}
        {addItemError && <p className="text-xs sm:text-sm text-red-500">{addItemError}</p>}
      </div>
      )}

      {/* Items List — Mobile: Card layout, Desktop: Table layout */}
      {fields.length === 0 ? (
        <div className="border border-gray-200 rounded-lg p-4 sm:p-6 text-center text-xs sm:text-sm text-gray-500">
          {isItemsLocked ? "No items in this sale." : "No items added yet."}
        </div>
      ) : (
        <>
          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-3">
            {fields.map((item, index) => (
              <div
                key={item.id}
                className={`bg-white border rounded-lg p-3 space-y-2 transition-colors ${
                  editingIndex === index
                    ? 'border-blue-400 ring-1 ring-blue-200'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate flex-1">
                    {getProductName(item.productId)}
                  </p>
                  {showActionColumn && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(index)}
                        className={`p-1 rounded transition-colors ${
                          canAddItem && editingIndex !== index
                            ? 'text-blue-500 hover:bg-blue-50 active:bg-blue-100'
                            : editingIndex === index
                              ? 'text-blue-600 bg-blue-100'
                              : 'text-gray-300 cursor-not-allowed'
                        }`}
                        disabled={!canAddItem || editingIndex === index}
                        title={
                          editingIndex === index
                            ? "Currently editing this item"
                            : !canAddItem
                              ? "You don't have permission to edit items"
                              : "Edit item"
                        }
                      >
                        <Pencil size={15} />
                      </button>
                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className={`p-1 rounded transition-colors ${
                          canDeleteItem
                            ? 'text-red-500 hover:bg-red-50 active:bg-red-100'
                            : 'text-gray-300 cursor-not-allowed'
                        }`}
                        disabled={!canDeleteItem}
                        title={!canDeleteItem ? "You don't have permission to remove items" : "Remove item"}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500 block">Qty</span>
                    <span className="font-medium text-gray-900">{item.quantity} {getUnitName(item.unit)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Price</span>
                    <span className="font-medium text-gray-900">{formatCurrency(item.pricePerUnit)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Total</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(parseFloat(item.quantity) * parseFloat(item.pricePerUnit))}
                  </span>
                </div>
              </div>
            ))}
            {/* Mobile Subtotal */}
            <div className="flex flex-col gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200 border-dashed">
                <span className="text-sm font-medium text-gray-500">Total Qty</span>
                <span className="text-sm font-bold text-gray-800">{formattedTotalQuantities || "0"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Subtotal</span>
                <span className="text-sm font-bold text-[var(--color-primary)]">{formattedTotalAmount}</span>
              </div>
            </div>
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  {showActionColumn && (
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fields.map((item, index) => (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      editingIndex === index ? 'bg-blue-50/60' : ''
                    }`}
                  >
                    <td className="px-4 py-2 text-sm text-gray-900">{getProductName(item.productId)}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.quantity} {getUnitName(item.unit)}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(item.pricePerUnit)}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(parseFloat(item.quantity) * parseFloat(item.pricePerUnit))}</td>
                    {showActionColumn && (
                      <td className="px-4 py-2 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleStartEdit(index)}
                            className={`transition-colors ${
                              canAddItem && editingIndex !== index
                                ? 'text-blue-600 hover:text-blue-900'
                                : editingIndex === index
                                  ? 'text-blue-400 cursor-default'
                                  : 'text-gray-300 cursor-not-allowed'
                            }`}
                            disabled={!canAddItem || editingIndex === index}
                            title={
                              editingIndex === index
                                ? "Currently editing this item"
                                : !canAddItem
                                  ? "You don't have permission to edit items"
                                  : "Edit item"
                            }
                          >
                            <Pencil size={16} />
                          </button>
                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className={`transition-colors ${
                              canDeleteItem
                                ? 'text-red-600 hover:text-red-900'
                                : 'text-gray-300 cursor-not-allowed'
                            }`}
                            disabled={!canDeleteItem}
                            title={!canDeleteItem ? "You don't have permission to remove items" : "Remove item"}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-right text-sm text-gray-600">
                    <span className="font-medium mr-2">Total Qty:</span> {formattedTotalQuantities || "0"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-700">Subtotal</td>
                  <td className="px-4 py-3 text-sm font-bold text-[var(--color-primary)]">{formattedTotalAmount}</td>
                  {showActionColumn && <td></td>}
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      {/* Hidden input to ensure 'items' is registered with validation rules if needed */}
      <input type="hidden" {...register("items", { validate: (val) => val && val.length > 0 || "At least one item is required" })} />
      {errors.items && <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.items.message}</p>}
    </div>
  );
};

export default SaleProductSelect;
