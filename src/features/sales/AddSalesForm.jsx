import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, User, Calendar, DollarSign, FileText, Tag, Hash, Home, Truck, PlusCircle, MinusCircle, Ruler } from "lucide-react";
import toast from "react-hot-toast";

import { useCustomers } from "@/api/hooks/customer";
import { useWarehouses } from "@/api/hooks/warehouse";
import { useCategories } from "@/api/hooks/category";
import { useAccounts } from "@/api/hooks/account";
import { useUnits } from "@/api/hooks/unit";
import { useProducts } from "@/api/hooks/products";
import { useCreateSale, useUpdateSale } from "@/api/hooks/sales";

import FormHeader from "@/components/ui/FormHeader";
import FormActions from "@/components/ui/FormActions";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import TextAreaField from "@/components/ui/TextAreaField";
import FormSkeleton from "./components/AddSaleFormSkeleton";

const AddSales = ({ onClose, onSaleAdded, editData = null, isOpen = false }) => {
  const isEditMode = !!editData;

  const initialFormData = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const saleDate = now.toISOString().slice(0, 16);

    return {
      warehouseId: "", productId: "", categoryId: "", quantity: "", unit: "", pricePerUnit: "", customerType: "existing", customerName: "",
      customerPhone: "", customerAddress: "", saleDate, invoiceStatus: "Not-invoiced",
      charges: [], costs: [], discount: "", payments: [], notes: "",
    };
  }, []);

  const [formData, setFormData] = useState(initialFormData);

  // Data Fetching
  const { data: customersData, isLoading: customersLoading } = useCustomers();
  const { data: warehousesData, isLoading: warehousesLoading } = useWarehouses();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const { data: accountsData, isLoading: accountsLoading } = useAccounts();
  const { data: unitsData, isLoading: unitsLoading } = useUnits();
  const { data: productsData, isLoading: productsLoading } = useProducts(formData.warehouseId, { limit: 10000 }, { enabled: !!formData.warehouseId });
  
  const customers = customersData?.data || [];
  const warehouses = warehousesData?.data?.warehouses || [];
  const categories = categoriesData?.data || [];
  const accounts = accountsData?.data || [];
  const units = unitsData?.data || [];
  const products = productsData?.data?.docs || [];

  const createSaleMutation = useCreateSale();
  const updateSaleMutation = useUpdateSale(editData?._id);

  // Populate form for edit mode
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editData) {
        const saleDate = new Date(editData.saleDate);
        saleDate.setMinutes(saleDate.getMinutes() - saleDate.getTimezoneOffset());
        
        setFormData({
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
          saleDate: saleDate.toISOString().slice(0, 16),
          invoiceStatus: editData.invoiceStatus || "Not-invoiced",
          charges: editData.charges || [],
          costs: editData.costs || [],
          discount: editData.discount || "",
          payments: editData.payments?.map(p => {
            const paymentDate = p.date ? new Date(p.date) : null;
            if (paymentDate) {
              paymentDate.setMinutes(paymentDate.getMinutes() - paymentDate.getTimezoneOffset());
            }
            return {
              ...p,
              date: paymentDate ? paymentDate.toISOString().slice(0, 16) : "",
              accountId: p.accountId?._id || p.accountId
            };
          }) || [],
          notes: editData.notes || "",
        });
      } else {
        setFormData(initialFormData);
      }
    }
  }, [isEditMode, isOpen, editData, initialFormData]);

  // Calculations
  const { totalAmount, totalAmountToBePaid } = useMemo(() => {
    const quantity = parseFloat(formData.quantity) || 0;
    const pricePerUnit = parseFloat(formData.pricePerUnit) || 0;
    const total = quantity * pricePerUnit;
    const chargesTotal = formData.charges.reduce((acc, charge) => acc + (parseFloat(charge.amount) || 0), 0);
    const costsTotal = formData.costs.reduce((acc, cost) => acc + (parseFloat(cost.amount) || 0), 0);
    const discount = parseFloat(formData.discount) || 0;
    return { totalAmount: total, totalAmountToBePaid: total + chargesTotal + costsTotal - discount };
  }, [formData.quantity, formData.pricePerUnit, formData.charges, formData.costs, formData.discount]);

  // Handlers
  const handleWarehouseChange = useCallback((warehouseId) => {
    setFormData((prev) => ({ ...prev, warehouseId, productId: "", categoryId: "", quantity: "", unit: "", pricePerUnit: "" }));
  }, []);

  const handleProductChange = useCallback((productId) => {
    const product = products.find(p => p._id === productId);
    if (product) {
      setFormData(prev => ({ ...prev, productId, unit: product.unit?._id || "", pricePerUnit: product.unitPrice || "", categoryId: product.category?._id || "" }));
    }
  }, [products]);
  
  const handleUnitChange = useCallback((unitId) => {
    const product = products.find(p => p._id === formData.productId);
    const selectedUnit = units.find(u => u._id === unitId);
    if (product && selectedUnit && product.unit?.conversionFactor && selectedUnit.conversionFactor) {
      const pricePerBaseUnit = product.unitPrice / product.unit.conversionFactor;
      const newPriceForSale = pricePerBaseUnit * selectedUnit.conversionFactor;
      setFormData(prev => ({ ...prev, unit: unitId, pricePerUnit: newPriceForSale.toFixed(2) }));
    } else {
      setFormData(prev => ({ ...prev, unit: unitId }));
    }
  }, [products, units, formData.productId]);
  
  const handleInvoiceStatusChange = useCallback((status) => {
    if (status === "Not-invoiced") {
      setFormData((prev) => ({ ...prev, invoiceStatus: status, paymentStatus: "", payments: [] }));
    } else if (status === "Invoiced") {
      setFormData((prev) => ({ ...prev, invoiceStatus: status, paymentStatus: "Due payment" }));
    }
  }, []);

  const handlePaymentStatusChange = useCallback((status) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const paymentDate = now.toISOString().slice(0, 16);
    if (status === "Paid payment") {
      setFormData(prev => ({ ...prev, paymentStatus: status, payments: [{ amount: totalAmountToBePaid.toFixed(2), date: paymentDate, method: "", accountId: "" }] }));
    } else if (status === "Due payment") {
      setFormData(prev => ({ ...prev, paymentStatus: status, payments: [] }));
    }
  }, [totalAmountToBePaid]);

  const handleInputChange = useCallback((field, value) => {
    switch (field) {
      case "warehouseId": handleWarehouseChange(value); break;
      case "productId": handleProductChange(value); break;
      case "unit": handleUnitChange(value); break;
      case "invoiceStatus": handleInvoiceStatusChange(value); break;
      case "paymentStatus": handlePaymentStatusChange(value); break;
      default: setFormData(prev => ({ ...prev, [field]: value }));
    }
  }, [handleWarehouseChange, handleProductChange, handleUnitChange, handleInvoiceStatusChange, handlePaymentStatusChange]);
  
  const handleArrayField = useCallback((field, action, index = null, updates = {}) => {
    setFormData(prev => {
      const fieldData = [...(prev[field] || [])];
      if (action === "add") fieldData.push(updates.newItem);
      if (action === "remove") fieldData.splice(index, 1);
      if (action === "update" && index !== null) fieldData[index] = { ...fieldData[index], ...updates };
      return { ...prev, [field]: fieldData };
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation
    if (!formData.quantity || !formData.pricePerUnit || !formData.customerName || !formData.productId) {
      toast.error("Please fill all required fields.");
      return;
    }

    const salesData = {
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      pricePerUnit: parseFloat(formData.pricePerUnit),
      saleDate: formData.saleDate,
      invoiceStatus: formData.invoiceStatus,
      charges: formData.charges.filter(c => c.name && c.amount).map(c => ({ ...c, amount: parseFloat(c.amount) })),
      costs: formData.costs.filter(c => c.name && c.amount && c.accountId).map(c => ({
        name: c.name,
        amount: parseFloat(c.amount),
        accountId: c.accountId,
        paymentMethod: c.method
      })),
      discount: parseFloat(formData.discount) || 0,
      notes: formData.notes,
      product: formData.productId,
      warehouse: formData.warehouseId,
      category: formData.categoryId,
      customer: formData.customerType === 'existing'
        ? { customerId: formData.customerId, name: formData.customerName }
        : { customerId: null, name: formData.customerName, phone: formData.customerPhone, address: formData.customerAddress },
      paymentStatus: formData.paymentStatus,
      payments: formData.payments.map(p => ({
        amount: parseFloat(p.amount) || 0,
        date: p.date,
        method: p.method,
        accountId: p.accountId
      })).filter(p => p.amount > 0 && p.method && p.accountId),
    };
    
    if (isEditMode) {
      const { customer, costs, payments, product, warehouse, category, ...updatableData } = salesData;
      updateSaleMutation.mutate(updatableData, { onSuccess: () => { onSaleAdded(); onClose(); } });
    } else {
      createSaleMutation.mutate(salesData, { onSuccess: () => { onSaleAdded(); onClose(); setFormData(initialFormData); } });
    }
  };
  
  const isLoading = customersLoading || warehousesLoading || categoriesLoading || accountsLoading || unitsLoading;
  const isSubmitting = createSaleMutation.isLoading || updateSaleMutation.isLoading;

  const getFilteredAccounts = useCallback((method) => {
    if (!accounts) return []; // Guard against accounts being undefined
    // Backend API defines accountType as "Cash", "Bank", "Mobile Banking"
    // The payment methods are also "Cash", "Bank", "Mobile Banking"
    // So direct comparison is fine
    return accounts
      .filter((acc) => acc.accountType === method)
      .map((acc) => ({
        value: acc._id,
        label: `${acc.accountName || acc.bankName || acc.serviceName} (${acc.accountNumber || acc.mobileNumber || ''})`,
      }));
  }, [accounts]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed p-4 inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
          <FormHeader title={isEditMode ? "Edit Sale" : "Add New Sale"} subtitle="Enter the details of the sale" onClose={onClose} />
          {isLoading ? <FormSkeleton /> : (
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SelectField label="Warehouse" value={formData.warehouseId} onChange={e => handleInputChange("warehouseId", e.target.value)} options={warehouses.map(w => ({ value: w._id, label: w.name }))} required icon={Home} disabled={isEditMode || isLoading} />
                <SelectField label="Category" value={formData.categoryId} onChange={e => handleInputChange("categoryId", e.target.value)} options={categories.map(c => ({ value: c._id, label: c.name }))} icon={Tag} disabled={isEditMode || !formData.warehouseId || isLoading} />
                <SelectField label="Product" value={formData.productId} onChange={e => handleProductChange(e.target.value)} options={products.map(p => ({ value: p._id, label: p.name }))} required icon={Package} disabled={isEditMode || !formData.warehouseId || isLoading} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <InputField label="Quantity" type="number" value={formData.quantity} onChange={e => handleInputChange("quantity", e.target.value)} required icon={Hash} min="0" step="0.01" />
                <SelectField label="Unit" value={formData.unit} onChange={e => handleUnitChange(e.target.value)} options={units.map(u => ({ value: u._id, label: u.name }))} required icon={Ruler} disabled={isLoading} />
                <InputField label="Price Per Unit" type="number" value={formData.pricePerUnit} onChange={e => handleInputChange("pricePerUnit", e.target.value)} required icon={DollarSign} min="0" step="0.01" />
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200"><p className="text-sm font-medium text-gray-700">Subtotal</p><p className="text-lg font-semibold text-gray-900">${totalAmount.toFixed(2)}</p></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField label="Customer Type" value={formData.customerType} onChange={e => handleInputChange("customerType", e.target.value)} options={[{ value: "existing", label: "Existing Customer" }, { value: "manual", label: "Manual Input" }]} required disabled={isEditMode} />
                <InputField label="Sale Date" type="datetime-local" value={formData.saleDate} onChange={e => handleInputChange("saleDate", e.target.value)} required icon={Calendar} />
              </div>
              {formData.customerType === 'existing' ? (
                <SelectField 
                  label="Select Customer" 
                  value={formData.customerId} 
                  onChange={e => {
                    const customer = customers.find(c => c._id === e.target.value);
                    if (customer) {
                      setFormData(prev => ({
                        ...prev,
                        customerId: customer._id,
                        customerName: customer.name,
                        customerPhone: customer.phone,
                        customerAddress: customer.location
                      }));
                    }
                  }} 
                  options={customers.map(c => ({ value: c._id, label: `${c.name} - ${c.phone}` }))} 
                  required 
                  icon={User} 
                  disabled={isEditMode || isLoading} 
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField label="Customer Name" value={formData.customerName} onChange={e => handleInputChange("customerName", e.target.value)} required icon={User} disabled={isEditMode} />
                  <InputField label="Phone Number" value={formData.customerPhone} onChange={e => handleInputChange("customerPhone", e.target.value)} icon={User} disabled={isEditMode} />
                  <InputField label="Address" value={formData.customerAddress} onChange={e => handleInputChange("customerAddress", e.target.value)} icon={User} disabled={isEditMode} />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Charges</label>
                {formData.charges.map((charge, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 items-end">
                    <InputField label={`Charge Name ${index + 1}`} value={charge.name} onChange={e => handleArrayField("charges", "update", index, { name: e.target.value })} />
                    <InputField label="Amount" type="number" value={charge.amount} onChange={e => handleArrayField("charges", "update", index, { amount: e.target.value })} min="0" step="0.01" />
                    <button type="button" onClick={() => handleArrayField("charges", "remove", index)} className="h-10 px-3 text-red-500 hover:bg-red-50 rounded-lg flex items-center justify-center"><MinusCircle size={20} /><span className="ml-2 text-sm">Remove</span></button>
                  </div>
                ))}
                <button type="button" onClick={() => handleArrayField("charges", "add", null, { newItem: { name: "", amount: "" } })} className="flex items-center space-x-2 text-sm text-primary hover:bg-primary-light px-3 py-2 rounded-lg"><PlusCircle size={16} /><span>Add Charge</span></button>
              </div>
              
              {!isEditMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Costs</label>
                {formData.costs.map((cost, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-3 items-end">
                    <InputField label={`Cost Name ${index + 1}`} value={cost.name} onChange={e => handleArrayField("costs", "update", index, { name: e.target.value })} />
                    <InputField label="Amount" type="number" value={cost.amount} onChange={e => handleArrayField("costs", "update", index, { amount: e.target.value })} min="0" step="0.01" />
                    <SelectField
                      label="Payment Method"
                      value={cost.method}
                      onChange={e => handleArrayField("costs", "update", index, { method: e.target.value, accountId: "" })}
                      options={[{ value: "Cash", label: "Cash" }, { value: "Bank", label: "Bank Transfer" }, { value: "Mobile Banking", label: "Mobile Banking" }]}
                    />
                    <SelectField
                      label="Account"
                      value={cost.accountId}
                      onChange={e => handleArrayField("costs", "update", index, { accountId: e.target.value })}
                      options={getFilteredAccounts(cost.method)}
                      required
                    />
                    <button type="button" onClick={() => handleArrayField("costs", "remove", index)} className="h-10 px-3 text-red-500 hover:bg-red-50 rounded-lg flex items-center justify-center"><MinusCircle size={20} /><span className="ml-2 text-sm">Remove</span></button>
                  </div>
                ))}
                <button type="button" onClick={() => handleArrayField("costs", "add", null, { newItem: { name: "", amount: "", method: "Cash", accountId: "" } })} className="flex items-center space-x-2 text-sm text-primary hover:bg-primary-light px-3 py-2 rounded-lg"><PlusCircle size={16} /><span>Add Cost</span></button>
              </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Discount" type="number" value={formData.discount} onChange={e => handleInputChange("discount", e.target.value)} icon={DollarSign} min="0" step="0.01" />
                <div className="p-3 bg-primary-light rounded-lg border border-primary-light"><p className="text-sm font-medium text-gray-700">Total Amount to be Paid</p><p className="text-xl font-bold text-primary">${totalAmountToBePaid.toFixed(2)}</p></div>
              </div>
              
              <SelectField label="Invoice Status" value={formData.invoiceStatus} onChange={e => handleInputChange("invoiceStatus", e.target.value)} options={[{ value: "Invoiced", label: "Invoiced" }, { value: "Not-invoiced", label: "Not Invoiced" }]} required icon={FileText} />

              {!isEditMode && formData.invoiceStatus === "Invoiced" && (
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
                    disabled={isLoading || (isEditMode && editData.invoiceStatus === "Invoiced")}
                  />

                  {formData.paymentStatus === "Paid payment" && (
                    <>
                      <SelectField
                        label="Payment Method"
                        name="payments[0].method"
                        value={formData.payments[0]?.method || ""}
                        onChange={(e) =>
                          handleArrayField("payments", "update", 0, {
                            method: e.target.value,
                            accountId: "",
                          })
                        }
                        options={[{ value: "Cash", label: "Cash" }, { value: "Bank", label: "Bank Transfer" }, { value: "Mobile Banking", label: "Mobile Banking" }]}
                        required
                        disabled={isLoading}
                      />

                      {(formData.payments[0]?.method === "Bank" ||
                        formData.payments[0]?.method === "Mobile Banking" ||
                        formData.payments[0]?.method === "Cash") && (
                        <SelectField
                          label="Account"
                          name="payments[0].accountId"
                          value={formData.payments[0]?.accountId || ""}
                          onChange={(e) =>
                            handleArrayField("payments", "update", 0, {
                              accountId: e.target.value,
                            })
                          }
                          options={getFilteredAccounts(
                            formData.payments[0]?.method
                          )}
                          required
                          disabled={isLoading}
                        />
                      )}
                    </>
                  )}
                </div>

                {formData.paymentStatus === "Due payment" && (
                    <div className="md:col-span-2 mt-4">
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
                            disabled={isLoading}
                          />

                          <InputField
                            label="Date"
                            type="datetime-local"
                            value={payment.date}
                            onChange={(e) =>
                              handleArrayField("payments", "update", index, {
                                date: e.target.value,
                              })
                            }
                            disabled={isLoading}
                          />

                          <SelectField
                            label="Method"
                            value={payment.method}
                            onChange={(e) =>
                              handleArrayField("payments", "update", index, {
                                method: e.target.value,
                                accountId: "",
                              })
                            }
                            options={[{ value: "Cash", label: "Cash" }, { value: "Bank", label: "Bank Transfer" }, { value: "Mobile Banking", label: "Mobile Banking" }]}
                            disabled={isLoading}
                          />

                          {(payment.method === "Bank" ||
                            payment.method === "Mobile Banking" ||
                            payment.method === "Cash") && (
                            <SelectField
                              label="Account"
                              value={payment.accountId}
                              onChange={(e) =>
                                handleArrayField("payments", "update", index, {
                                  accountId: e.target.value,
                                })
                              }
                              options={getFilteredAccounts(payment.method)}
                              required
                              disabled={isLoading}
                            />
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleArrayField("payments", "remove", index)
                            }
                            className="h-10 px-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                            disabled={isLoading}
                          >
                            <MinusCircle size={20} />
                            <span className="ml-2 text-sm">Remove</span>
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                            const now = new Date();
                            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                            const newPaymentDate = now.toISOString().slice(0, 16);
                            handleArrayField("payments", "add", null, {
                                newItem: {
                                amount: "",
                                date: newPaymentDate,
                                method: "",
                                accountId: "",
                                },
                            })
                        }}
                        className="flex items-center space-x-2 text-sm text-primary hover:text-primary-hover hover:bg-primary-light px-3 py-2 rounded-lg transition-colors"
                        disabled={isLoading}
                      >
                        <PlusCircle size={16} />
                        <span>Add Partial Payment</span>
                      </button>
                    </div>
                  )}
              </div>
            )}

              <TextAreaField label="Additional Notes" value={formData.notes} onChange={e => handleInputChange("notes", e.target.value)} rows={3} />
              <FormActions onCancel={onClose} isSaving={isSubmitting} saveText={isEditMode ? "Update Sale" : "Save Sale"} />
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddSales;
