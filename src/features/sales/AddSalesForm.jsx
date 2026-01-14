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
import { showSuccessToast, showErrorToast } from "@/utils/notifications";
import { useForm, useFieldArray, useWatch } from "react-hook-form";

import { useCustomers } from "@/api/hooks/customer";
import { useWarehouses } from "@/api/hooks/warehouse";
import { useCategories } from "@/api/hooks/category";
import { useAccounts } from "@/api/hooks/account";
import { useUnits } from "@/api/hooks/unit";
import { useProductsForSale } from "@/api/hooks/products";
import { useCreateSale, useUpdateSale } from "@/api/hooks/sales";
import { formatCurrency } from "@/utils/format";

import FormHeader from "@/components/ui/FormHeader";
import FormActions from "@/components/ui/FormActions";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import TextAreaField from "@/components/ui/TextAreaField";
import FormSkeleton from "./components/AddSaleFormSkeleton";
import Button from "@/components/ui/Button";

const AddSales = ({
  onClose,
  onSaleAdded,
  editData = null,
  isOpen = false,
}) => {
  const isEditMode = !!editData;

  const [newUploadedFiles, setNewUploadedFiles] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isValid, isSubmitting },
    watch,
    setValue,
  } = useForm({
    mode: "onChange",
    defaultValues: useMemo(() => {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      const saleDate = now.toISOString().slice(0, 16);

      if (isEditMode && editData) {
        const editedSaleDate = new Date(editData.saleDate);
        editedSaleDate.setMinutes(
          editedSaleDate.getMinutes() - editedSaleDate.getTimezoneOffset(),
        );

        return {
          warehouseId: editData.warehouse?.id || "",
          productId: editData.product?.id || "",
          categoryId: editData.product?.category?.id || "",
          quantity: editData.quantity || "",
          unit: editData.unit?.id || editData.unit || "",
          pricePerUnit: editData.pricePerUnit || "",
          customerType: editData.customer?.id ? "existing" : "manual",
          customerId: editData.customer?.id || "", // For existing customer
          customerName: editData.customer?.name || "",
          customerPhone: editData.customer?.phone || "",
          customerAddress: editData.customer?.address || "",
          saleDate: editedSaleDate.toISOString().slice(0, 16),
          invoiceStatus: editData.invoiceStatus || "Not-invoiced",
          charges: editData.charges || [],
          costs: editData.costs || [],
          discount: editData.discount || "",
          payments:
            editData.payments?.map((p) => {
              const paymentDate = p.date ? new Date(p.date) : null;
              if (paymentDate) {
                paymentDate.setMinutes(
                  paymentDate.getMinutes() - paymentDate.getTimezoneOffset(),
                );
              }
              return {
                ...p,
                id: p._id || Math.random(), // Add unique ID for useFieldArray
                date: paymentDate ? paymentDate.toISOString().slice(0, 10) : "",
                accountId: p.accountId?._id || p.accountId,
              };
            }) || [],
          notes: editData.notes || "",
        };
      }
      return {
        warehouseId: "",
        productId: "",
        categoryId: "",
        quantity: "",
        unit: "",
        pricePerUnit: "",
        customerType: "existing",
        customerId: "",
        customerName: "",
        customerPhone: "",
        customerAddress: "",
        saleDate,
        invoiceStatus: "Not-invoiced",
        charges: [], // Initial charge
        costs: [],
        discount: "",
        payments: [],
        notes: "",
      };
    }, [isEditMode, editData]),
  });

  // Data Fetching
  const { data: customersData, isLoading: customersLoading } = useCustomers();
  const { data: warehousesData, isLoading: warehousesLoading } =
    useWarehouses();
  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories();
  const { data: accountsData, isLoading: accountsLoading } = useAccounts();
  const { data: unitsData, isLoading: unitsLoading } = useUnits();

  const customers = customersData?.data || [];
  const warehouses = warehousesData?.data?.warehouses || [];
  const categories = categoriesData?.data || [];
  const accounts = accountsData?.data || [];
  const units = unitsData?.data || [];

  const watchedWarehouseId = watch("warehouseId");
  const watchedCategoryId = watch("categoryId");
  const { data: productsData, isLoading: productsLoading } = useProductsForSale(
    watchedWarehouseId,
    watchedCategoryId,
    {
      enabled: !!watchedWarehouseId,
    },
  );
  const products = Array.isArray(productsData?.data) ? productsData.data : [];

  const createSaleMutation = useCreateSale();
  const updateSaleMutation = useUpdateSale(editData?._id);

  const {
    fields: chargesFields,
    append: appendCharge,
    remove: removeCharge,
  } = useFieldArray({
    control,
    name: "charges",
  });
  const {
    fields: costsFields,
    append: appendCost,
    remove: removeCost,
  } = useFieldArray({
    control,
    name: "costs",
  });
  const {
    fields: paymentsFields,
    append: appendPayment,
    remove: removePayment,
  } = useFieldArray({
    control,
    name: "payments",
  });

  // Populate form for edit mode
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editData) {
        // Reset form with default values from editData
        reset({
          ...editData,
          warehouseId: editData.warehouse?.id || "",
          productId: editData.product?.id || "",
          categoryId: editData.product?.category?.id || "",
          unit: editData.unit?.id || editData.unit || "",
          customerType: editData.customer?.id ? "existing" : "manual",
          customerId: editData.customer?.id || "",
          customerName: editData.customer?.name || "",
          customerPhone: editData.customer?.phone || "",
          customerAddress: editData.customer?.address || "",
          saleDate: new Date(editData.saleDate).toISOString().slice(0, 16),
          payments:
            editData.payments?.map((p) => ({
              ...p,
              id: p._id || Math.random(),
              date: p.date ? new Date(p.date).toISOString().slice(0, 10) : "",
              accountId: p.accountId?._id || p.accountId,
            })) || [],
        });
        // Clear new uploaded files if any
        setNewUploadedFiles([]);
      } else {
        // Reset to initial form state for new sale
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        const saleDate = now.toISOString().slice(0, 16);
        reset({
          warehouseId: "",
          productId: "",
          categoryId: "",
          quantity: "",
          unit: "",
          pricePerUnit: "",
          customerType: "existing",
          customerId: "",
          customerName: "",
          customerPhone: "",
          customerAddress: "",
          saleDate,
          invoiceStatus: "Not-invoiced",
          charges: [],
          costs: [],
          discount: "",
          payments: [],
          notes: "",
        });
      }
    }
  }, [isEditMode, isOpen, editData, reset]);

  // Calculations
  const watchedQuantity = watch("quantity");
  const watchedPricePerUnit = watch("pricePerUnit");
  const watchedDiscount = watch("discount");

  // Use useWatch for dynamic fields to ensure reactivity
  const watchedCharges = useWatch({ control, name: "charges", defaultValue: [] });
  const watchedCosts = useWatch({ control, name: "costs", defaultValue: [] });

  const { totalAmount, totalAmountToBePaid } = useMemo(() => {
    const quantity = parseFloat(watchedQuantity) || 0;
    const pricePerUnit = parseFloat(watchedPricePerUnit) || 0;
    const total = quantity * pricePerUnit;

    const chargesTotal = (watchedCharges || []).reduce(
      (acc, charge) => acc + (parseFloat(charge.amount) || 0),
      0,
    );
    const costsTotal = (watchedCosts || []).reduce(
      (acc, cost) => acc + (parseFloat(cost.amount) || 0),
      0,
    );
    const discount = parseFloat(watchedDiscount) || 0;

    return {
      totalAmount: total,
      totalAmountToBePaid: total + chargesTotal + costsTotal - discount,
    };
  }, [
    watchedQuantity,
    watchedPricePerUnit,
    watchedDiscount,
    watchedCharges, // Depend on the useWatch outputs
    watchedCosts,   // Depend on the useWatch outputs
  ]);

  // Handlers
  const handleWarehouseChange = useCallback(
    (warehouseId) => {
      setValue("warehouseId", warehouseId);
      setValue("productId", "");
      setValue("categoryId", "");
      setValue("quantity", "");
      setValue("unit", "");
      setValue("pricePerUnit", "");
    },
    [setValue],
  );

  const handleProductChange = (productId) => {
    setValue("productId", productId, { shouldValidate: true });
    const product = products.find((p) => p._id === productId);
    if (product) {
      setValue("categoryId", product.category?._id || "", {
        shouldValidate: true,
      });
      setValue("unit", product.unit?._id || "", { shouldValidate: true }); // Fixed _id to id
      setValue("pricePerUnit", product.unitPrice ?? "", {
        shouldValidate: true,
      });
    } else {
      setValue("unit", "", { shouldValidate: true });
      setValue("pricePerUnit", "", { shouldValidate: true });
    }
  };

  const handleUnitChange = useCallback(
    (unitId) => {
      const productId = watch("productId");
      const product = products.find((p) => p._id === productId);
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
        setValue("unit", unitId);
        setValue("pricePerUnit", newPriceForSale.toFixed(2));
      } else {
        setValue("unit", unitId);
      }
    },
    [products, units, watch, setValue],
  );

  const handleInvoiceStatusChange = useCallback(
    (status) => {
      setValue("invoiceStatus", status);
      if (status === "Not-invoiced") {
        setValue("paymentStatus", "");
        setValue("payments", []);
      } else if (status === "Invoiced") {
        setValue("paymentStatus", "Due payment");
      }
    },
    [setValue],
  );

  const handlePaymentStatusChange = useCallback(
    (status) => {
      setValue("paymentStatus", status);
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      if (status === "Paid payment") {
        setValue("payments", [
          {
            id: Math.random(),
            amount: totalAmountToBePaid.toFixed(2),
            date: new Date().toISOString(),
            method: "",
            accountId: "",
          },
        ]);
      } else if (status === "Due payment") {
        setValue("payments", []);
      }
    },
    [totalAmountToBePaid, setValue],
  );

  const handleCustomerSelect = (customerId) => {
    const customer = customers.find((c) => c._id === customerId);
    if (customer) {
      setValue("customerId", customer._id);
      setValue("customerName", customer.name || "");
      setValue("customerPhone", customer.phone || "");
      setValue("customerAddress", customer.address || "");
    }
  };

  const handleSubmitForm = async (data) => {
    const selectedCustomer =
      data.customerType === "existing"
        ? customers.find((c) => c._id === data.customerId)
        : null;

    const salesData = {
      quantity: parseFloat(data.quantity),
      unit: data.unit,
      pricePerUnit: parseFloat(data.pricePerUnit),
      saleDate: new Date(data.saleDate).toISOString(),
      invoiceStatus: data.invoiceStatus,
      charges: data.charges
        .filter((c) => c.name && c.amount)
        .map((c) => ({ ...c, amount: parseFloat(c.amount) })),
      costs: data.costs
        .filter((c) => c.name && c.amount && c.accountId)
        .map((c) => ({
          name: c.name,
          amount: parseFloat(c.amount),
          accountId: c.accountId,
          paymentMethod: c.method,
          date: new Date().toISOString(),
        })),
      discount: parseFloat(data.discount) || 0,
      notes: data.notes,
      product: data.productId,
      warehouse: data.warehouseId,
      category: data.categoryId,
      customer:
        data.customerType === "existing"
          ? {
              customerId: selectedCustomer?._id,
              name: selectedCustomer?.name || "",
              phone: selectedCustomer?.phone || "",
            }
          : {
              customerId: null,
              name: data.customerName,
              phone: data.customerPhone,
              address: data.customerAddress,
            },
      paymentStatus: data.paymentStatus,
      payments: data.payments
        .map((p) => ({
          amount: parseFloat(p.amount) || 0,
          date: new Date(p.date).toISOString(),
          method: p.method,
          accountId: p.accountId,
        }))
        .filter((p) => p.amount > 0 && p.method && p.accountId),
    };

    const mutationOptions = {
      onSuccess: () => {
        onSaleAdded?.();
        onClose();
      },
    };

    if (isEditMode) {
      const {
        customer,
        costs,
        payments,
        product,
        warehouse,
        category,
        ...updatableData
      } = salesData;
      updateSaleMutation.mutate(
        { id: editData._id, ...updatableData },
        mutationOptions,
      );
    } else {
      createSaleMutation.mutate(salesData, mutationOptions);
    }
  };

  const isInitialLoading =
    customersLoading ||
    warehousesLoading ||
    categoriesLoading ||
    accountsLoading ||
    unitsLoading;

  const getFilteredAccounts = useCallback(
    (method) => {
      if (!accounts) return [];
      return accounts
        .filter((acc) => acc.accountType === method)
        .map((acc) => ({
          value: acc._id,
          label: `${acc.accountName || acc.bankName || acc.serviceName} (${acc.accountNumber || acc.mobileNumber || ""})`,
        }));
    },
    [accounts],
  );

  // Watch fields for conditional rendering
  const watchedCustomerType = watch("customerType");
  const watchedInvoiceStatus = watch("invoiceStatus");
  const watchedPaymentStatus = watch("paymentStatus");

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
          className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <FormHeader
            title={isEditMode ? "Edit Sale" : "Add New Sale"}
            subtitle="Enter the details of the sale"
            onClose={onClose}
          />
          {isInitialLoading ? (
            <FormSkeleton />
          ) : (
            <form
              onSubmit={handleSubmit(handleSubmitForm)}
              className="p-5 space-y-4 sm:space-y-6 overflow-y-auto flex-grow"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SelectField
                  label="Warehouse"
                  name="warehouseId"
                  register={register}
                  error={errors.warehouseId?.message}
                  options={warehouses.map((w) => ({
                    value: w._id,
                    label: w.name,
                  }))}
                  validation={{ required: "Warehouse is required" }}
                  icon={Home}
                  disabled={isEditMode || isInitialLoading}
                  onChange={(e) => {
                    setValue("warehouseId", e.target.value, {
                      shouldValidate: true,
                    });
                    handleWarehouseChange(e.target.value);
                  }}
                />
                <SelectField
                  label="Category"
                  name="categoryId"
                  register={register}
                  error={errors.categoryId?.message}
                  options={categories.map((c) => ({
                    value: c._id,
                    label: c.name,
                  }))}
                  icon={Tag}
                  disabled={
                    isEditMode || !watchedWarehouseId || productsLoading
                  }
                  validation={{ required: "Category is required" }}
                  onChange={(e) => {
                    setValue("categoryId", e.target.value, {
                      shouldValidate: true,
                    });
                    setValue("productId", "");
                    setValue("unit", "");
                    setValue("pricePerUnit", "");
                  }}
                />
                <SelectField
                  label="Product"
                  name="productId"
                  register={register}
                  error={errors.productId?.message}
                  options={products.map((p) => ({
                    value: p._id,
                    label: `${p.name} (Qty: ${p.quantity})`,
                  }))}
                  validation={{ required: "Product is required" }}
                  icon={Package}
                  disabled={
                    isEditMode || !watchedWarehouseId || productsLoading
                  }
                  loading={productsLoading}
                  onChange={(e) => {
                    handleProductChange(e.target.value);
                  }}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <InputField
                  label="Quantity"
                  name="quantity"
                  type="number"
                  register={register}
                  error={errors.quantity?.message}
                  icon={Hash}
                  validation={{
                    required: "Quantity is required",
                    min: {
                      value: 0.01,
                      message: "Quantity must be greater than 0",
                    },
                    valueAsNumber: true,
                    validate: (value) => {
                      const selectedProductId = watch("productId");
                      const selectedProduct = products.find(
                        (p) => p._id === selectedProductId,
                      );

                      if (!selectedProduct) return true; // Let product validation handle missing product

                      // Check if we are in edit mode and if the product hasn't changed
                      if (
                        isEditMode &&
                        editData &&
                        editData.product &&
                        editData.product.id === selectedProductId
                      ) {
                        // In edit mode, we need to account for the quantity already in the sale.
                        // However, product.quantity from API usually reflects *current* available stock.
                        // If we are increasing quantity, we need to check if (newQty - oldQty) <= currentStock.
                        const oldQty = parseFloat(editData.quantity || 0);
                        const newQty = parseFloat(value || 0);
                        const diff = newQty - oldQty;

                        if (diff > 0 && diff > selectedProduct.quantity) {
                          return `Exceeds available stock. You can add up to ${selectedProduct.quantity} more units.`;
                        }
                        return true;
                      }

                      if (parseFloat(value) > selectedProduct.quantity) {
                        return `Exceeds available stock (Current: ${selectedProduct.quantity})`;
                      }
                      return true;
                    },
                  }}
                />
                <SelectField
                  label="Unit"
                  name="unit"
                  register={register}
                  value={watch("unit")}
                  error={errors.unit?.message}
                  options={units.map((u) => ({ value: u._id, label: u.name }))}
                  validation={{ required: "Unit is required" }}
                  icon={Ruler}
                  disabled={isInitialLoading}
                  onChange={(e) => {
                    setValue("unit", e.target.value, { shouldValidate: true });
                    handleUnitChange(e.target.value);
                  }}
                />
                <InputField
                  label="Price Per Unit"
                  name="pricePerUnit"
                  type="number"
                  register={register}
                  error={errors.pricePerUnit?.message}
                  icon={DollarSign}
                  validation={{
                    required: "Price Per Unit is required",
                    min: { value: 0, message: "Price cannot be negative" },
                    valueAsNumber: true,
                  }}
                />
                <div className="p-3 bg-[var(--color-primary-light)] rounded-lg border border-[var(--color-primary-light)]">
                  <p className="text-sm font-medium text-gray-700">Subtotal</p>
                  <p className="text-lg font-semibold text-[var(--color-primary)]">
                    {formatCurrency(totalAmount)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  label="Customer Type"
                  name="customerType"
                  register={register}
                  error={errors.customerType?.message}
                  options={[
                    { value: "existing", label: "Existing Customer" },
                    { value: "manual", label: "Manual Input" },
                  ]}
                  validation={{ required: "Customer type is required" }}
                  disabled={isEditMode}
                  onChange={(e) => {
                    setValue("customerType", e.target.value);
                    if (e.target.value === "manual") {
                      setValue("customerId", "");
                    } else {
                      setValue("customerName", "");
                      setValue("customerPhone", "");
                      setValue("customerAddress", "");
                    }
                  }}
                />
                <InputField
                  label="Sale Date"
                  name="saleDate"
                  type="datetime-local"
                  register={register}
                  error={errors.saleDate?.message}
                  validation={{
                    required: "Sale Date is required",
                  }}
                  icon={Calendar}
                />
              </div>
              {watchedCustomerType === "existing" ? (
                <SelectField
                  label="Select Customer"
                  name="customerId"
                  register={register}
                  error={errors.customerId?.message}
                  options={customers.map((c) => ({
                    value: c._id,
                    label: `${c.name} - ${c.phone}`,
                  }))}
                  validation={{ required: "Customer is required" }}
                  icon={User}
                  disabled={isEditMode || isInitialLoading}
                  onChange={(e) => {
                    setValue("customerId", e.target.value, {
                      shouldValidate: true,
                    });
                    handleCustomerSelect(e.target.value);
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField
                    label="Customer Name"
                    name="customerName"
                    register={register}
                    error={errors.customerName?.message}
                    validation={{ required: "Customer Name is required" }}
                    icon={User}
                    disabled={isEditMode}
                  />
                  <InputField
                    label="Phone Number"
                    name="customerPhone"
                    register={register}
                    error={errors.customerPhone?.message}
                    icon={User}
                    disabled={isEditMode}
                  />
                  <InputField
                    label="Address"
                    name="customerAddress"
                    register={register}
                    error={errors.customerAddress?.message}
                    icon={User}
                    disabled={isEditMode}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Charges
                </label>
                <AnimatePresence>
                  {chargesFields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 items-end"
                    >
                      <InputField
                        label={`Charge Name ${index + 1}`}
                        name={`charges.${index}.name`}
                        register={register}
                        error={errors.charges?.[index]?.name?.message}
                        validation={{ required: "Charge name is required" }}
                        disabled={isSubmitting}
                      />
                      <InputField
                        label="Amount"
                        name={`charges.${index}.amount`}
                        type="number"
                        register={register}
                        error={errors.charges?.[index]?.amount?.message}
                        validation={{
                          required: "Charge amount is required",
                          min: {
                            value: 0,
                            message: "Amount cannot be negative",
                          },
                          valueAsNumber: true,
                        }}
                        disabled={isSubmitting}
                      />
                      <Button
                        type="button"
                        onClick={() => removeCharge(index)}
                        variant="subtle"
                        className="!h-10 text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] flex items-center justify-center"
                        disabled={isSubmitting}
                      >
                        <MinusCircle size={20} className="mr-2" />
                        <span className="text-sm">Remove</span>
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <Button
                  type="button"
                  onClick={() => appendCharge({ name: "", amount: "" })}
                  variant="secondary"
                  className="mt-2 text-primary hover:bg-primary-light px-3 py-2 rounded-lg"
                  disabled={isSubmitting}
                >
                  <PlusCircle size={16} className="mr-2" />
                  <span>Add Charge</span>
                </Button>
              </div>

              {isEditMode && (
                <div className="p-4 bg-blue-50 text-blue-700 rounded-md border border-blue-200 mb-4">
                  <p className="text-sm flex items-center gap-2">
                    <FileText size={16} />
                    <span>
                      <strong>Note:</strong> Costs and Payments cannot be edited
                      directly in this form to preserve financial ledger
                      integrity.
                    </span>
                  </p>
                </div>
              )}

              {!isEditMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Costs
                  </label>
                  <AnimatePresence>
                    {costsFields.map((field, index) => (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-3 items-end"
                      >
                        <InputField
                          label={`Cost Name ${index + 1}`}
                          name={`costs.${index}.name`}
                          register={register}
                          error={errors.costs?.[index]?.name?.message}
                          validation={{ required: "Cost name is required" }}
                          disabled={isSubmitting}
                        />
                                                                            <InputField
                                                                              label="Amount"
                                                                              name={`costs.${index}.amount`}
                                                                              type="number"
                                                                              register={register}
                                                                              error={errors.costs?.[index]?.amount?.message}
                                                                              validation={{
                                                                                required: "Cost amount is required",
                                                                                min: {
                                                                                  value: 0,
                                                                                  message: "Amount cannot be negative",
                                                                                },
                                                                                valueAsNumber: true,
                                                                              }}
                                                                              disabled={isSubmitting}
                                                                            />                        <SelectField
                          label="Payment Method"
                          name={`costs.${index}.method`}
                          register={register}
                          error={errors.costs?.[index]?.method?.message}
                          options={[
                            { value: "Cash", label: "Cash" },
                            { value: "Bank", label: "Bank Transfer" },
                            {
                              value: "Mobile Banking",
                              label: "Mobile Banking",
                            },
                          ]}
                          validation={{
                            required: "Payment method is required",
                          }}
                          disabled={isSubmitting}
                        />
                        <SelectField
                          label="Account"
                          name={`costs.${index}.accountId`}
                          register={register}
                          error={errors.costs?.[index]?.accountId?.message}
                          options={getFilteredAccounts(
                            watch(`costs.${index}.method`),
                          )}
                          validation={{ required: "Account is required" }}
                          disabled={isSubmitting}
                        />
                        <Button
                          type="button"
                          onClick={() => removeCost(index)}
                          variant="subtle"
                          className="!h-10 text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] flex items-center justify-center"
                          disabled={isSubmitting}
                        >
                          <MinusCircle size={20} className="mr-2" />
                          <span className="text-sm">Remove</span>
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <Button
                    type="button"
                    onClick={() =>
                      appendCost({
                        name: "",
                        amount: "",
                        method: "Cash",
                        accountId: "",
                      })
                    }
                    variant="secondary"
                    className="mt-2 text-primary hover:bg-primary-light px-3 py-2 rounded-lg"
                    disabled={isSubmitting}
                  >
                    <PlusCircle size={16} className="mr-2" />
                    <span>Add Cost</span>
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Discount"
                  name="discount"
                  type="number"
                  register={register}
                  error={errors.discount?.message}
                  icon={DollarSign}
                  validation={{
                    min: { value: 0, message: "Discount cannot be negative" },
                    valueAsNumber: true,
                  }}
                  disabled={isSubmitting}
                />
                <div className="p-3 bg-[var(--color-primary-light)] rounded-lg border border-[var(--color-primary-light)]">
                  <p className="text-sm font-medium text-gray-700">
                    Total Amount to be Paid
                  </p>
                  <p className="text-xl font-bold text-[var(--color-primary)]">
                    {formatCurrency(totalAmountToBePaid)}
                  </p>
                </div>
              </div>

              <SelectField
                label="Invoice Status"
                name="invoiceStatus"
                register={register}
                error={errors.invoiceStatus?.message}
                options={[
                  { value: "Invoiced", label: "Invoiced" },
                  { value: "Not-invoiced", label: "Not Invoiced" },
                ]}
                validation={{ required: "Invoice Status is required" }}
                icon={FileText}
                disabled={isSubmitting}
                onChange={(e) => {
                  setValue("invoiceStatus", e.target.value, {
                    shouldValidate: true,
                  });
                  handleInvoiceStatusChange(e.target.value);
                }}
              />

              {!isEditMode && watchedInvoiceStatus === "Invoiced" && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField
                      label="Payment Status"
                      name="paymentStatus"
                      register={register}
                      error={errors.paymentStatus?.message}
                      value={watchedPaymentStatus}
                      options={[
                        { value: "Due payment", label: "Due Payment" },
                        { value: "Paid payment", label: "Paid Payment" },
                      ]}
                      validation={{ required: "Payment Status is required" }}
                      icon={DollarSign}
                      disabled={
                        isSubmitting ||
                        (isEditMode && editData.invoiceStatus === "Invoiced")
                      }
                      onChange={(e) => {
                        setValue("paymentStatus", e.target.value, {
                          shouldValidate: true,
                        });
                        handlePaymentStatusChange(e.target.value);
                      }}
                    />

                    {watchedPaymentStatus === "Paid payment" && (
                      <>
                        <InputField
                          label="Amount"
                          name="payments.0.amount"
                          type="number"
                          register={register}
                          error={errors.payments?.[0]?.amount?.message}
                          value={totalAmountToBePaid.toFixed(2)} // Always display the full amount
                          disabled={isSubmitting || watchedPaymentStatus === "Paid payment"} // Disable when paid status is selected
                        />
                        <SelectField
                          label="Payment Method"
                          name="payments.0.method"
                          register={register}
                          error={errors.payments?.[0]?.method?.message}
                          options={[
                            { value: "Cash", label: "Cash" },
                            { value: "Bank", label: "Bank Transfer" },
                            { 
                              value: "Mobile Banking",
                              label: "Mobile Banking",
                            },
                          ]}
                          validation={{
                            required: "Payment Method is required",
                          }}
                          disabled={isSubmitting}
                        />

                        {(watch("payments.0.method") === "Bank" ||
                          watch("payments.0.method") === "Mobile Banking" ||
                          watch("payments.0.method") === "Cash") && (
                          <SelectField
                            label="Account"
                            name="payments.0.accountId"
                            register={register}
                            error={errors.payments?.[0]?.accountId?.message}
                            options={getFilteredAccounts(
                              watch("payments.0.method"),
                            )}
                            validation={{ required: "Account is required" }}
                            disabled={isSubmitting}
                          />
                        )}
                      </>
                    )}
                  </div>

                  {watchedPaymentStatus === "Due payment" && (
                    <div className="md:col-span-2 mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Partial Payments
                      </label>
                      <AnimatePresence>
                        {paymentsFields.map((field, index) => (
                          <motion.div
                            key={field.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-3 items-end"
                          >
                            <InputField
                              label="Amount"
                              name={`payments.${index}.amount`}
                              type="number"
                              register={register}
                              error={errors.payments?.[index]?.amount?.message}
                              validation={{
                                required: "Amount is required",
                                min: {
                                  value: 0.01,
                                  message: "Amount must be positive",
                                },
                                valueAsNumber: true,
                              }}
                              disabled={isSubmitting}
                            />

                            <SelectField
                              label="Method"
                              name={`payments.${index}.method`}
                              register={register}
                              error={errors.payments?.[index]?.method?.message}
                              options={[
                                { value: "Cash", label: "Cash" },
                                { value: "Bank", label: "Bank Transfer" },
                                {
                                  value: "Mobile Banking",
                                  label: "Mobile Banking",
                                },
                              ]}
                              validation={{
                                required: "Payment method is required",
                              }}
                              disabled={isSubmitting}
                            />

                            {(watch(`payments.${index}.method`) === "Bank" ||
                              watch(`payments.${index}.method`) ===
                                "Mobile Banking" ||
                              watch(`payments.${index}.method`) === "Cash") && (
                              <SelectField
                                label="Account"
                                name={`payments.${index}.accountId`}
                                register={register}
                                error={
                                  errors.payments?.[index]?.accountId?.message
                                }
                                options={getFilteredAccounts(
                                  watch(`payments.${index}.method`),
                                )}
                                validation={{ required: "Account is required" }}
                                disabled={isSubmitting}
                              />
                            )}

                            <Button
                              type="button"
                              onClick={() => removePayment(index)}
                              variant="subtle"
                              className="!h-10 text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] flex items-center justify-center"
                              disabled={isSubmitting}
                            >
                              <MinusCircle size={20} className="mr-2" />
                              <span className="text-sm">Remove</span>
                            </Button>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      <Button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          now.setMinutes(
                            now.getMinutes() - now.getTimezoneOffset(),
                          );
                          appendPayment({
                            id: Math.random(),
                            amount: "",
                            date: new Date().toISOString(),
                            method: "",
                            accountId: "",
                          });
                        }}
                        variant="secondary"
                        className="mt-2 text-primary hover:bg-primary-light px-3 py-2 rounded-lg"
                        disabled={isSubmitting}
                      >
                        <PlusCircle size={16} className="mr-2" />
                        <span>Add Partial Payment</span>
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <TextAreaField
                label="Additional Notes"
                name="notes"
                register={register}
                error={errors.notes?.message}
                rows={3}
                disabled={isSubmitting}
              />
              <FormActions
                onCancel={onClose}
                isSaving={isSubmitting}
                saveText={isEditMode ? "Update Sale" : "Save Sale"}
              />
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddSales;
