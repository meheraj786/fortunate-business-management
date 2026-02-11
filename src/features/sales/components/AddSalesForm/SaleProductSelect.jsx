import React, { useState, useEffect } from "react";
import { Package, Tag, Ruler, Hash, DollarSign, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Controller } from "react-hook-form";
import SelectField from "@/components/ui/SelectField";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/button"; // Assuming Button component exists

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

  return (
    <div className="space-y-6">
      {/* Global Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          name="warehouseId"
          control={control}
          rules={{ required: "Warehouse is required" }}
          render={({ field }) => (
            <SelectField
              label="Warehouse"
              name="warehouseId"
              required={true}
              value={field.value}
              error={errors.warehouseId?.message}
              options={warehouses.map((w) => ({
                value: w._id,
                label: w.name,
              }))}
              icon={Package}
              disabled={isEditMode || isInitialLoading || fields.length > 0} // Disable if items added to prevent inconsistency
              onChange={(e) => {
                field.onChange(e);
                handleWarehouseChange(e.target.value);
              }}
            />
          )}
        />

        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <SelectField
              label="Category Filter (Optional)"
              name="categoryId"
              value={field.value}
              error={errors.categoryId?.message}
              options={[
                { value: "", label: "All Categories" },
                ...categories.map((c) => ({
                  value: c._id,
                  label: c.name,
                }))
              ]}
              icon={Tag}
              disabled={!watchedWarehouseId || productsLoading}
              onChange={(e) => {
                field.onChange(e);
                setValue("productId", "");
              }}
            />
          )}
        />
      </div>

      {/* Add Item Section */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <ShoppingCart size={16} /> Add Items
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <SelectField
              label="Product"
              name="newItemProductId"
              value={newItem.productId}
              options={products.map((p) => ({
                value: p._id,
                label: `${p.name} (Qty: ${p.quantity})`,
              }))}
              icon={Package}
              disabled={!watchedWarehouseId || productsLoading}
              loading={productsLoading}
              onChange={(e) => handleProductChange(e.target.value)}
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
            />
          </div>
          <div>
            <SelectField
              label="Unit"
              name="newItemUnit"
              value={newItem.unit}
              options={units.map((u) => ({ value: u._id, label: u.name }))}
              icon={Ruler}
              onChange={(e) => handleUnitChange(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-grow">
              <InputField
                label="Price"
                name="newItemPrice"
                type="number"
                step="any"
                value={newItem.pricePerUnit}
                onChange={(e) => setNewItem({ ...newItem, pricePerUnit: e.target.value })}
                icon={DollarSign}
              />
            </div>
            <Button
              type="button"
              onClick={handleAddItem}
              className="mb-[2px]"
            >
              <Plus size={18} />
            </Button>
          </div>
        </div>
        {addItemError && <p className="text-sm text-red-500">{addItemError}</p>}
      </div>

      {/* Items List */}
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {fields.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-4 text-center text-sm text-gray-500">No items added yet.</td>
              </tr>
            ) : (
              fields.map((item, index) => (
                <tr key={item.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{getProductName(item.productId)}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{getUnitName(item.unit)}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{item.pricePerUnit}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{(parseFloat(item.quantity) * parseFloat(item.pricePerUnit)).toFixed(2)}</td>
                  <td className="px-4 py-2 text-right text-sm font-medium">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan="4" className="px-4 py-3 text-right text-sm font-medium text-gray-700">Subtotal</td>
              <td className="px-4 py-3 text-sm font-bold text-[var(--color-primary)]">{formattedTotalAmount}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      {/* Hidden input to ensure 'items' is registered with validation rules if needed */}
      <input type="hidden" {...register("items", { validate: (val) => val && val.length > 0 || "At least one item is required" })} />
      {errors.items && <p className="text-sm text-red-500 mt-1">{errors.items.message}</p>}
    </div>
  );
};

export default SaleProductSelect;
