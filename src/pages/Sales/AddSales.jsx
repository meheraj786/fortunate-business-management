import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  Package,
  User,
  Calendar,
  DollarSign,
  FileText,
  Tag,
  Hash,
  Home,
  Truck,
  PlusCircle,
  MinusCircle,
  Ruler,
} from "lucide-react";
import {
  warehouses,
  products as allProducts,
  categories,
  customers as allCustomers,
} from "../../data/data";

// Helper components
const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder = "",
  icon: Icon,
  min,
  step,
  disabled = false,
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        min={min}
        step={step}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003b75] focus:border-transparent transition-all duration-200 ${
          Icon ? "pl-10" : ""
        } ${disabled ? "bg-gray-100" : ""}`}
      />
    </div>
  </div>
);

const SelectField = ({
  label,
  value,
  onChange,
  options,
  required = false,
  icon: Icon,
  disabled = false,
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003b75] focus:border-transparent transition-all duration-200 ${
          Icon ? "pl-10" : ""
        } ${disabled ? "bg-gray-100" : ""}`}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const CustomerField = ({
  label,
  value,
  onChange,
  options,
  required = false,
  icon: Icon,
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder="Select or type a customer name"
        list="customer-list"
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003b75] focus:border-transparent transition-all duration-200 ${
          Icon ? "pl-10" : ""
        }`}
      />
      <datalist id="customer-list">
        {options.map((option) => (
          <option key={option.value} value={option.label} />
        ))}
      </datalist>
    </div>
  </div>
);

const TextAreaField = ({
  label,
  value,
  onChange,
  required = false,
  placeholder = "",
  rows = 3,
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003b75] focus:border-transparent transition-all duration-200 resize-vertical"
    />
  </div>
);

const AddSales = ({
  onClose,
  onSaleAdded,
  editData = null,
  isOpen = false,
}) => {
  const getInitialFormData = () => ({
    warehouseId: "",
    productId: "",
    categoryId: "",
    quantity: "",
    unit: "",
    pricePerUnit: "",
    customerName: "",
    saleDate: new Date().toISOString().split("T")[0],
    invoiceStatus: "Not Invoiced",
    deliveryCharge: "",
    otherCharges: [],
    discount: "",
    paymentStatus: "N/A",
    payments: [],
    notes: "",
  });

  const [formData, setFormData] = useState(getInitialFormData());

  const availableProducts = useMemo(() => {
    if (!formData.warehouseId) return [];
    let filtered = allProducts.filter(
      (p) => p.productLocation === parseInt(formData.warehouseId)
    );
    if (formData.categoryId) {
      filtered = filtered.filter(
        (p) =>
          p.category ===
          categories.find((c) => c.id === parseInt(formData.categoryId))?.name
      );
    }
    return filtered;
  }, [formData.warehouseId, formData.categoryId]);

  const totalAmount = useMemo(() => {
    const quantity = parseFloat(formData.quantity) || 0;
    const price = parseFloat(formData.pricePerUnit) || 0;
    return quantity * price;
  }, [formData.quantity, formData.pricePerUnit]);

  const totalAmountToBePaid = useMemo(() => {
    const delivery = parseFloat(formData.deliveryCharge) || 0;
    const others = formData.otherCharges.reduce(
      (acc, charge) => acc + (parseFloat(charge.amount) || 0),
      0
    );
    const discount = parseFloat(formData.discount) || 0;
    return totalAmount + delivery + others - discount;
  }, [
    totalAmount,
    formData.deliveryCharge,
    formData.otherCharges,
    formData.discount,
  ]);

  useEffect(() => {
    if (formData.invoiceStatus === "Not Invoiced") {
      setFormData((prev) => ({
        ...prev,
        paymentStatus: "N/A",
        payments: [],
      }));
    } else if (formData.invoiceStatus === "Invoiced") {
      setFormData((prev) => ({
        ...prev,
        paymentStatus: "Due Payment",
      }));
    }
  }, [formData.invoiceStatus]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (field === "productId" && value) {
      const product = allProducts.find((p) => p.id === parseInt(value));
      if (product) {
        setFormData((prev) => ({
          ...prev,
          unit: product.unit,
          pricePerUnit: product.unitPrice,
        }));
      }
    }
  };

  const handleAddCharge = () => {
    setFormData((prev) => ({
      ...prev,
      otherCharges: [...prev.otherCharges, { name: "", amount: "" }],
    }));
  };

  const handleRemoveCharge = (index) => {
    setFormData((prev) => ({
      ...prev,
      otherCharges: prev.otherCharges.filter((_, i) => i !== index),
    }));
  };

  const handleChargeChange = (index, field, value) => {
    const newCharges = [...formData.otherCharges];
    newCharges[index][field] = value;
    setFormData((prev) => ({ ...prev, otherCharges: newCharges }));
  };

  const handleAddPayment = () => {
    setFormData((prev) => ({
      ...prev,
      payments: [
        ...prev.payments,
        { amount: "", date: new Date().toISOString().split("T")[0] },
      ],
    }));
  };

  const handleRemovePayment = (index) => {
    setFormData((prev) => ({
      ...prev,
      payments: prev.payments.filter((_, i) => i !== index),
    }));
  };

  const handlePaymentChange = (index, field, value) => {
    const newPayments = [...formData.payments];
    newPayments[index][field] = value;
    setFormData((prev) => ({ ...prev, payments: newPayments }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaleAdded(formData);
  };

  const unitOptions = [
    { value: "pieces", label: "Pieces" },
    { value: "sheets", label: "Sheets" },
    { value: "plates", label: "Plates" },
    { value: "rolls", label: "Rolls" },
    { value: "coils", label: "Coils" },
    { value: "kg", label: "KG" },
    { value: "ton", label: "TON" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#003b75] text-white p-6 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <Package className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">
                    {editData ? "Edit Sale" : "Add New Sale"}
                  </h2>
                  <p className="text-blue-100 text-sm">
                    Enter the details of the sale.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-6 overflow-y-auto"
            >
              {/* Row 1: Warehouse, Category, Product */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SelectField
                  label="Warehouse"
                  value={formData.warehouseId}
                  onChange={(v) => handleInputChange("warehouseId", v)}
                  options={warehouses.map((w) => ({
                    value: w.id,
                    label: w.name,
                  }))}
                  required
                  icon={Home}
                />
                <SelectField
                  label="Category"
                  value={formData.categoryId}
                  onChange={(v) => handleInputChange("categoryId", v)}
                  options={categories.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  icon={Tag}
                />
                <SelectField
                  label="Product Name"
                  value={formData.productId}
                  onChange={(v) => handleInputChange("productId", v)}
                  options={availableProducts.map((p) => ({
                    value: p.id,
                    label: p.productName,
                  }))}
                  required
                  icon={Package}
                  disabled={!formData.warehouseId}
                />
              </div>

              {/* Row 2: Quantity, Unit, Price, Total */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <InputField
                  label="Quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(v) => handleInputChange("quantity", v)}
                  required
                  placeholder="0"
                  icon={Hash}
                />
                <SelectField
                  label="Select Unit"
                  value={formData.unit}
                  onChange={(v) => handleInputChange("unit", v)}
                  options={unitOptions}
                  required
                  icon={Ruler}
                />
                <InputField
                  label="Price Per Unit"
                  type="number"
                  value={formData.pricePerUnit}
                  onChange={(v) => handleInputChange("pricePerUnit", v)}
                  required
                  placeholder="0.00"
                  icon={DollarSign}
                  step="0.01"
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Total Amount
                  </label>
                  <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 h-10 flex items-center">
                    <p className="text-lg font-semibold text-gray-900">
                      ${totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 3: Customer and Sale Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomerField
                  label="Customer Name"
                  value={formData.customerName}
                  onChange={(v) => handleInputChange("customerName", v)}
                  options={allCustomers.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  required
                  icon={User}
                />
                <InputField
                  label="Sale Date"
                  type="date"
                  value={formData.saleDate}
                  onChange={(v) => handleInputChange("saleDate", v)}
                  required
                  icon={Calendar}
                />
              </div>

              {/* Row 4: Invoice Status and Charges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField
                  label="Invoice Status"
                  value={formData.invoiceStatus}
                  onChange={(v) => handleInputChange("invoiceStatus", v)}
                  options={[
                    { value: "Invoiced", label: "Invoiced" },
                    { value: "Not Invoiced", label: "Not Invoiced" },
                  ]}
                  required
                  icon={FileText}
                />
                <InputField
                  label="Delivery Charge"
                  type="number"
                  value={formData.deliveryCharge}
                  onChange={(v) => handleInputChange("deliveryCharge", v)}
                  placeholder="0.00"
                  icon={Truck}
                  step="0.01"
                />
              </div>

              {/* Other Charges */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other Charges
                </label>
                {formData.otherCharges.map((charge, index) => (
                  <div key={index} className="flex items-center gap-4 mb-2">
                    <InputField
                      label={`Charge Name ${index + 1}`}
                      value={charge.name}
                      onChange={(v) => handleChargeChange(index, "name", v)}
                      placeholder="e.g., Loading Charge"
                    />
                    <InputField
                      label="Amount"
                      type="number"
                      value={charge.amount}
                      onChange={(v) => handleChargeChange(index, "amount", v)}
                      placeholder="0.00"
                      step="0.01"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCharge(index)}
                      className="text-red-500 hover:text-red-700 mt-7"
                    >
                      <MinusCircle size={20} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddCharge}
                  className="flex items-center space-x-2 text-sm text-[#003b75] hover:text-blue-700"
                >
                  <PlusCircle size={16} />
                  <span>Add More Charges</span>
                </button>
              </div>

              {/* Row 5: Discount and Total to be Paid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <InputField
                  label="Discount"
                  type="number"
                  value={formData.discount}
                  onChange={(v) => handleInputChange("discount", v)}
                  placeholder="0.00"
                  icon={DollarSign}
                  step="0.01"
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Total Amount to be Paid
                  </label>
                  <div className="p-2 bg-blue-50 rounded-lg border border-blue-200 h-10 flex items-center">
                    <p className="text-xl font-bold text-[#003b75]">
                      ${totalAmountToBePaid.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Status - Conditional */}
              {formData.invoiceStatus === "Invoiced" && (
                <div className="p-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectField
                      label="Payment Status"
                      value={formData.paymentStatus}
                      onChange={(v) => handleInputChange("paymentStatus", v)}
                      options={[
                        { value: "Due Payment", label: "Due Payment" },
                        { value: "Paid Payment", label: "Paid Payment" },
                      ]}
                      required
                      icon={DollarSign}
                    />
                    {formData.paymentStatus === "Due Payment" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Partial Payments
                        </label>
                        {formData.payments.map((payment, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 mb-2"
                          >
                            <InputField
                              label={`Payment ${index + 1}`}
                              type="number"
                              value={payment.amount}
                              onChange={(v) =>
                                handlePaymentChange(index, "amount", v)
                              }
                              placeholder="0.00"
                              step="0.01"
                            />
                            <InputField
                              label="Date"
                              type="date"
                              value={payment.date}
                              onChange={(v) =>
                                handlePaymentChange(index, "date", v)
                              }
                            />
                            <button
                              type="button"
                              onClick={() => handleRemovePayment(index)}
                              className="text-red-500 hover:text-red-700 mt-7"
                            >
                              <MinusCircle size={20} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={handleAddPayment}
                          className="flex items-center space-x-2 text-sm text-[#003b75] hover:text-blue-700"
                        >
                          <PlusCircle size={16} />
                          <span>Add Partial Payment</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              <TextAreaField
                label="Additional Notes (Optional)"
                value={formData.notes}
                onChange={(v) => handleInputChange("notes", v)}
                placeholder="Any additional information about this sale..."
                rows={2}
              />

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center space-x-2"
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#003b75] text-white rounded-lg hover:bg-[#002a54] transition-colors font-medium flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>{editData ? "Update Sale" : "Save Sale"}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddSales;
