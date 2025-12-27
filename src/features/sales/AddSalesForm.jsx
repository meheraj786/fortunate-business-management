import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
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
import api from "@/services/apiService";
import toast from "react-hot-toast";
import FormHeader from "@/components/ui/FormHeader";
import FormActions from "@/components/ui/FormActions";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import TextAreaField from "@/components/ui/TextAreaField";

const AddSales = ({
  onClose,
  onSaleAdded,
  editData = null,
  isOpen = false,
}) => {
  const isEditMode = !!editData;

  // Initial form state
  const initialFormData = useMemo(
    () => ({
      warehouseId: "",
      productId: "",
      categoryId: "",
      quantity: "",
      unit: "",
      pricePerUnit: "",
      customerType: "existing",
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      saleDate: new Date().toISOString().split("T")[0],
      invoiceStatus: "Not-invoiced",
      deliveryCharge: "",
      otherCharges: [],
      discount: "",
      paymentStatus: "",
      payments: [],
      notes: "",
    }),
    []
  );

  const [formData, setFormData] = useState(initialFormData);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all initial data
  const fetchInitialData = useCallback(async () => {
    if (!isOpen) return;

    setLoading(true);
    try {
      const [
        customersRes,
        warehousesRes,
        categoriesRes,
        accountsRes,
        unitsRes,
      ] = await Promise.all([
        api.get(`/customer/get-customers`),
        api.get(`/warehouse/`),
        api.get(`/category/get`),
        api.get(`/account/get-all-accounts`),
        api.get(`/unit/get`),
      ]);

      setCustomers(customersRes.data.data || []);
      setWarehouses(warehousesRes.data.data.warehouses || []);
      setCategories(categoriesRes.data.data || []);
      setAccounts(accountsRes.data.data || []);
      setUnits(unitsRes.data.data || []);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  }, [isOpen]);

  // Fetch products for selected warehouse
  const fetchProducts = useCallback(async (warehouseId) => {
    if (!warehouseId) {
      setProducts([]);
      return;
    }

    try {
      const res = await api.get(`/warehouse/${warehouseId}/products`, {
        params: { limit: 10000 },
      });
      setProducts(res.data.data.docs || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
      setProducts([]);
    }
  }, []);

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen, fetchInitialData]);

  // Set edit data when in edit mode
  useEffect(() => {
    if (isEditMode && isOpen) {
      const populateFormData = async () => {
        const editFormData = {
          warehouseId: editData.warehouse?._id || "",
          productId: editData.product?._id || "",
          categoryId: editData.category?._id || "",
          quantity: editData.quantity || "",
          unit: editData.unit?._id || editData.unit || "",
          pricePerUnit: editData.pricePerUnit || "",
          customerType: editData.customer?.customerId ? "existing" : "manual",
          customerName: editData.customer?.name || "",
          customerPhone: editData.customer?.phone || "",
          customerAddress: editData.customer?.address || "",
          saleDate: new Date(editData.saleDate).toISOString().split("T")[0],
          invoiceStatus: editData.invoiceStatus || "Not-invoiced",
          deliveryCharge: editData.deliveryCharge || "",
          otherCharges: editData.otherCharges || [],
          discount: editData.discount || "",
          paymentStatus: editData.paymentStatus || "",
          payments:
            editData.payments?.map((p) => ({
              ...p,
              date: new Date(p.date).toISOString().split("T")[0],
              account: p.account?._id || "",
            })) || [],
          notes: editData.notes || "",
        };

        setFormData(editFormData);

        // Fetch products for the warehouse in edit mode
        if (editData.warehouse?._id) {
          await fetchProducts(editData.warehouse._id);
        }
      };

      populateFormData();
    } else if (!isEditMode && isOpen) {
      setFormData(initialFormData);
    }
  }, [isEditMode, isOpen, editData, fetchProducts, initialFormData]);

  // Handle warehouse change
  const handleWarehouseChange = useCallback(
    async (warehouseId) => {
      setFormData((prev) => ({
        ...prev,
        warehouseId,
        productId: "",
        categoryId: "",
        quantity: "",
        unit: "",
        pricePerUnit: "",
      }));

      await fetchProducts(warehouseId);
    },
    [fetchProducts]
  );

  // Handle product change
  const handleProductChange = useCallback(
    (productId) => {
      const product = products.find((p) => p._id === productId);
      if (product) {
        setFormData((prev) => ({
          ...prev,
          productId,
          unit: product.unit?._id || "",
          pricePerUnit: product.unitPrice || "",
          categoryId: product.category?._id || "",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          productId,
          unit: "",
          pricePerUnit: "",
        }));
      }
    },
    [products]
  );

  // Handle unit change
  const handleUnitChange = useCallback(
    (unitId) => {
      const product = products.find((p) => p._id === formData.productId);
      const selectedUnit = units.find((u) => u._id === unitId);

      if (
        product &&
        selectedUnit &&
        product.unit?.conversionFactor &&
        selectedUnit.conversionFactor
      ) {
        const pricePerBaseUnit =
          product.unitPrice / product.unit.conversionFactor;
        const newPriceForSale =
          pricePerBaseUnit * selectedUnit.conversionFactor;

        setFormData((prev) => ({
          ...prev,
          unit: unitId,
          pricePerUnit: newPriceForSale.toFixed(2),
        }));
      } else {
        setFormData((prev) => ({ ...prev, unit: unitId }));
      }
    },
    [products, units, formData.productId]
  );

  // Calculate totals
  const { totalAmount, totalAmountToBePaid } = useMemo(() => {
    const quantity = parseFloat(formData.quantity) || 0;
    const pricePerUnit = parseFloat(formData.pricePerUnit) || 0;
    const total = quantity * pricePerUnit;

    const delivery = parseFloat(formData.deliveryCharge) || 0;
    const others = formData.otherCharges.reduce(
      (acc, charge) => acc + (parseFloat(charge.amount) || 0),
      0
    );
    const discount = parseFloat(formData.discount) || 0;

    return {
      totalAmount: total,
      totalAmountToBePaid: total + delivery + others - discount,
    };
  }, [
    formData.quantity,
    formData.pricePerUnit,
    formData.deliveryCharge,
    formData.otherCharges,
    formData.discount,
  ]);

  // Handle invoice status change
  const handleInvoiceStatusChange = useCallback((status) => {
    if (status === "Not-invoiced") {
      setFormData((prev) => ({
        ...prev,
        invoiceStatus: status,
        paymentStatus: "",
        payments: [],
      }));
    } else if (status === "Invoiced") {
      setFormData((prev) => ({
        ...prev,
        invoiceStatus: status,
        paymentStatus: "Due payment",
      }));
    }
  }, []);

  // Handle payment status change
  const handlePaymentStatusChange = useCallback(
    (status) => {
      if (status === "Paid payment") {
        setFormData((prev) => ({
          ...prev,
          paymentStatus: status,
          payments: [
            {
              amount: totalAmountToBePaid.toFixed(2),
              date: new Date().toISOString().split("T")[0],
              method: "",
              account: "",
            },
          ],
        }));
      } else if (status === "Due payment") {
        setFormData((prev) => ({
          ...prev,
          paymentStatus: status,
          payments: [],
        }));
      }
    },
    [totalAmountToBePaid]
  );

  // Generic input change handler
  const handleInputChange = useCallback(
    (field, value) => {
      switch (field) {
        case "warehouseId":
          handleWarehouseChange(value);
          break;
        case "productId":
          handleProductChange(value);
          break;
        case "unit":
          handleUnitChange(value);
          break;
        case "invoiceStatus":
          handleInvoiceStatusChange(value);
          break;
        case "paymentStatus":
          handlePaymentStatusChange(value);
          break;
        default:
          setFormData((prev) => ({ ...prev, [field]: value }));
      }
    },
    [
      handleWarehouseChange,
      handleProductChange,
      handleUnitChange,
      handleInvoiceStatusChange,
      handlePaymentStatusChange,
    ]
  );

  // Filter products based on warehouse and category
  const availableProducts = useMemo(() => {
    if (!formData.warehouseId) return [];

    let filtered = products;
    if (formData.categoryId) {
      filtered = filtered.filter(
        (p) => p.category?._id === formData.categoryId
      );
    }

    return filtered;
  }, [products, formData.warehouseId, formData.categoryId]);

  // Handle array operations
  const handleArrayField = useCallback(
    (field, action, index = null, updates = {}) => {
      setFormData((prev) => {
        const arrayField = [...prev[field]];

        switch (action) {
          case "add":
            return { ...prev, [field]: [...arrayField, updates.newItem] };

          case "remove":
            return {
              ...prev,
              [field]: arrayField.filter((_, i) => i !== index),
            };

          case "update":
            if (index !== null) {
              arrayField[index] = { ...arrayField[index], ...updates };
              return { ...prev, [field]: arrayField };
            }
            return prev;

          default:
            return prev;
        }
      });
    },
    []
  );

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isEditMode
      ? `/sales/update-sale/${editData._id}`
      : `/sales/create-sales`;
    const method = isEditMode ? "patch" : "post";

    // Validation
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (!formData.pricePerUnit || parseFloat(formData.pricePerUnit) <= 0) {
      toast.error("Please enter a valid price per unit");
      return;
    }

    if (!formData.customerName) {
      toast.error("Please enter customer name");
      return;
    }

    const loadingToast = toast.loading(
      isEditMode ? "Updating sale..." : "Creating sale..."
    );

    try {
      // Prepare sales data
      const salesData = {
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        pricePerUnit: parseFloat(formData.pricePerUnit),
        saleDate: new Date(formData.saleDate),
        invoiceStatus: formData.invoiceStatus,
        deliveryCharge: parseFloat(formData.deliveryCharge) || 0,
        otherCharges: formData.otherCharges
          .filter((c) => c.name && c.amount)
          .map((c) => ({ name: c.name, amount: parseFloat(c.amount) || 0 })),
        discount: parseFloat(formData.discount) || 0,
        notes: formData.notes,
      };

      // Add product, warehouse, and category for new sales
      if (!isEditMode) {
        salesData.product = formData.productId;
        salesData.warehouse = formData.warehouseId;
        salesData.category = formData.categoryId;
      }

      // Handle customer data
      if (formData.customerType === "existing") {
        const selectedCustomer = customers.find(
          (c) => c.name === formData.customerName
        );
        if (selectedCustomer) {
          salesData.customer = {
            customerId: selectedCustomer._id,
            name: selectedCustomer.name,
            phone: selectedCustomer.phone,
            address: selectedCustomer.address,
          };
        } else {
          toast.error("Selected customer not found");
          toast.dismiss(loadingToast);
          return;
        }
      } else {
        salesData.customer = {
          customerId: null,
          name: formData.customerName,
          phone: formData.customerPhone,
          address: formData.customerAddress,
        };
      }

      // Handle invoiced sales
      if (formData.invoiceStatus === "Invoiced") {
        salesData.paymentStatus = formData.paymentStatus;

        if (formData.paymentStatus === "Paid payment") {
          // Validate full payment
          const payment = formData.payments[0];
          if (!payment?.method) {
            toast.error("Please select a payment method");
            toast.dismiss(loadingToast);
            return;
          }

          if (
            (payment.method === "bank" ||
              payment.method === "mobile-banking") &&
            !payment.account
          ) {
            toast.error(
              `Please select an account for ${payment.method} payment`
            );
            toast.dismiss(loadingToast);
            return;
          }

          salesData.payments = [
            {
              amount: parseFloat(payment.amount) || totalAmountToBePaid,
              date: new Date(payment.date),
              method: payment.method,
              ...(payment.method !== "Cash" && { account: payment.account }),
            },
          ];
        } else if (
          formData.paymentStatus === "Due payment" &&
          formData.payments.length > 0
        ) {
          // Validate partial payments
          const invalidPayment = formData.payments.find(
            (p) => !p.amount || !p.date || !p.method
          );

          if (invalidPayment) {
            toast.error("Please fill all payment details");
            toast.dismiss(loadingToast);
            return;
          }

          salesData.payments = formData.payments.map((p) => ({
            amount: parseFloat(p.amount) || 0,
            date: new Date(p.date),
            method: p.method,
            ...(p.method !== "Cash" && { account: p.account }),
          }));
        }
      }

      // Make API call
      const response = await api({ method, url, data: salesData });
      toast.dismiss(loadingToast);

      if (response.data.success) {
        toast.success(
          response.data.message ||
            (isEditMode
              ? "Sale updated successfully!"
              : "Sale created successfully!")
        );
        onSaleAdded(response.data.data || response.data);
        if (!isEditMode) {
          setFormData(initialFormData);
        }
        onClose();
      } else {
        throw new Error(response.data.message || "Operation failed");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error submitting sale:", error);

      let errorMessage = isEditMode
        ? "Failed to update sale"
        : "Failed to create sale";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  };

  // Payment method options
  const paymentMethodOptions = useMemo(
    () => [
      { value: "Cash", label: "Cash" },
      { value: "Bank", label: "Bank Transfer" },
      { value: "Mobile Banking", label: "Mobile Banking" },
    ],
    []
  );

  // Filtered accounts for payment methods
  const getFilteredAccounts = useCallback(
    (method) => {
      return accounts
        .filter((acc) => acc.accountType === method)
        .map((acc) => ({
          value: acc._id,
          label: `${acc.accountName} (${acc.bankName || acc.serviceName})`,
        }));
    },
    [accounts]
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed p-4 inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <FormHeader
            title={isEditMode ? "Edit Sale" : "Add New Sale"}
            subtitle="Enter the details of the sale"
            onClose={onClose}
          />

          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-grow"
          >
            {/* Warehouse, Category, Product */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SelectField
                label="Warehouse"
                name="warehouseId"
                value={formData.warehouseId}
                onChange={(e) =>
                  handleInputChange("warehouseId", e.target.value)
                }
                options={warehouses.map((w) => ({
                  value: w._id,
                  label: w.name,
                }))}
                required
                icon={Home}
                disabled={isEditMode || loading}
                loading={loading && !warehouses.length}
              />

              <SelectField
                label="Category"
                name="categoryId"
                value={formData.categoryId}
                onChange={(e) =>
                  handleInputChange("categoryId", e.target.value)
                }
                options={categories.map((c) => ({
                  value: c._id,
                  label: c.name,
                }))}
                icon={Tag}
                disabled={isEditMode || !formData.warehouseId || loading}
                loading={loading && !categories.length}
              />

              <SelectField
                label="Product"
                name="productId"
                value={formData.productId}
                onChange={(e) => handleInputChange("productId", e.target.value)}
                options={availableProducts.map((p) => ({
                  value: p._id,
                  label: p.name,
                }))}
                required
                icon={Package}
                disabled={isEditMode || !formData.warehouseId || loading}
                loading={loading && !products.length && formData.warehouseId}
              />
            </div>

            {/* Quantity, Unit, Price, Total */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <InputField
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                required
                placeholder="0"
                icon={Hash}
                min="0"
                step="0.01"
              />

              <SelectField
                label="Unit"
                name="unit"
                value={formData.unit}
                onChange={(e) => handleInputChange("unit", e.target.value)}
                options={units.map((u) => ({ value: u._id, label: u.name }))}
                required
                icon={Ruler}
                disabled={loading}
                loading={loading && !units.length}
              />

              <InputField
                label="Price Per Unit"
                name="pricePerUnit"
                type="number"
                value={formData.pricePerUnit}
                onChange={(e) =>
                  handleInputChange("pricePerUnit", e.target.value)
                }
                required
                placeholder="0.00"
                icon={DollarSign}
                min="0"
                step="0.01"
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Subtotal
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-lg font-semibold text-gray-900">
                    ${totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Customer Type"
                name="customerType"
                value={formData.customerType}
                onChange={(e) =>
                  handleInputChange("customerType", e.target.value)
                }
                options={[
                  { value: "existing", label: "Existing Customer" },
                  { value: "manual", label: "Manual Input" },
                ]}
                required
                disabled={loading}
              />

              <InputField
                label="Sale Date"
                name="saleDate"
                type="date"
                value={formData.saleDate}
                onChange={(e) => handleInputChange("saleDate", e.target.value)}
                required
                icon={Calendar}
                disabled={loading}
              />
            </div>

            {/* Customer Details */}
            {formData.customerType === "existing" ? (
              <SelectField
                label="Select Customer"
                name="customerName"
                value={formData.customerName}
                onChange={(e) =>
                  handleInputChange("customerName", e.target.value)
                }
                options={customers.map((c) => ({
                  value: c.name,
                  label: `${c.name} - ${c.phone}`,
                }))}
                required
                icon={User}
                disabled={loading}
                loading={loading && !customers.length}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField
                  label="Customer Name"
                  name="customerName"
                  value={formData.customerName}
                  onChange={(e) =>
                    handleInputChange("customerName", e.target.value)
                  }
                  required
                  placeholder="Enter customer name"
                  icon={User}
                  disabled={loading}
                />

                <InputField
                  label="Phone Number"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    handleInputChange("customerPhone", e.target.value)
                  }
                  placeholder="Enter phone number"
                  icon={User}
                  disabled={loading}
                />

                <InputField
                  label="Address"
                  name="customerAddress"
                  value={formData.customerAddress}
                  onChange={(e) =>
                    handleInputChange("customerAddress", e.target.value)
                  }
                  placeholder="Enter address"
                  icon={User}
                  disabled={loading}
                />
              </div>
            )}

            {/* Invoice Status and Delivery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Invoice Status"
                name="invoiceStatus"
                value={formData.invoiceStatus}
                onChange={(e) =>
                  handleInputChange("invoiceStatus", e.target.value)
                }
                options={[
                  { value: "Invoiced", label: "Invoiced" },
                  { value: "Not-invoiced", label: "Not Invoiced" },
                ]}
                required
                icon={FileText}
                disabled={loading}
              />

              <InputField
                label="Delivery Charge"
                name="deliveryCharge"
                type="number"
                value={formData.deliveryCharge}
                onChange={(e) =>
                  handleInputChange("deliveryCharge", e.target.value)
                }
                placeholder="0.00"
                icon={Truck}
                min="0"
                step="0.01"
                disabled={loading}
              />
            </div>

            {/* Other Charges */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Other Charges
              </label>
              {formData.otherCharges.map((charge, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 items-end"
                >
                  <InputField
                    label={`Charge Name ${index + 1}`}
                    name={`otherCharges[${index}].name`}
                    value={charge.name}
                    onChange={(e) =>
                      handleArrayField("otherCharges", "update", index, {
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g., Loading Charge"
                    disabled={loading}
                  />

                  <InputField
                    label="Amount"
                    name={`otherCharges[${index}].amount`}
                    type="number"
                    value={charge.amount}
                    onChange={(e) =>
                      handleArrayField("otherCharges", "update", index, {
                        amount: e.target.value,
                      })
                    }
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      handleArrayField("otherCharges", "remove", index)
                    }
                    className="h-10 px-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                    disabled={loading}
                  >
                    <MinusCircle size={20} />
                    <span className="ml-2 text-sm">Remove</span>
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  handleArrayField("otherCharges", "add", null, {
                    newItem: { name: "", amount: "" },
                  })
                }
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                disabled={loading}
              >
                <PlusCircle size={16} />
                <span>Add Charge</span>
              </button>
            </div>

            {/* Discount and Total */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Discount"
                name="discount"
                type="number"
                value={formData.discount}
                onChange={(e) => handleInputChange("discount", e.target.value)}
                placeholder="0.00"
                icon={DollarSign}
                min="0"
                step="0.01"
                disabled={loading}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Total Amount to be Paid
                </label>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xl font-bold text-blue-700">
                    ${totalAmountToBePaid.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Invoice Payment Section */}
            {formData.invoiceStatus === "Invoiced" && (
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label="Payment Status"
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={(e) =>
                      handleInputChange("paymentStatus", e.target.value)
                    }
                    options={[
                      { value: "Due payment", label: "Due Payment" },
                      { value: "Paid payment", label: "Paid Payment" },
                    ]}
                    required
                    icon={DollarSign}
                    disabled={
                      loading ||
                      (isEditMode && editData.invoiceStatus === "Invoiced")
                    }
                  />

                  {formData.paymentStatus === "Due payment" && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Partial Payments
                      </label>
                      {formData.payments.map((payment, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-3 items-end"
                        >
                          <InputField
                            label="Amount"
                            name={`payments[${index}].amount`}
                            type="number"
                            value={payment.amount}
                            onChange={(e) =>
                              handleArrayField("payments", "update", index, {
                                amount: e.target.value,
                              })
                            }
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            disabled={loading}
                          />

                          <InputField
                            label="Date"
                            name={`payments[${index}].date`}
                            type="date"
                            value={payment.date}
                            onChange={(e) =>
                              handleArrayField("payments", "update", index, {
                                date: e.target.value,
                              })
                            }
                            disabled={loading}
                          />

                          <SelectField
                            label="Method"
                            name={`payments[${index}].method`}
                            value={payment.method}
                            onChange={(e) =>
                              handleArrayField("payments", "update", index, {
                                method: e.target.value,
                                account: "",
                              })
                            }
                            options={paymentMethodOptions}
                            disabled={loading}
                          />

                          {(payment.method === "Bank" ||
                            payment.method === "Mobile Banking" ||
                            payment.method === "Cash") && (
                            <SelectField
                              label="Account"
                              name={`payments[${index}].account`}
                              value={payment.account}
                              onChange={(e) =>
                                handleArrayField("payments", "update", index, {
                                  account: e.target.value,
                                })
                              }
                              options={getFilteredAccounts(payment.method)}
                              required
                              disabled={loading}
                            />
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleArrayField("payments", "remove", index)
                            }
                            className="h-10 px-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                            disabled={loading}
                          >
                            <MinusCircle size={20} />
                            <span className="ml-2 text-sm">Remove</span>
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() =>
                          handleArrayField("payments", "add", null, {
                            newItem: {
                              amount: "",
                              date: new Date().toISOString().split("T")[0],
                              method: "",
                              account: "",
                            },
                          })
                        }
                        className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                        disabled={loading}
                      >
                        <PlusCircle size={16} />
                        <span>Add Partial Payment</span>
                      </button>
                    </div>
                  )}

                  {formData.paymentStatus === "Paid payment" && (
                    <>
                      <SelectField
                        label="Payment Method"
                        name="payments[0].method"
                        value={formData.payments[0]?.method || ""}
                        onChange={(e) =>
                          handleArrayField("payments", "update", 0, {
                            method: e.target.value,
                            account: "",
                          })
                        }
                        options={paymentMethodOptions}
                        required
                        disabled={loading}
                      />

                      {(formData.payments[0]?.method === "Bank" ||
                        formData.payments[0]?.method === "Mobile Banking" ||
                        formData.payments[0]?.method === "Cash") && (
                        <SelectField
                          label="Account"
                          name="payments[0].account"
                          value={formData.payments[0]?.account || ""}
                          onChange={(e) =>
                            handleArrayField("payments", "update", 0, {
                              account: e.target.value,
                            })
                          }
                          options={getFilteredAccounts(
                            formData.payments[0]?.method
                          )}
                          required
                          disabled={loading}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            <TextAreaField
              label="Additional Notes (Optional)"
              name="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any additional information about this sale..."
              rows={3}
              disabled={loading}
            />

            {/* Form Actions */}
            <FormActions
              onCancel={onClose}
              onSave={handleSubmit}
              saveText={isEditMode ? "Update Sale" : "Save Sale"}
              isSaving={loading}
            />
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddSales;
