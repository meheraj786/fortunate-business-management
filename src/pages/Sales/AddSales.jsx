import React, { useState, useEffect, useMemo, useContext } from "react";
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
import axios from "axios";
import { UrlContext } from "../../context/UrlContext";
import toast from "react-hot-toast";

import FormHeader from "../../components/forms/FormHeader";
import FormActions from "../../components/forms/FormActions";
import InputField from "../../components/forms/InputField";
import SelectField from "../../components/forms/SelectField";
import TextAreaField from "../../components/forms/TextAreaField";

const AddSales = ({
  onClose,
  onSaleAdded,
  editData = null,
  isOpen = false,
}) => {
  const { baseUrl } = useContext(UrlContext);

  const isEditMode = !!editData;

  const initialFormData = {
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
    paymentStatus: "Due payment",
    payments: [],
    notes: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // Fetch initial data (warehouses, customers, categories, accounts)
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        const [customersRes, warehousesRes, categoriesRes, accountsRes] =
          await Promise.all([
            axios.get(`${baseUrl}customer/get-customers`),
            axios.get(`${baseUrl}warehouse/`),
            axios.get(`${baseUrl}category/get`),
            axios.get(`${baseUrl}bank/get-all-accounts`),
          ]);

        setCustomers(customersRes.data.data || []);
        setWarehouses(warehousesRes.data.data || []);
        setCategories(categoriesRes.data.data || []);
        setAccounts(accountsRes.data.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load initial data");
      }
    };

    fetchData();
  }, [baseUrl, isOpen]);

  // Fetch products when warehouse changes
  useEffect(() => {
    if (formData.warehouseId) {
      const fetchProducts = async () => {
        try {
          const res = await axios.get(
            `${baseUrl}warehouse/${formData.warehouseId}/products`
          );
          setProducts(res.data.data || []);
        } catch (error) {
          console.error("Error fetching products:", error);
          toast.error("Failed to load products for the selected warehouse.");
          setProducts([]);
        }
      };
      fetchProducts();
    } else {
      setProducts([]);
    }
  }, [formData.warehouseId, baseUrl]);

  // Populate form with editData
  useEffect(() => {
    if (isEditMode && isOpen) {
      setFormData({
        warehouseId: editData.warehouse?._id || "",
        productId: editData.product?._id || "",
        categoryId: editData.category?._id || "",
        quantity: editData.quantity || "",
        unit: editData.unit || "",
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
        paymentStatus: editData.paymentStatus || "Due payment",
        payments:
          editData.payments?.map((p) => ({
            ...p,
            date: new Date(p.date).toISOString().split("T")[0],
            bankAccount: p.bankAccount?._id || "",
          })) || [],
        notes: editData.notes || "",
      });
    } else if (!isEditMode) {
      setFormData(initialFormData);
    }
  }, [editData, isOpen, isEditMode]);

  // Filter products based on warehouse and category
  const availableProducts = useMemo(() => {
    if (!formData.warehouseId) return [];

    let filtered = products; // Products are already filtered by warehouse

    if (formData.categoryId) {
      filtered = filtered.filter(
        (p) => p.category?._id === formData.categoryId
      );
    }

    return filtered;
  }, [products, formData.categoryId]);

  // Calculate amounts
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

  // Handle invoice status changes
  useEffect(() => {
    if (isEditMode) return;

    if (formData.invoiceStatus === "Not-invoiced") {
      setFormData((prev) => ({
        ...prev,
        paymentStatus: undefined,
        payments: [],
      }));
    } else if (formData.invoiceStatus === "Invoiced") {
      setFormData((prev) => ({ ...prev, paymentStatus: "Due payment" }));
    }
  }, [formData.invoiceStatus, isEditMode]);

  // Handle payment status changes
  useEffect(() => {
    if (
      (isEditMode && editData?.invoiceStatus === "Invoiced") ||
      formData.invoiceStatus !== "Invoiced"
    )
      return;

    if (formData.paymentStatus === "Paid payment") {
      setFormData((prev) => ({
        ...prev,
        payments: [
          {
            amount: totalAmountToBePaid.toFixed(2),
            date: new Date().toISOString().split("T")[0],
            method: prev.payments[0]?.method || "",
          },
        ],
      }));
    } else if (formData.paymentStatus === "Due payment") {
      setFormData((prev) => ({ ...prev, payments: [] }));
    }
  }, [
    formData.paymentStatus,
    formData.invoiceStatus,
    totalAmountToBePaid,
    isEditMode,
    editData,
  ]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "productId" && value && !isEditMode) {
      const product = products.find((p) => p._id === value);
      if (product) {
        setFormData((prev) => ({
          ...prev,
          unit: product.unit,
          pricePerUnit: product.unitPrice,
          categoryId: product.category?._id,
        }));
      }
    }
  };

  const handleWarehouseChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      warehouseId: value,
      productId: "",
      categoryId: "",
      quantity: "",
      unit: "",
      pricePerUnit: "",
    }));
  };

  // Handle array field operations
  const handleArrayField = (field, action, index = null, updates = {}) => {
    setFormData((prev) => {
      const arrayField = [...prev[field]];
      if (action === "add") {
        return { ...prev, [field]: [...arrayField, updates.newItem] };
      }
      if (action === "remove") {
        return { ...prev, [field]: arrayField.filter((_, i) => i !== index) };
      }
      if (action === "update" && index !== null) {
        arrayField[index] = { ...arrayField[index], ...updates };
        return { ...prev, [field]: arrayField };
      }
      return prev;
    });
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isEditMode
      ? `${baseUrl}sales/update-sale/${editData._id}`
      : `${baseUrl}sales/create-sales`;
    const method = isEditMode ? "patch" : "post";
    let loadingToast;
    try {
      loadingToast = toast.loading(
        isEditMode ? "Updating sale..." : "Creating sale..."
      );

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
        }
      } else {
        salesData.customer = {
          customerId: null,
          name: formData.customerName,
          phone: formData.customerPhone,
          address: formData.customerAddress,
        };
      }

      if (salesData.invoiceStatus === "Invoiced") {
        salesData.paymentStatus = formData.paymentStatus;
        for (const p of formData.payments) {
          if (
            (p.method === "bank" || p.method === "mobile-banking") &&
            !p.bankAccount
          ) {
            toast.error(
              `Please select an account for the ${p.method} payment.`
            );
            if (loadingToast) toast.dismiss(loadingToast);
            return;
          }
        }
        salesData.payments = formData.payments
          .filter((p) => p.amount && p.date && p.method)
          .map((p) => {
            const paymentPayload = {
              amount: parseFloat(p.amount) || 0,
              date: new Date(p.date),
              method: p.method,
            };
            if (p.method === "bank" || p.method === "mobile-banking") {
              paymentPayload.bankAccount = p.bankAccount;
            }
            return paymentPayload;
          });
      }

      const response = await axios({ method, url, data: salesData });
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
      }
    } catch (error) {
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
      console.error(
        isEditMode ? "Error updating sale:" : "Error creating sale:",
        error
      );
      let errorMessage = isEditMode
        ? "Failed to update sale"
        : "Failed to create sale";
      if (error.response?.data) {
        if (
          typeof error.response.data === "object" &&
          error.response.data.message
        ) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === "string") {
          const match = error.response.data.match(/<pre>Error: (.*?)<br>/);
          if (match && match[1]) {
            errorMessage = match[1];
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
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

  const paymentMethodOptions = [
    { value: "cash", label: "Cash" },
    { value: "bank", label: "Bank Transfer" },
    { value: "mobile-banking", label: "Mobile Banking" },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <FormHeader
            title={isEditMode ? "Edit Sale" : "Add New Sale"}
            subtitle="Enter the details of the sale."
            onClose={onClose}
          />

          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-6 overflow-y-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SelectField
                label="Warehouse"
                name="warehouseId"
                value={formData.warehouseId}
                onChange={(e) => handleWarehouseChange(e.target.value)}
                options={warehouses.map((w) => ({
                  value: w._id,
                  label: w.name,
                }))}
                required
                icon={Home}
                disabled={isEditMode}
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
                disabled={isEditMode || !formData.warehouseId}
              />
              <SelectField
                label="Product Name"
                name="productId"
                value={formData.productId}
                onChange={(e) => handleInputChange("productId", e.target.value)}
                options={availableProducts.map((p) => ({
                  value: p._id,
                  label: p.name,
                }))}
                required
                icon={Package}
                disabled={isEditMode || !formData.warehouseId}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <InputField
                label="Quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                required
                placeholder="0"
                icon={Hash}
              />
              <SelectField
                label="Select Unit"
                name="unit"
                value={formData.unit}
                onChange={(e) => handleInputChange("unit", e.target.value)}
                options={unitOptions}
                required
                icon={Ruler}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              />
              {formData.customerType === "existing" ? (
                <SelectField
                  label="Customer Name"
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
                />
              ) : (
                formData.customerType === "manual" && (
                  <>
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
                    />
                  </>
                )
              )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Other Charges
              </label>
              {formData.otherCharges.map((charge, index) => (
                <div key={index} className="flex items-center gap-4 mb-2">
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
                    step="0.01"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleArrayField("otherCharges", "remove", index)
                    }
                    className="text-red-500 hover:text-red-700 mt-7"
                  >
                    <MinusCircle size={20} />
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
                className="flex items-center space-x-2 text-sm text-[#003b75] hover:text-blue-700"
              >
                <PlusCircle size={16} />
                <span>Add More Charges</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <InputField
                label="Discount"
                name="discount"
                type="number"
                value={formData.discount}
                onChange={(e) => handleInputChange("discount", e.target.value)}
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
            {formData.invoiceStatus === "Invoiced" && (
              <fieldset
                disabled={
                  isEditMode &&
                  !(
                    editData.invoiceStatus === "Not-invoiced" &&
                    formData.invoiceStatus === "Invoiced"
                  )
                }
                className="p-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  />
                  {formData.paymentStatus === "Due payment" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Partial Payments
                      </label>
                      {formData.payments.map((payment, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 mb-2"
                        >
                          <InputField
                            label={`Payment ${index + 1}`}
                            name={`payments[${index}].amount`}
                            type="number"
                            value={payment.amount}
                            onChange={(e) =>
                              handleArrayField("payments", "update", index, {
                                amount: e.target.value,
                              })
                            }
                            placeholder="0.00"
                            step="0.01"
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
                          />
                          <SelectField
                            label="Payment Method"
                            name={`payments[${index}].method`}
                            value={payment.method}
                            onChange={(e) =>
                              handleArrayField("payments", "update", index, {
                                method: e.target.value,
                                bankAccount: "",
                              })
                            }
                            options={paymentMethodOptions}
                          />
                          {(payment.method === "bank" ||
                            payment.method === "mobile-banking") && (
                            <SelectField
                              label="Account"
                              name={`payments[${index}].bankAccount`}
                              value={payment.bankAccount}
                              onChange={(e) =>
                                handleArrayField("payments", "update", index, {
                                  bankAccount: e.target.value,
                                })
                              }
                              options={accounts
                                .filter((acc) =>
                                  payment.method === "bank"
                                    ? acc.accountType === "Bank"
                                    : acc.accountType === "Mobile Banking"
                                )
                                .map((acc) => ({
                                  value: acc._id,
                                  label: `${acc.accountName} (${
                                    acc.bankName || acc.serviceName
                                  })`,
                                }))}
                              required
                            />
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              handleArrayField("payments", "remove", index)
                            }
                            className="text-red-500 hover:text-red-700 mt-7"
                          >
                            <MinusCircle size={20} />
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
                              bankAccount: "",
                            },
                          })
                        }
                        className="flex items-center space-x-2 text-sm text-[#003b75] hover:text-blue-700"
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
                            bankAccount: "",
                          })
                        }
                        options={paymentMethodOptions}
                        required
                      />
                      {(formData.payments[0]?.method === "bank" ||
                        formData.payments[0]?.method === "mobile-banking") && (
                        <SelectField
                          label="Account"
                          name="payments[0].bankAccount"
                          value={formData.payments[0]?.bankAccount || ""}
                          onChange={(e) =>
                            handleArrayField("payments", "update", 0, {
                              bankAccount: e.target.value,
                            })
                          }
                          options={accounts
                            .filter((acc) =>
                              formData.payments[0]?.method === "bank"
                                ? acc.accountType === "Bank"
                                : acc.accountType === "Mobile Banking"
                            )
                            .map((acc) => ({
                              value: acc._id,
                              label: `${acc.accountName} (${
                                acc.bankName || acc.serviceName
                              })`,
                            }))}
                          required
                        />
                      )}
                    </>
                  )}
                </div>
              </fieldset>
            )}
            <TextAreaField
              label="Additional Notes (Optional)"
              name="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any additional information about this sale..."
              rows={2}
            />
            <FormActions
              onCancel={onClose}
              onSave={handleSubmit}
              saveText={isEditMode ? "Update Sale" : "Save Sale"}
            />
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddSales;
