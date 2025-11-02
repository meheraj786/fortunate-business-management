import React, { useState, useEffect, useMemo, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Save,
  Package,
  User,
  Calendar,
  DollarSign,
  FileText,
  Hash,
  Home,
  Ruler,
} from "lucide-react";
import axios from "axios";
import { UrlContext } from "../../context/UrlContext";
import toast from "react-hot-toast";

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
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
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

const AddSales = ({
  onClose,
  onSaleAdded,
  editData = null,
  isOpen = false,
}) => {
  const getInitialFormData = () => ({
    warehouseId: "",
    productId: "",
    quantity: "",
    unit: "",
    pricePerUnit: "",
    customerId: "",
    lcNumber: "",
    saleDate: new Date().toISOString().split("T")[0],
    invoiceStatus: "Not Invoiced",
    discount: "",
    paymentStatus: "cash",
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const { baseUrl } = useContext(UrlContext);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, customersRes, warehousesRes] = await Promise.all([
          axios.get(`${baseUrl}product/get-all-product`),
          axios.get(`${baseUrl}customer/get-customers`),
          axios.get(`${baseUrl}warehouse/get-all-warehouse`),
        ]);

        setProducts(productsRes.data.data || []);
        setCustomers(customersRes.data.data || []);
        setWarehouses(warehousesRes.data.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [baseUrl, isOpen]);

  // Filter products by selected warehouse
  const availableProducts = useMemo(() => {
    if (!formData.warehouseId) return [];
    return products.filter((p) => p.warehouse?._id === formData.warehouseId);
  }, [products, formData.warehouseId]);

  const totalAmount = useMemo(() => {
    const quantity = parseFloat(formData.quantity) || 0;
    const price = parseFloat(formData.pricePerUnit) || 0;
    return quantity * price;
  }, [formData.quantity, formData.pricePerUnit]);

  const totalAmountToBePaid = useMemo(() => {
    const discount = parseFloat(formData.discount) || 0;
    return totalAmount - discount;
  }, [totalAmount, formData.discount]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-fill unit and price when product is selected
    if (field === "productId" && value) {
      const product = products.find((p) => p._id === value);
      if (product) {
        setFormData((prev) => ({
          ...prev,
          unit: product.unit || "",
          pricePerUnit: product.unitPrice || "",
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Show loading toast
      const loadingToast = toast.loading("Creating sale...");

      // Get selected product for additional details
      const selectedProduct = products.find(
        (p) => p._id === formData.productId
      );

      // Calculate due amount based on payment status
      const totalToPay = totalAmountToBePaid;
      const dueAmount = formData.paymentStatus === "due" ? totalToPay : 0;

      // Transform formData to match backend schema
      const salesData = {
        product: formData.productId,
        customer: formData.customerId,
        lcNumber: formData.lcNumber || undefined,
        quantity: parseFloat(formData.quantity),
        price: parseFloat(formData.pricePerUnit),
        discount: parseFloat(formData.discount) || 0,
        due: dueAmount,
        paymentStatus: formData.paymentStatus,
        unit: formData.unit,
        category: selectedProduct?.category || "",
        size: selectedProduct?.size || "",
        invoiceStatus: formData.invoiceStatus === "Invoiced" ? "yes" : "no",
        date: new Date(formData.saleDate),
      };

      const response = await axios.post(
        `${baseUrl}sales/create-sales`,
        salesData
      );

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (response.data) {
        toast.success("Sale created successfully!");
        onSaleAdded(response.data);
        setFormData(getInitialFormData()); // Reset form
        onClose();
      }
    } catch (error) {
      console.error("Error creating sale:", error);
      toast.error(error.response?.data?.message || "Failed to create sale");
    }
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

  const paymentStatusOptions = [
    { value: "cash", label: "Cash" },
    { value: "bank", label: "Bank Transfer" },
    { value: "mobile-banking", label: "Mobile Banking" },
    { value: "due", label: "Due Payment" },
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
              {/* Row 1: Warehouse and Product */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField
                  label="Warehouse"
                  value={formData.warehouseId}
                  onChange={(v) => handleInputChange("warehouseId", v)}
                  options={warehouses.map((w) => ({
                    value: w._id,
                    label: `${w.name} - ${w.location}`,
                  }))}
                  required
                  icon={Home}
                />
                <SelectField
                  label="Product Name"
                  value={formData.productId}
                  onChange={(v) => handleInputChange("productId", v)}
                  options={availableProducts.map((p) => ({
                    value: p._id,
                    label: `${p.name} (${p.quantity} ${p.unit} available)`,
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
                  min="0"
                  step="0.01"
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
                  min="0"
                  step="0.01"
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Total Amount
                  </label>
                  <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 h-10 flex items-center">
                    <p className="text-lg font-semibold text-gray-900">
                      ৳{totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 3: Customer, Sale Date, and LC Number */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SelectField
                  label="Customer Name"
                  value={formData.customerId}
                  onChange={(v) => handleInputChange("customerId", v)}
                  options={customers.map((c) => ({
                    value: c._id,
                    label: `${c.name} - ${c.location}`,
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
                <InputField
                  label="LC Number (Optional)"
                  value={formData.lcNumber}
                  onChange={(v) => handleInputChange("lcNumber", v)}
                  placeholder="Enter LC Number"
                  icon={FileText}
                />
              </div>

              {/* Row 4: Invoice Status and Payment Status */}
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
                <SelectField
                  label="Payment Status"
                  value={formData.paymentStatus}
                  onChange={(v) => handleInputChange("paymentStatus", v)}
                  options={paymentStatusOptions}
                  required
                  icon={DollarSign}
                />
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
                  min="0"
                  step="0.01"
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Total Amount to be Paid
                  </label>
                  <div className="p-2 bg-blue-50 rounded-lg border border-blue-200 h-10 flex items-center">
                    <p className="text-xl font-bold text-[#003b75]">
                      ৳{totalAmountToBePaid.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Due Amount Display */}
              {formData.paymentStatus === "due" && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Due Amount:</strong> ৳
                    {totalAmountToBePaid.toFixed(2)}
                  </p>
                </div>
              )}

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
