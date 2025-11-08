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

const AddSales = ({ onClose, onSaleAdded, editData = null, isOpen = false }) => {
  const { baseUrl } = useContext(UrlContext);

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

  // Fetch data when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        const [productsRes, customersRes, warehousesRes, categoriesRes] = await Promise.all([
          axios.get(`${baseUrl}product/get-all-product`),
          axios.get(`${baseUrl}customer/get-customers`),
          axios.get(`${baseUrl}warehouse/get-all-warehouse`),
          axios.get(`${baseUrl}category/get`),
        ]);

        setProducts(productsRes.data.data || []);
        setCustomers(customersRes.data.data || []);
        setWarehouses(warehousesRes.data.data || []);
        setCategories(categoriesRes.data.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      }
    };

    fetchData();
  }, [baseUrl, isOpen]);

  // Filter products based on warehouse and category
  const availableProducts = useMemo(() => {
    if (!formData.warehouseId) return [];
    let filtered = products.filter(p => p.warehouse?._id === formData.warehouseId);
    if (formData.categoryId) {
      filtered = filtered.filter(p => p.category?._id === formData.categoryId);
    }
    return filtered;
  }, [products, formData.warehouseId, formData.categoryId]);

  // Calculate amounts
  const totalAmount = useMemo(() => {
    const quantity = parseFloat(formData.quantity) || 0;
    const price = parseFloat(formData.pricePerUnit) || 0;
    return quantity * price;
  }, [formData.quantity, formData.pricePerUnit]);

  const totalAmountToBePaid = useMemo(() => {
    const delivery = parseFloat(formData.deliveryCharge) || 0;
    const others = formData.otherCharges.reduce((acc, charge) =>
      acc + (parseFloat(charge.amount) || 0), 0
    );
    const discount = parseFloat(formData.discount) || 0;
    return totalAmount + delivery + others - discount;
  }, [totalAmount, formData.deliveryCharge, formData.otherCharges, formData.discount]);

  // Handle invoice status changes
  useEffect(() => {
    if (formData.invoiceStatus === "Not-invoiced") {
      setFormData(prev => ({ ...prev, paymentStatus: undefined, payments: [] }));
    } else if (formData.invoiceStatus === "Invoiced") {
      setFormData(prev => ({ ...prev, paymentStatus: "Due payment" }));
    }
  }, [formData.invoiceStatus]);

  // Handle payment status changes
  useEffect(() => {
    if (formData.invoiceStatus !== "Invoiced") return;

    if (formData.paymentStatus === "Paid payment") {
      setFormData(prev => ({
        ...prev,
        payments: [{
          amount: totalAmountToBePaid.toFixed(2),
          date: new Date().toISOString().split("T")[0],
          method: prev.payments[0]?.method || ""
        }]
      }));
    } else if (formData.paymentStatus === "Due payment") {
      setFormData(prev => ({ ...prev, payments: [] }));
    }
  }, [formData.paymentStatus, formData.invoiceStatus, totalAmountToBePaid]);


  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-fill unit and price when product is selected
    if (field === "productId" && value) {
      const product = products.find(p => p._id === value);
      if (product) {
        setFormData(prev => ({
          ...prev,
          unit: product.unit,
          pricePerUnit: product.unitPrice,
          categoryId: product.category?._id,
        }));
      }
    }
  };

  // Handle array field operations
  const handleArrayField = (field, action, index = null, updates = {}) => {
    setFormData(prev => {
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

    try {
      const loadingToast = toast.loading("Creating sale...");

      // Construct the payload according to the schema
      const salesData = {
        product: formData.productId,
        warehouse: formData.warehouseId,
        category: formData.categoryId,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        pricePerUnit: parseFloat(formData.pricePerUnit),
        saleDate: new Date(formData.saleDate),
        invoiceStatus: formData.invoiceStatus,
        deliveryCharge: parseFloat(formData.deliveryCharge) || 0,
        otherCharges: formData.otherCharges
          .filter(c => c.name && c.amount)
          .map(c => ({ name: c.name, amount: parseFloat(c.amount) || 0 })),
        discount: parseFloat(formData.discount) || 0,
        notes: formData.notes,
      };

      // Handle customer data based on type
      if (formData.customerType === "existing") {
        const selectedCustomer = customers.find(c => c.name === formData.customerName);
        if (selectedCustomer) {
          salesData.customer = {
            customerId: selectedCustomer._id,
            name: selectedCustomer.name,
            phone: selectedCustomer.phone,
            address: selectedCustomer.address,
          };
        }
      } else { // manual
        salesData.customer = {
          customerId: null,
          name: formData.customerName,
          phone: formData.customerPhone,
          address: formData.customerAddress,
        };
      }

      // Handle payment data only if invoiced
      if (salesData.invoiceStatus === "Invoiced") {
        salesData.paymentStatus = formData.paymentStatus;
        salesData.payments = formData.payments
          .filter(p => p.amount && p.date && p.method)
          .map(p => ({
            ...p,
            amount: parseFloat(p.amount) || 0,
            date: new Date(p.date),
          }));
      }

      const response = await axios.post(`${baseUrl}sales/create-sales`, salesData);
      toast.dismiss(loadingToast);

      if (response.data) {
        toast.success("Sale created successfully!");
        onSaleAdded(response.data);
        setFormData(initialFormData);
        onClose();
      }
    } catch (error) {
      console.error("Error creating sale:", error);
      toast.error(error.response?.data?.message || "Failed to create sale");
    }
  };

  // Options
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

              title={editData ? "Edit Sale" : "Add New Sale"}

              subtitle="Enter the details of the sale."

              onClose={onClose}

            />

  

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">

              {/* Product Details */}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                                <SelectField

                                                  label="Warehouse"

                                                  name="warehouseId"

                                                  value={formData.warehouseId}

                                                  onChange={(e) => handleInputChange("warehouseId", e.target.value)}

                                                  options={warehouses.map(w => ({ value: w._id, label: w.name }))}

                                                  required

                                                  icon={Home}

                                                />

                                                <SelectField

                                                  label="Category"

                                                  name="categoryId"

                                                  value={formData.categoryId}

                                                  onChange={(e) => handleInputChange("categoryId", e.target.value)}

                                                  options={categories.map(c => ({ value: c._id, label: c.name }))}

                                                  icon={Tag}

                                                  disabled={!formData.warehouseId}

                                                />

                                                <SelectField

                                                  label="Product Name"

                                                  name="productId"

                                                  value={formData.productId}

                                                  onChange={(e) => handleInputChange("productId", e.target.value)}

                                                  options={availableProducts.map(p => ({ value: p._id, label: p.name }))}

                                                  required

                                                  icon={Package}

                                                  disabled={!formData.warehouseId}

                                                />

              </div>

  

              {/* Pricing */}

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

                                                  onChange={(e) => handleInputChange("pricePerUnit", e.target.value)}

                                                  required

                                                  placeholder="0.00"

                                                  icon={DollarSign}

                                                  step="0.01"

                                                />

                <div className="space-y-2">

                  <label className="block text-sm font-medium text-gray-700">Total Amount</label>

                  <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 h-10 flex items-center">

                    <p className="text-lg font-semibold text-gray-900">${totalAmount.toFixed(2)}</p>

                  </div>

                </div>

              </div>

  

              {/* Customer & Date */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                                <SelectField

                                                  label="Customer Type"

                                                  name="customerType"

                                                  value={formData.customerType}

                                                  onChange={(e) => handleInputChange("customerType", e.target.value)}

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

                                                        onChange={(e) => handleInputChange("customerName", e.target.value)}

                                                        options={customers.map(c => ({ value: c.name, label: `${c.name} - ${c.phone}` }))}

                                                        required

                                                        icon={User}

                                                      />

                ) : formData.customerType === "manual" && (

                  <>

                                                            <InputField

                                                              label="Customer Name"

                                                              name="customerName"

                                                              value={formData.customerName}

                                                              onChange={(e) => handleInputChange("customerName", e.target.value)}

                                                              required

                                                              placeholder="Enter customer name"

                                                              icon={User}

                                                            />

                                                            <InputField

                                                              label="Phone Number"

                                                              name="customerPhone"

                                                              value={formData.customerPhone}

                                                              onChange={(e) => handleInputChange("customerPhone", e.target.value)}

                                                              placeholder="Enter phone number"

                                                              icon={User}

                                                            />

                                                            <InputField

                                                              label="Address"

                                                              name="customerAddress"

                                                              value={formData.customerAddress}

                                                              onChange={(e) => handleInputChange("customerAddress", e.target.value)}

                                                              placeholder="Enter address"

                                                              icon={User}

                                                            />

                  </>

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

  

              {/* Invoice & Charges */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                                <SelectField

                                                  label="Invoice Status"

                                                  name="invoiceStatus"

                                                  value={formData.invoiceStatus}

                                                  onChange={(e) => handleInputChange("invoiceStatus", e.target.value)}

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

                                                  onChange={(e) => handleInputChange("deliveryCharge", e.target.value)}

                                                  placeholder="0.00"

                                                  icon={Truck}

                                                  step="0.01"

                                                />

              </div>

  

              {/* Other Charges */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">Other Charges</label>

                {formData.otherCharges.map((charge, index) => (

                  <div key={index} className="flex items-center gap-4 mb-2">

                                                            <InputField

                                                              label={`Charge Name ${index + 1}`}

                                                              name={`otherCharges[${index}].name`}

                                                              value={charge.name}

                                                              onChange={(e) => handleArrayField("otherCharges", "update", index, { name: e.target.value })}

                                                              placeholder="e.g., Loading Charge"

                                                            />

                                                            <InputField

                                                              label="Amount"

                                                              name={`otherCharges[${index}].amount`}

                                                              type="number"

                                                              value={charge.amount}

                                                              onChange={(e) => handleArrayField("otherCharges", "update", index, { amount: e.target.value })}

                                                              placeholder="0.00"

                                                              step="0.01"

                                                            />

                    <button

                      type="button"

                      onClick={() => handleArrayField("otherCharges", "remove", index)}

                      className="text-red-500 hover:text-red-700 mt-7"

                    >

                      <MinusCircle size={20} />

                    </button>

                  </div>

                ))}

                <button

                  type="button"

                  onClick={() => handleArrayField("otherCharges", "add", null, { 

                    newItem: { name: "", amount: "" } 

                  })}

                  className="flex items-center space-x-2 text-sm text-[#003b75] hover:text-blue-700"

                >

                  <PlusCircle size={16} />

                  <span>Add More Charges</span>

                </button>

              </div>

  

              {/* Discount & Total */}

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

                  <label className="block text-sm font-medium text-gray-700">Total Amount to be Paid</label>

                  <div className="p-2 bg-blue-50 rounded-lg border border-blue-200 h-10 flex items-center">

                    <p className="text-xl font-bold text-[#003b75]">${totalAmountToBePaid.toFixed(2)}</p>

                  </div>

                </div>

              </div>

  

              {/* Payments */}

              {formData.invoiceStatus === "Invoiced" && (

                <div className="p-4 border-t border-gray-200">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                                            <SelectField

                                                              label="Payment Status"

                                                              name="paymentStatus"

                                                              value={formData.paymentStatus}

                                                              onChange={(e) => handleInputChange("paymentStatus", e.target.value)}

                                                              options={[

                                                                { value: "Due payment", label: "Due Payment" },

                                                                { value: "Paid payment", label: "Paid Payment" },

                                                              ]}

                                                              required

                                                              icon={DollarSign}

                                                            />

                    

                    {formData.paymentStatus === "Due payment" && (

                      <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">Partial Payments</label>

                        {formData.payments.map((payment, index) => (

                          <div key={index} className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 mb-2">

                                                                                    <InputField

                                                                                      label={`Payment ${index + 1}`}

                                                                                      name={`payments[${index}].amount`}

                                                                                      type="number"

                                                                                      value={payment.amount}

                                                                                      onChange={(e) => handleArrayField("payments", "update", index, { amount: e.target.value })}

                                                                                      placeholder="0.00"

                                                                                      step="0.01"

                                                                                    />

                                                                                    <InputField

                                                                                      label="Date"

                                                                                      name={`payments[${index}].date`}

                                                                                      type="date"

                                                                                      value={payment.date}

                                                                                      onChange={(e) => handleArrayField("payments", "update", index, { date: e.target.value })}

                                                                                    />

                                                                                    <SelectField

                                                                                      label="Payment Method"

                                                                                      name={`payments[${index}].method`}

                                                                                      value={payment.method}

                                                                                      onChange={(e) => handleArrayField("payments", "update", index, { method: e.target.value })}

                                                                                      options={paymentMethodOptions}

                                                                                    />

                            <button

                              type="button"

                              onClick={() => handleArrayField("payments", "remove", index)}

                              className="text-red-500 hover:text-red-700 mt-7"

                            >

                              <MinusCircle size={20} />

                            </button>

                          </div>

                        ))}

                        <button

                          type="button"

                          onClick={() => handleArrayField("payments", "add", null, {

                            newItem: { amount: "", date: new Date().toISOString().split("T")[0], method: "" }

                          })}

                          className="flex items-center space-x-2 text-sm text-[#003b75] hover:text-blue-700"

                        >

                          <PlusCircle size={16} />

                          <span>Add Partial Payment</span>

                        </button>

                      </div>

                    )}

                    

                    {formData.paymentStatus === "Paid payment" && (

                                                                  <SelectField

                                                                    label="Payment Method"

                                                                    name="payments[0].method"

                                                                    value={formData.payments[0]?.method || ""}

                                                                    onChange={(e) => handleArrayField("payments", "update", 0, { method: e.target.value })}

                                                                    options={paymentMethodOptions}

                                                                    required

                                                                  />

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

                                            rows={2}

                                          />

  

              <FormActions

                onCancel={onClose}

                onSave={handleSubmit}

                saveText={editData ? "Update Sale" : "Save Sale"}

              />

            </form>

          </motion.div>

        </motion.div>

      </AnimatePresence>

    );

  };

  

  export default AddSales;

  