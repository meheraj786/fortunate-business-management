import React, { useState, useCallback } from "react";
import { Package, Tag, Ruler, Hash, DollarSign, Plus, Trash2, ShoppingCart, Lock, AlertTriangle } from "lucide-react";
import { Controller } from "react-hook-form";
import SelectField from "@/components/ui/SelectField";
import ComboboxField from "@/components/ui/ComboboxField";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import { searchProducts } from "@/api/product.api";

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
  isItemsLocked = false,
  canAddItem = true,
  canDeleteItem = true,
  invoiceStatus,
}) => {
  const watchedWarehouseId = watch("warehouseId");

  // Local state for the "Add Item" section
  const [newItem, setNewItem] = useState({
    productId: "",
    quantity: "",
    unit: "",
    pricePerUnit: "",
  });
  const [addItemError, setAddItemError] = useState("");

  const handleWarehouseChange = (warehouseId) => {
    setValue("warehouseId", warehouseId);
    setValue("categoryId", "");
    // Clear items when warehouse changes? Maybe better to warn, but for now let's clear to ensure consistency
    // Actually, simply clearing the "Add Item" form is enough. 
    // If the user changes warehouse, the products list updates, so existing items might become invalid if they are not in the new warehouse.
    // But we leave that to the user to manage for now or the validation will catch it.
    setNewItem({ productId: "", quantity: "", unit: "", pricePerUnit: "" });
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

      if (requestQtyInBase > stockInBase) {
        const maxQtyInSelectedUnit = stockInBase / conversionFactor;
        const productUnitName = (typeof productUnit === "object" ? productUnit?.name : "Base Unit") || "Base Unit";
        setAddItemError(`Exceeds stock. Max: ${maxQtyInSelectedUnit.toFixed(2)} ${selectedUnit?.name || "units"} (Stock: ${product.quantity} ${productUnitName})`);
        return;
      }
    }

    append({
      productId,
      quantity,
      unit,
      pricePerUnit,
      // Store simplified details for display so we don't need complex lookups later
      total: parseFloat(quantity) * parseFloat(pricePerUnit)
    });

    // Reset new item form
    setNewItem({
      productId: "",
      quantity: "",
      unit: "",
      pricePerUnit: ""
    });
  };

  // Helper to get name for display in list
  const getProductName = (id) => {
    // Try to find in current products list
    const p = products.find(prod => prod._id === id);
    if (p) return p.name;
    // If not found (e.g. mixed category or edit mode initial load), we might need another way.
    // For now, if not found, show ID or "Unknown Product"
    // Note: In edit mode, we might want to pre-load specific product details if they aren't in the list?
    // Since we rely on global category filter, edited items from same category will be found.
    return p ? p.name : "Product";
  };

  const getUnitName = (id) => {
    const u = units.find(unit => unit._id === id);
    return u ? u.name : "Unit";
  };

  // Whether to show the action column (hide when locked, show otherwise)
  const showActionColumn = !isItemsLocked;
  const totalColumns = showActionColumn ? 6 : 5;

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

      {/* Add Item Section — hidden when locked */}
      {!isItemsLocked && (
      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 space-y-3 sm:space-y-4">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
          <ShoppingCart size={16} /> Add Items
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3 sm:gap-4">
          <div className="col-span-2 md:col-span-3">
            <ComboboxField
              label="Product"
              name="newItemProductId"
              value={newItem.productId}
              fetchOptions={async (q) => {
                if (!watchedWarehouseId) return [];
                try {
                  const res = await searchProducts(watchedWarehouseId, q, watch("categoryId"));
                  return (res.data?.data || []).map((p) => ({
                    value: p._id,
                    label: `${p.name} (Qty: ${p.quantity})`,
                  }));
                } catch {
                  return [];
                }
              }}
              icon={Package}
              disabled={!watchedWarehouseId || productsLoading || !canAddItem}
              loading={productsLoading}
              placeholder="Search products..."
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
              title={!canAddItem ? "You don't have permission to add items" : "Add item"}
            >
              <Plus size={18} />
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
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate flex-1">
                    {getProductName(item.productId)}
                  </p>
                  {showActionColumn && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className={`flex-shrink-0 p-1 rounded transition-colors ${
                        canDeleteItem
                          ? 'text-red-500 hover:bg-red-50 active:bg-red-100'
                          : 'text-gray-300 cursor-not-allowed'
                      }`}
                      disabled={!canDeleteItem}
                      title={!canDeleteItem ? "You don't have permission to remove items" : "Remove item"}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500 block">Qty</span>
                    <span className="font-medium text-gray-900">{item.quantity}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Unit</span>
                    <span className="font-medium text-gray-900">{getUnitName(item.unit)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Price</span>
                    <span className="font-medium text-gray-900">{item.pricePerUnit}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Total</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {(parseFloat(item.quantity) * parseFloat(item.pricePerUnit)).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
            {/* Mobile Subtotal */}
            <div className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg p-3">
              <span className="text-sm font-medium text-gray-700">Subtotal</span>
              <span className="text-sm font-bold text-[var(--color-primary)]">{formattedTotalAmount}</span>
            </div>
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  {showActionColumn && (
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fields.map((item, index) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{getProductName(item.productId)}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{getUnitName(item.unit)}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.pricePerUnit}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{(parseFloat(item.quantity) * parseFloat(item.pricePerUnit)).toFixed(2)}</td>
                    {showActionColumn && (
                      <td className="px-4 py-2 text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => remove(index)}
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
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={totalColumns - 1} className="px-4 py-3 text-right text-sm font-medium text-gray-700">Subtotal</td>
                  <td className="px-4 py-3 text-sm font-bold text-[var(--color-primary)]">{formattedTotalAmount}</td>
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
