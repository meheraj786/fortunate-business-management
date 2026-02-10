import React, { useState, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";

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
          productId,
          categoryId,
          quantity: editData.quantity || "",
          unit: unitId,
          pricePerUnit: editData.pricePerUnit || "",
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
          productId,
          categoryId,
          unit: unitId,
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
  const watchedCharges = useWatch({
    control,
    name: "charges",
    defaultValue: [],
  });
  const watchedCosts = useWatch({ control, name: "costs", defaultValue: [] });

  const { totalAmount, totalAmountToBePaid } = useMemo(() => {
    const quantity = parseFloat(watchedQuantity) || 0;
    const pricePerUnit = parseFloat(watchedPricePerUnit) || 0;
    const total = quantity * pricePerUnit;
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
      totalAmount: total,
      totalAmountToBePaid: total + chargesTotal + costsTotal - discount,
    };
  }, [
    watchedQuantity,
    watchedPricePerUnit,
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
                />

                <SaleCustomerSelect
                  register={register}
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
