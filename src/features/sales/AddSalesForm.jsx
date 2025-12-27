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
              account: p.accountId?._id || p.accountId || "",
            })) || [],
          notes: editData.notes || "",
        };

        setFormData(editFormData);

        if (editData.warehouse?._id) {
          await fetchProducts(editData.warehouse._id);
        }
      };

      populateFormData();
    } else if (!isEditMode && isOpen) {
      setFormData(initialFormData);
    }
  }, [isEditMode, isOpen, editData, fetchProducts, initialFormData]);

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

  // Helper to map UI methods to Backend expected methods
  const normalizeMethod = (method) => {
    if (!method) return "";
    const map = {
      "Cash": "cash",
      "Bank": "bank",
      "Mobile Banking": "mobile-banking"
    };
    return map[method] || method.toLowerCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isEditMode
      ? `/sales/update-sale/${editData._id}`
      : `/sales/create-sales`;
    const method = isEditMode ? "patch" : "post";

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      toast.error("Please enter a valid quantity");
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

      if (!isEditMode) {
        salesData.product = formData.productId;
        salesData.warehouse = formData.warehouseId;
        salesData.category = formData.categoryId;
      }

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

      if (formData.invoiceStatus === "Invoiced") {
        salesData.paymentStatus = formData.paymentStatus;

        // পেমেন্ট ডেটা প্রসেসিং (আইডি এবং মেথড ফিক্স)
        if (formData.payments && formData.payments.length > 0) {
            salesData.payments = formData.payments.map((p) => {
                if (!p.method) throw new Error("Payment method is required");
                if (!p.account) throw new Error(`Account is required for ${p.method} payment`);
                
                return {
                    amount: parseFloat(p.amount) || 0,
                    date: new Date(p.date),
                    method: normalizeMethod(p.method), // মেথড নরমাল করা হলো (e.g. "bank")
                    accountId: p.account, // ব্যাকএন্ড expects accountId
                };
            });
        }
      }

      const response = await api({ method, url, data: salesData });
      toast.dismiss(loadingToast);

      if (response.data.success) {
        toast.success(response.data.message || "Success");
        onSaleAdded(response.data.data || response.data);
        if (!isEditMode) setFormData(initialFormData);
        onClose();
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Error submitting sale:", error);
      toast.error(error.response?.data?.message || error.message || "Failed");
    }
  };

  const paymentMethodOptions = useMemo(
    () => [
      { value: "cash", label: "Cash" },
      { value: "Bank", label: "Bank Transfer" },
      { value: "Mobile Banking", label: "Mobile Banking" },
    ],
    []
  );

  const getFilteredAccounts = useCallback(
    (method) => {
      return accounts
        .filter((acc) => acc.accountType === method)
        .map((acc) => ({
          value: acc._id,
          label: `${acc.accountName} (${acc.bankName || acc.serviceName || 'Direct'})`,
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SelectField
                label="Warehouse"
                name="warehouseId"
                value={formData.warehouseId}
                onChange={(e) => handleInputChange("warehouseId", e.target.value)}
                options={warehouses.map((w) => ({ value: w._id, label: w.name }))}
                required
                icon={Home}
                disabled={isEditMode || loading}
              />
              <SelectField
                label="Category"
                name="categoryId"
                value={formData.categoryId}
                onChange={(e) => handleInputChange("categoryId", e.target.value)}
                options={categories.map((c) => ({ value: c._id, label: c.name }))}
                icon={Tag}
                disabled={isEditMode || !formData.warehouseId || loading}
              />
              <SelectField
                label="Product"
                name="productId"
                value={formData.productId}
                onChange={(e) => handleInputChange("productId", e.target.value)}
                options={availableProducts.map((p) => ({ value: p._id, label: p.name }))}
                required
                icon={Package}
                disabled={isEditMode || !formData.warehouseId || loading}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <InputField
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                required
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
              />
              <InputField
                label="Price Per Unit"
                name="pricePerUnit"
                type="number"
                value={formData.pricePerUnit}
                onChange={(e) => handleInputChange("pricePerUnit", e.target.value)}
                required
                icon={DollarSign}
                min="0"
                step="0.01"
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Subtotal</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-lg font-semibold text-gray-900">
                  ৳{totalAmount.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Customer Type"
                name="customerType"
                value={formData.customerType}
                onChange={(e) => handleInputChange("customerType", e.target.value)}
                options={[{ value: "existing", label: "Existing Customer" }, { value: "manual", label: "Manual Input" }]}
                required
              />
              <InputField
                label="Sale Date"
                name="saleDate"
                type="date"
                value={formData.saleDate}
                onChange={(e) => handleInputChange("saleDate", e.target.value)}
                required
                icon={Calendar}
              />
            </div>

            {formData.customerType === "existing" ? (
              <SelectField
                label="Select Customer"
                name="customerName"
                value={formData.customerName}
                onChange={(e) => handleInputChange("customerName", e.target.value)}
                options={customers.map((c) => ({ value: c.name, label: `${c.name} - ${c.phone}` }))}
                required
                icon={User}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField label="Customer Name" value={formData.customerName} onChange={(e) => handleInputChange("customerName", e.target.value)} required icon={User} />
                <InputField label="Phone Number" value={formData.customerPhone} onChange={(e) => handleInputChange("customerPhone", e.target.value)} icon={User} />
                <InputField label="Address" value={formData.customerAddress} onChange={(e) => handleInputChange("customerAddress", e.target.value)} icon={User} />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Invoice Status"
                name="invoiceStatus"
                value={formData.invoiceStatus}
                onChange={(e) => handleInputChange("invoiceStatus", e.target.value)}
                options={[{ value: "Invoiced", label: "Invoiced" }, { value: "Not-invoiced", label: "Not Invoiced" }]}
                required
                icon={FileText}
              />
              <InputField
                label="Delivery Charge"
                type="number"
                value={formData.deliveryCharge}
                onChange={(e) => handleInputChange("deliveryCharge", e.target.value)}
                icon={Truck}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Other Charges</label>
              {formData.otherCharges.map((charge, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 items-end">
                  <InputField label="Charge Name" value={charge.name} onChange={(e) => handleArrayField("otherCharges", "update", index, { name: e.target.value })} />
                  <InputField label="Amount" type="number" value={charge.amount} onChange={(e) => handleArrayField("otherCharges", "update", index, { amount: e.target.value })} />
                  <button type="button" onClick={() => handleArrayField("otherCharges", "remove", index)} className="h-10 px-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center">
                    <MinusCircle size={20} /> <span className="ml-2 text-sm">Remove</span>
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => handleArrayField("otherCharges", "add", null, { newItem: { name: "", amount: "" } })} className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg flex items-center space-x-2">
                <PlusCircle size={16} /> <span>Add Charge</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Discount" type="number" value={formData.discount} onChange={(e) => handleInputChange("discount", e.target.value)} icon={DollarSign} />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Total to be Paid</label>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xl font-bold text-blue-700">
                  ৳{totalAmountToBePaid.toLocaleString()}
                </div>
              </div>
            </div>

            {formData.invoiceStatus === "Invoiced" && (
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label="Payment Status"
                    value={formData.paymentStatus}
                    onChange={(e) => handleInputChange("paymentStatus", e.target.value)}
                    options={[{ value: "Due payment", label: "Due Payment" }, { value: "Paid payment", label: "Paid Payment" }]}
                    required
                  />

                  {formData.paymentStatus === "Due payment" && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Partial Payments</label>
                      {formData.payments.map((payment, index) => (
                        <div key={index} className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-3 items-end">
                          <InputField label="Amount" type="number" value={payment.amount} onChange={(e) => handleArrayField("payments", "update", index, { amount: e.target.value })} />
                          <InputField label="Date" type="date" value={payment.date} onChange={(e) => handleArrayField("payments", "update", index, { date: e.target.value })} />
                          <SelectField label="Method" value={payment.method} onChange={(e) => handleArrayField("payments", "update", index, { method: e.target.value, account: "" })} options={paymentMethodOptions} />
                          {payment.method && (
                            <SelectField label="Account" value={payment.account} onChange={(e) => handleArrayField("payments", "update", index, { account: e.target.value })} options={getFilteredAccounts(payment.method).map((acc) => {
                            let label = "";
                            if (acc.accountType === "Bank") {
                              label = `${acc.bankName} (${acc.accountHolderName}) - ${acc.accountNumber}`;
                            } else if (acc.accountType === "Mobile Banking") {
                              label = `${acc.serviceName} (${acc.accountHolderName}) - ${acc.mobileNumber}`;
                            } else if (acc.accountType === "Cash") {
                              label = `${acc.accountName} (${acc.accountHolderName})`;
                            }
                            return { value: acc._id, label: label };
                          })} required />
                          )}
                          <button type="button" onClick={() => handleArrayField("payments", "remove", index)} className="h-10 px-3 text-red-500 hover:bg-red-50 rounded-lg flex items-center justify-center">
                            <MinusCircle size={20} />
                          </button>
                        </div>
                      ))}
                      <button type="button" onClick={() => handleArrayField("payments", "add", null, { newItem: { amount: "", date: new Date().toISOString().split("T")[0], method: "", account: "" } })} className="text-sm text-blue-600 flex items-center space-x-2">
                        <PlusCircle size={16} /> <span>Add Partial Payment</span>
                      </button>
                    </div>
                  )}

                  {formData.paymentStatus === "Paid payment" && (
                    <>
                      <SelectField label="Payment Method" value={formData.payments[0]?.method || ""} onChange={(e) => handleArrayField("payments", "update", 0, { method: e.target.value, account: "" })} options={paymentMethodOptions} required />
                      {formData.payments[0]?.method && (
                        <SelectField label="Account" value={formData.payments[0]?.account || ""} onChange={(e) => handleArrayField("payments", "update", 0, { account: e.target.value })} options={getFilteredAccounts(formData.payments[0]?.method).map((acc) => {
                        let label = "";
                        if (acc.accountType === "Bank") {
                          label = `${acc.bankName} (${acc.accountHolderName}) - ${acc.accountNumber}`;
                        } else if (acc.accountType === "Mobile Banking") {
                          label = `${acc.serviceName} (${acc.accountHolderName}) - ${acc.mobileNumber}`;
                        } else if (acc.accountType === "Cash") {
                          label = `${acc.accountName} (${acc.accountHolderName})`;
                        }
                        return { value: acc._id, label: label };
                      })} required />
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            <TextAreaField label="Notes" value={formData.notes} onChange={(e) => handleInputChange("notes", e.target.value)} rows={3} />

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