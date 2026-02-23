import React, { useState, useEffect, useMemo } from "react";
import { useForm, useWatch, useFieldArray } from "react-hook-form";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { DollarSign, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";

import { useCustomers } from "@/api/hooks/customer";
import { useWarehouses } from "@/api/hooks/warehouse";
import { useCategories } from "@/api/hooks/category";
import { useAccounts } from "@/api/hooks/account";
import { useUnits } from "@/api/hooks/unit";
import { useProductsForSale } from "@/api/hooks/products";
import { useCreateSale, useUpdateSale } from "@/api/hooks/sales";

import { useSettings } from "@/context/SettingsContext";

import FormHeader from "@/components/ui/FormHeader";
import FormActions from "@/components/ui/FormActions";
import FormSkeleton from "./components/AddSaleFormSkeleton";

// Imported Sub-components
import SaleProductSelect from "./components/AddSalesForm/SaleProductSelect";
import SaleCustomerSelect from "./components/AddSalesForm/SaleCustomerSelect";
import SaleFinancials from "./components/AddSalesForm/SaleFinancials";

const AddSales = ({
  onClose,
  onSaleAdded,
  editData = null,
  isOpen = false,
}) => {
  const isEditMode = !!editData;
  const [, setNewUploadedFiles] = useState([]);
  const { formatCurrency } = useSettings();

  // Block background interaction and auto-fill when modal is open
  useEffect(() => {
    if (isOpen) {
      const root = document.getElementById("root");
      if (root) {
        root.setAttribute("inert", "");
        root.style.pointerEvents = "none";
        root.style.userSelect = "none";
      }
    } else {
      const root = document.getElementById("root");
      if (root) {
        root.removeAttribute("inert");
        root.style.pointerEvents = "";
        root.style.userSelect = "";
      }
    }
    return () => {
      const root = document.getElementById("root");
      if (root) {
        root.removeAttribute("inert");
        root.style.pointerEvents = "";
        root.style.userSelect = "";
      }
    };
  }, [isOpen]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
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

        // Extract IDs robustly. The backend projects nested objects with 'id' field in getSaleById.
        const warehouseId =
          editData.warehouse?.id ||
          editData.warehouse?._id ||
          editData.warehouse ||
          "";
        const productId =
          editData.product?.id ||
          editData.product?._id ||
          editData.product ||
          "";
        const categoryId =
          editData.category?.id ||
          editData.category?._id ||
          editData.product?.category?.id ||
          editData.product?.category?._id ||
          editData.category ||
          "";
        const unitId =
          editData.unit?.id || editData.unit?._id || editData.unit || "";
        const customerId =
          editData.customer?.id ||
          editData.customer?.customerId?.id ||
          editData.customer?.customerId?._id ||
          editData.customer?.customerId ||
          "";

        const costs =
          editData.costs?.map((c) => ({
            ...c,
            method: c.paymentMethod || c.method || "",
            accountId: c.accountId?.id || c.accountId?._id || c.accountId || "",
          })) || [];

        return {
          warehouseId,
          categoryId,
          items: editData.items?.map(i => ({
            productId: i.product?._id || i.product,
            quantity: i.quantity,
            unit: i.unit?._id || i.unit,
            pricePerUnit: i.pricePerUnit,
            total: i.total || (i.quantity * i.pricePerUnit)
          })) || [{ // Fallback for old single-product sales being edited
            productId: productId,
            quantity: editData.quantity,
            unit: unitId,
            pricePerUnit: editData.pricePerUnit
          }],
          customerType: customerId ? "existing" : "manual",
          customerId: customerId,
          customerName: editData.customer?.name || "",
          customerPhone: editData.customer?.phone || "",
          customerAddress: editData.customer?.address || "",
          saleDate: editedSaleDate.toISOString().slice(0, 16),
          invoiceStatus: editData.invoiceStatus || "Not-invoiced",
          paymentStatus: editData.paymentStatus || "",
          charges: editData.charges || [],
          costs,
          discount: editData.discount || "",
          payments:
            editData.payments?.map((p) => ({
              ...p,
              id: p._id || Math.random(),
              date: p.date
                ? new Date(p.date).toISOString().slice(0, 16)
                : new Date().toISOString().slice(0, 16),
              accountId: p.accountId?.id || p.accountId?._id || p.accountId,
            })) || [],
          notes: editData.notes || "",
        };
      }
      return {
        warehouseId: "",
        categoryId: "",
        items: [],
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

  const customers = useMemo(() => customersData?.data || [], [customersData]);
  const warehouses = useMemo(
    () => warehousesData?.data?.warehouses || [],
    [warehousesData],
  );
  const categories = useMemo(
    () => categoriesData?.data || [],
    [categoriesData],
  );
  const accounts = useMemo(() => accountsData?.data || [], [accountsData]);
  const units = useMemo(() => unitsData?.data || [], [unitsData]);

  const watchedWarehouseId = watch("warehouseId");
  const watchedCategoryId = watch("categoryId");
  const { data: productsData, isLoading: productsLoading } = useProductsForSale(
    watchedWarehouseId,
    watchedCategoryId,
    { enabled: !!watchedWarehouseId },
  );
  const products = useMemo(
    () => (Array.isArray(productsData?.data) ? productsData.data : []),
    [productsData],
  );

  const watchedCustomerType = watch("customerType");
  const watchedCustomerId = watch("customerId");
  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c._id === watchedCustomerId);
  }, [customers, watchedCustomerId]);

  const createSaleMutation = useCreateSale();
  const updateSaleMutation = useUpdateSale(editData?._id);

  // Re-populate form on open/edit (Simplified effect logic)
  useEffect(() => {
    if (isOpen) {
      // Just relying on defaultValues useMemo for initial state mostly, but reset is needed for re-opening
      // ... (Same reset logic as original if needed, or rely on key prop in modal)
      // For brevity using the same logic block mainly to handle the reset triggers:

      if (isEditMode && editData) {
        const editedSaleDate = new Date(editData.saleDate);
        editedSaleDate.setMinutes(
          editedSaleDate.getMinutes() - editedSaleDate.getTimezoneOffset(),
        );
        const warehouseId =
          editData.warehouse?.id ||
          editData.warehouse?._id ||
          editData.warehouse ||
          "";
        const productId =
          editData.product?.id ||
          editData.product?._id ||
          editData.product ||
          "";
        const categoryId =
          editData.category?.id ||
          editData.category?._id ||
          editData.product?.category?.id ||
          editData.product?.category?._id ||
          editData.category ||
          "";
        const unitId =
          editData.unit?.id || editData.unit?._id || editData.unit || "";
        const customerId =
          editData.customer?.id ||
          editData.customer?.customerId?.id ||
          editData.customer?.customerId?._id ||
          editData.customer?.customerId ||
          "";

        const costs =
          editData.costs?.map((c) => ({
            ...c,
            method: c.paymentMethod || c.method || "",
            accountId: c.accountId?.id || c.accountId?._id || c.accountId || "",
          })) || [];

        reset({
          ...editData,
          warehouseId,
          categoryId,
          items: editData.items?.map(i => ({
            productId: i.product?._id || i.product,
            quantity: i.quantity,
            unit: i.unit?._id || i.unit,
            pricePerUnit: i.pricePerUnit,
            total: i.total || (i.quantity * i.pricePerUnit)
          })) || [{ // Fallback
            productId,
            quantity: editData.quantity,
            unit: unitId,
            pricePerUnit: editData.pricePerUnit
          }],
          customerType: customerId ? "existing" : "manual",
          customerId: customerId,
          customerName: editData.customer?.name || "",
          customerPhone: editData.customer?.phone || "",
          customerAddress: editData.customer?.address || "",
          saleDate: editedSaleDate.toISOString().slice(0, 16),
          paymentStatus: editData.paymentStatus || "",
          costs,
          payments:
            editData.payments?.map((p) => ({
              ...p,
              id: p._id || Math.random(),
              date: p.date
                ? new Date(p.date).toISOString().slice(0, 16)
                : new Date().toISOString().slice(0, 16),
              accountId: p.accountId?.id || p.accountId?._id || p.accountId,
            })) || [],
        });
        setNewUploadedFiles([]);
      } else {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        const saleDate = now.toISOString().slice(0, 16);
        reset({
          warehouseId: "",
          categoryId: "",
          items: [],
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
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Calculations
  const watchedItems = useWatch({ control, name: "items", defaultValue: [] });
  const watchedDiscount = watch("discount");
  const watchedCharges = useWatch({
    control,
    name: "charges",
    defaultValue: [],
  });
  const watchedCosts = useWatch({ control, name: "costs", defaultValue: [] });

  const { totalAmount, totalAmountToBePaid } = useMemo(() => {
    const itemsTotal = (watchedItems || []).reduce((acc, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.pricePerUnit) || 0;
      return acc + (qty * price);
    }, 0);

    const chargesTotal = (watchedCharges || []).reduce(
      (acc, c) => acc + (parseFloat(c.amount) || 0),
      0,
    );
    const costsTotal = (watchedCosts || []).reduce(
      (acc, c) => acc + (parseFloat(c.amount) || 0),
      0,
    );
    const discount = parseFloat(watchedDiscount) || 0;
    return {
      totalAmount: itemsTotal,
      totalAmountToBePaid: itemsTotal + chargesTotal + costsTotal - discount,
    };
  }, [
    watchedItems,
    watchedDiscount,
    watchedCharges,
    watchedCosts,
  ]);

  const handleSubmitForm = async (data) => {
    const selectedCustomer =
      data.customerType === "existing"
        ? customers.find((c) => c._id === data.customerId)
        : null;

    const salesData = {
      items: data.items.map(item => ({
        product: item.productId,
        quantity: parseFloat(item.quantity),
        unit: item.unit,
        pricePerUnit: parseFloat(item.pricePerUnit)
      })),
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
      warehouse: data.warehouseId,
      category: data.categoryId || null,
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
        .map((p) => {
          const payment = {
            amount: parseFloat(p.amount) || 0,
            date: new Date(p.date).toISOString(),
            method: p.method,
          };
          // Only include accountId for non-credit payments
          if (p.method !== "Customer Credit" && p.accountId) {
            payment.accountId = p.accountId;
          }
          return payment;
        })
        .filter((p) => p.amount > 0 && p.method && (p.accountId || p.method === "Customer Credit")),
    };

    // Strict Check: Prevent updating if New Total < Already Paid
    if (isEditMode && editData?.invoiceStatus === "Invoiced") {
      const originalTotalPaid = editData.paymentsMade ?? (editData.payments?.reduce((acc, p) => acc + (p.amount || 0), 0) || 0);
      // Calculate new total from the processed salesData (which includes items, charges, costs, discount)
      // We can iterate salesData.items to get total, or easier: rely on the `totalAmountToBePaid` from useMemo which should be sync'd with form state
      // BUT, handleSubmit receives `data` which might be slightly different if useMemo hasn't updated (unlikely for final submit).
      // To be safe, let's use the `totalAmountToBePaid` from local scope (it is calculated from watched values).

      // Note: totalAmountToBePaid in scope is based on current form values.
      // However, `data` is passed to this function.
      // The `totalAmountToBePaid` variable is derived from `watchedItems` etc. which are the source of `data`.

      // Let's use `totalAmountToBePaid` from scope.

      if (totalAmountToBePaid < originalTotalPaid) {
        toast.error(`Cannot save: New total (${formatCurrency(totalAmountToBePaid)}) is less than amount already paid (${formatCurrency(originalTotalPaid)}).`);
        return;
      }
    }

    const mutationOptions = {
      onSuccess: () => {
        onSaleAdded?.();
        onClose();
      },
    };

    if (isEditMode) {
      const {
        customer: _c,
        costs: _co,
        payments: _p,
        product: _pr,
        warehouse: _w,
        category: _ca,
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

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-closed:scale-95 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in max-w-6xl w-full flex flex-col max-h-[90vh]"
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
                <SaleProductSelect
                  register={register}
                  errors={errors}
                  control={control}
                  setValue={setValue}
                  watch={watch}
                  warehouses={warehouses}
                  categories={categories}
                  products={products}
                  units={units}
                  isEditMode={isEditMode}
                  isInitialLoading={isInitialLoading}
                  formattedTotalAmount={formatCurrency(totalAmount)}
                  productsLoading={productsLoading}
                  fields={fields}
                  append={append}
                  remove={remove}
                />

                <SaleCustomerSelect
                  register={register}
                  control={control}
                  errors={errors}
                  setValue={setValue}
                  watch={watch}
                  customers={customers}
                  isEditMode={isEditMode}
                  isInitialLoading={isInitialLoading}
                />

                <SaleFinancials
                  register={register}
                  control={control}
                  errors={errors}
                  isSubmitting={isSubmitting}
                  setValue={setValue}
                  watch={watch}
                  accounts={accounts}
                  totalAmountToBePaid={totalAmountToBePaid}
                  customerType={watchedCustomerType}
                  selectedCustomer={selectedCustomer}
                />

                {/* Financial Feedback / Overpayment Warning */}
                {isEditMode && editData?.invoiceStatus === "Invoiced" && (
                  (() => {
                    const originalTotalPaid = editData.paymentsMade ?? (editData.payments?.reduce((acc, p) => acc + (p.amount || 0), 0) || 0);
                    // We check against the NEW total to be paid
                    const difference = originalTotalPaid - totalAmountToBePaid;

                    if (difference > 0) {
                      return (
                        <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-sm">Cannot Reduce Total Below Paid Amount</h4>
                            <p className="text-sm mt-1">
                              The customer has already paid <strong>{formatCurrency(originalTotalPaid)}</strong>.
                              The new total is <strong>{formatCurrency(totalAmountToBePaid)}</strong>.
                            </p>
                            <p className="text-sm mt-1 font-medium">
                              Strict payment rules are enforced. You must refund or remove payments before reducing the sale total.
                            </p>
                          </div>
                        </div>
                      );
                    } else if (difference < 0) {
                      return null;
                    }
                    return null;
                  })()
                )}

                <FormActions
                  onCancel={onClose}
                  isSubmitting={
                    isSubmitting ||
                    createSaleMutation.isPending ||
                    updateSaleMutation.isPending
                  }
                  submitLabel={isEditMode ? "Update Sale" : "Create Sale"}
                />
              </form>
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default AddSales;
