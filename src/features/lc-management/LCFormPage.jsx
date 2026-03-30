import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  FileText,
  DollarSign,
  Truck,
  User,
  Package,
  Clipboard,
  FileIcon,
} from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/utils/notifications";
import { getBusinessDateTimeISO } from "@/utils/date.util";
import PropTypes from "prop-types";
import { useForm, useFieldArray } from "react-hook-form";

// Custom Hooks & API
import { useSectionManager } from "@/hooks/useSectionManager";
import { useUnits } from "@/api/hooks/unit";
import { useAccounts } from "@/api/hooks/account";
import { useCountries } from "@/api/hooks/country";
import { useLC, useCreateLC, useUpdateLC } from "@/api/hooks/lc";

import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/context/SettingsContext";
import { formatAccountLabel } from "@/utils/format";

// Components
import FormSection from "@/components/ui/FormSection";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import TextAreaField from "@/components/ui/TextAreaField";
import FileInput from "@/components/ui/FileInput";
import FormPageLayout from "@/components/ui/FormPageLayout";
import CostsSection from "@/components/LCForm/CostsSection";
import Button from "@/components/ui/Button";
import LCFormSkeleton from "./LCFormSkeleton";

const SECTIONS_CONFIG = [
  {
    id: "basicInfo",
    title: "Basic Information",
    icon: FileText,
    defaultOpen: true,
  },
  {
    id: "financialInfo",
    title: "Financial Information",
    icon: DollarSign,
    defaultOpen: true,
  },
  {
    id: "productInfo",
    title: "Product Information",
    icon: Package,
    defaultOpen: true,
  },
  {
    id: "documentProductInfo",
    title: "Document Information",
    icon: Package,
    defaultOpen: true,
  },
  {
    id: "shippingCustomsInfo",
    title: "Shipping & Customs",
    icon: Truck,
    defaultOpen: true,
  },
  {
    id: "agentTransportInfo",
    title: "Agent & Transport",
    icon: User,
    defaultOpen: true,
  },
  {
    id: "otherExpenses",
    title: "Other Expenses",
    icon: DollarSign,
    defaultOpen: true,
  },
  {
    id: "documentsNotes",
    title: "Documents & Notes",
    icon: Clipboard,
    defaultOpen: true,
  },
];

const LCFormWrapper = ({ onSave }) => {
  const { id } = useParams();
  const isEditMode = !!id;
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const { data: lcData, isLoading: isLcDataLoading, isError } = useLC(id);

  useEffect(() => {
    if (isEditMode) {
      if (!hasPermission("LC_UPDATE")) {
        showErrorToast("You don't have permission to edit LCs.");
        navigate("/lc-management");
      }
    } else {
      if (!hasPermission("LC_CREATE")) {
        showErrorToast("You don't have permission to create LCs.");
        navigate("/lc-management");
      }
    }
  }, [isEditMode, hasPermission, navigate]);

  // If in edit mode and data is loading, show skeleton.
  if (isEditMode && isLcDataLoading) {
    return (
      <FormPageLayout
        title="Loading LC..."
        subtitle="Please wait while we fetch the LC details."
        cancelLink="/lc-management"
        isEditMode={true} // isEditMode is true because we are loading for edit
        submitButtonText="LC"
        isLoading={true} // Indicate loading state to FormPageLayout
      >
        <LCFormSkeleton />
      </FormPageLayout>
    );
  }

  if (isError) {
    showErrorToast("Failed to load LC data.");
    return null; // Or navigate to error page
  }

  // If in edit mode and data is not found after loading, handle that case.
  if (isEditMode && !lcData) {
    showErrorToast("LC not found.");
    return null; // Or show a specific message/navigate
  }

  return (
    <LCForm
      onSave={onSave}
      isEditMode={isEditMode}
      id={id}
      initialData={lcData?.data}
      hasPermission={hasPermission}
    />
  );
};

const ProductFields = ({
  field,
  index,
  removeProductField,
  hasPermission,
  register,
  control,
  errors,
  setValue,
  watch,
  units,
  unitsLoading,
  baseName = "productInfo",
  isDraft = false,
}) => {
  const productQuantity = watch(`${baseName}.${index}.quantity`);
  const productUnitPriceUsd = watch(`${baseName}.${index}.unitPriceUsd`);

  useEffect(() => {
    const quantity = Number(productQuantity) || 0;
    const unitPrice = Number(productUnitPriceUsd) || 0;
    const total = quantity * unitPrice;
    setValue(`${baseName}.${index}.totalValueUsd`, total.toFixed(2));
  }, [productQuantity, productUnitPriceUsd, index, setValue, baseName]);

  const watchedTotalValue = watch(`${baseName}.${index}.totalValueUsd`);
  // Handle nested errors traversal safely
  const getNestedError = (obj, path) => {
    return path.split('.').reduce((prev, curr) => prev ? prev[curr] : undefined, obj);
  }
  const productErrors = getNestedError(errors, `${baseName}.${index}`);

  return (
    <motion.div
      key={field.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="p-4 border border-gray-200 rounded-lg relative bg-gray-50 mb-4"
    >
      {hasPermission("LC_UPDATE") && (
        <Button
          type="button"
          onClick={() => removeProductField(index)}
          variant="subtle"
          className="absolute top-2 right-2 !p-2 text-[var(--color-danger)] hover:bg-[var(--color-danger-light)]"
          aria-label="Remove product"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
      <h4 className="font-semibold text-gray-900 mb-4">Product {index + 1}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InputField
          label="Item Name"
          name={`${baseName}.${index}.itemName`}
          register={register}
          error={productErrors?.itemName?.message}
          validation={{ required: isDraft ? false : "Item name is required" }}
          placeholder="e.g., Hot Rolled Steel Coil"
        />
        <InputField
          label="Thickness"
          name={`${baseName}.${index}.thickness`}
          register={register}
          error={productErrors?.thickness?.message}
          placeholder="e.g., 2.5mm"
        />
        <InputField
          label="Width"
          name={`${baseName}.${index}.width`}
          register={register}
          error={productErrors?.width?.message}
          placeholder="e.g., 1250mm"
        />
        <InputField
          label="Length"
          name={`${baseName}.${index}.length`}
          register={register}
          error={productErrors?.length?.message}
          placeholder="e.g., 2500mm or C"
        />
        <InputField
          label="Grade"
          name={`${baseName}.${index}.grade`}
          register={register}
          error={productErrors?.grade?.message}
          placeholder="e.g., JIS G3131 SPHC"
        />
        <SelectField
          label="Unit"
          name={`${baseName}.${index}.quantityUnit`}
          control={control}
          error={productErrors?.quantityUnit?.message}
          options={units.map((u) => ({ value: u._id, label: u.name })) || []}
          validation={{ required: isDraft ? false : "Unit is required" }}
          loading={unitsLoading}
        />
        <InputField
          label="Quantity"
          name={`${baseName}.${index}.quantity`}
          type="number"
          register={register}
          error={productErrors?.quantity?.message}
          validation={{
            required: isDraft ? false : "Quantity is required",
            min: { value: 0, message: "Quantity cannot be negative" },
            valueAsNumber: true,
          }}
          step="any"
          placeholder="e.g., 25"
        />
        <InputField
          label="Price (USD)"
          name={`${baseName}.${index}.unitPriceUsd`}
          type="number"
          register={register}
          error={productErrors?.unitPriceUsd?.message}
          validation={{
            required: isDraft ? false : "Price is required",
            min: { value: 0, message: "Price cannot be negative" },
            valueAsNumber: true,
          }}
          step="any"
          placeholder="e.g., 850"
        />
        <InputField
          label="Total (USD)"
          name={`${baseName}.${index}.totalValueUsd`}
          value={watchedTotalValue || 0}
          disabled
        />
      </div>
    </motion.div>
  );
};

const LCForm = ({ onSave, isEditMode, id, initialData, hasPermission }) => {
  const navigate = useNavigate();
  const { settings } = useSettings();

  const { data: unitsData, isLoading: unitsLoading } = useUnits();
  const { data: accountsData, isLoading: accountsLoading } = useAccounts();
  const { data: countriesData, isLoading: countriesLoading } = useCountries();
  const units = unitsData?.data || [];
  const accounts = accountsData?.data || [];
  const countries = countriesData?.data || [];

  const { expandedSections, toggleSection, setSectionRef } =
    useSectionManager(SECTIONS_CONFIG);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, isSubmitting },
    watch,
    setValue,
    trigger,
  } = useForm({
    mode: "onChange",
    defaultValues: useMemo(() => {
      // Helper function to map populated accountId to its _id in costs
      const mapCostAccountIds = (cost) => ({
        ...cost,
        accountId: cost.accountId?._id || cost.accountId || "",
      });

      if (isEditMode && initialData) {
        return {
          basicInfo: {
            lcNumber: initialData.basicInfo?.lcNumber || "",
            lcOpeningDate: initialData.basicInfo?.lcOpeningDate
              ? new Date(initialData.basicInfo.lcOpeningDate)
                .toISOString()
                .slice(0, 16)
              : "",
            status: initialData.basicInfo?.status || "Draft",
            accountId: initialData.basicInfo?.accountId?._id || "",
            supplierName: initialData.basicInfo?.supplierName || "",
            supplierCountry: initialData.basicInfo?.supplierCountry || "",
          },
          financialInfo: {
            lcAmountUsd: initialData.financialInfo?.lcAmountUsd || 0,
            exchangeRate: initialData.financialInfo?.exchangeRate || 0,
            lcAmountBdt: initialData.financialInfo?.lcAmountBdt || 0,
            costs:
              initialData.financialInfo?.costs?.map(mapCostAccountIds) || [],
          },
          productInfo: initialData.productInfo?.map((p) => ({
            ...p,
            id: p._id || p.id || Math.random(),
            quantityUnit: p.quantityUnit?._id || p.quantityUnit || "",
            totalValueUsd:
              p.totalValueUsd ||
              (p.quantity && p.unitPriceUsd
                ? (parseFloat(p.quantity) * parseFloat(p.unitPriceUsd)).toFixed(
                  2,
                )
                : 0),
          })) || [],
          documentProductInfo: {
            products: initialData.documentProductInfo?.products?.map((p) => ({
              ...p,
              id: p._id || p.id || Math.random(),
              quantityUnit: p.quantityUnit?._id || p.quantityUnit || "",
              totalValueUsd: p.totalValueUsd || (p.quantity && p.unitPriceUsd ? (parseFloat(p.quantity) * parseFloat(p.unitPriceUsd)).toFixed(2) : 0)
            })) || [],
            costs: initialData.documentProductInfo?.costs?.map(mapCostAccountIds) || []
          },
          shippingCustomsInfo: {
            portOfShipment:
              initialData.shippingCustomsInfo?.portOfShipment || "",
            portOfDestination:
              initialData.shippingCustomsInfo?.portOfDestination || "",
            expectedArrivalDate: initialData.shippingCustomsInfo
              ?.expectedArrivalDate
              ? new Date(initialData.shippingCustomsInfo.expectedArrivalDate)
                .toISOString()
                .slice(0, 16)
              : "",
            costs:
              initialData.shippingCustomsInfo?.costs?.map(mapCostAccountIds) ||
              [],
          },
          agentTransportInfo: {
            costs:
              initialData.agentTransportInfo?.costs?.map(mapCostAccountIds) ||
              [],
          },
          otherExpenses: {
            costs:
              initialData.otherExpenses?.costs?.map(mapCostAccountIds) || [],
          },
          documentsNotes: {
            note: initialData.documentsNotes?.note || "",
            uploadedDocuments:
              initialData.documentsNotes?.uploadedDocuments || [],
          },
        };
      }
      // Default values for new form
      return {
        basicInfo: {
          lcNumber: "",
          lcOpeningDate: getBusinessDateTimeISO(settings?.timezone),
          status: "Draft",
          accountId: "",
          supplierName: "",
          supplierCountry: "",
        },
        financialInfo: {
          lcAmountUsd: 0,
          exchangeRate: 0,
          lcAmountBdt: 0,
          costs: [],
        },
        productInfo: [],
        documentProductInfo: {
          products: [],
          costs: []
        },
        shippingCustomsInfo: {
          portOfShipment: "",
          portOfDestination: "",
          expectedArrivalDate: "",
          costs: [],
        },
        agentTransportInfo: {
          costs: [],
        },
        otherExpenses: {
          costs: [],
        },
        documentsNotes: {
          note: "",
          uploadedDocuments: [],
        },
      };
    }, [isEditMode, initialData]),
  });

  // Field arrays for productInfo
  const {
    fields: productFields,
    append: appendProduct,
    remove: removeProductField,
  } = useFieldArray({
    control,
    name: "productInfo",
  });

  const {
    fields: documentProductFields,
    append: appendDocumentProduct,
    remove: removeDocumentProductField
  } = useFieldArray({
    control,
    name: "documentProductInfo.products"
  });

  // State for file uploads (separate from RHF for simplicity with existing FileInput)
  const [newUploadedFiles, setNewUploadedFiles] = useState([]);

  // Mutations
  const createLCMutation = useCreateLC();
  const updateLCMutation = useUpdateLC(id);

  // Watch fields for calculations
  const lcAmountUsd = watch("financialInfo.lcAmountUsd");
  const exchangeRate = watch("financialInfo.exchangeRate");
  const watchedStatus = watch("basicInfo.status");
  const isDraft = watchedStatus === "Draft" || watchedStatus === "Cancelled";

  useEffect(() => {
    if (lcAmountUsd && exchangeRate) {
      const bdtAmount = parseFloat(lcAmountUsd) * parseFloat(exchangeRate);
      setValue("financialInfo.lcAmountBdt", bdtAmount.toFixed(2));
    } else {
      setValue("financialInfo.lcAmountBdt", 0);
    }
  }, [lcAmountUsd, exchangeRate, setValue]);

  // Re-validate conditionally-required fields when status changes
  useEffect(() => {
    // Small delay to let RHF re-register fields with updated validation rules
    const timer = setTimeout(() => {
      trigger([
        "basicInfo.supplierName",
        "basicInfo.supplierCountry",
        "basicInfo.accountId",
        "financialInfo.lcAmountUsd",
        "financialInfo.exchangeRate",
      ]);
    }, 50);
    return () => clearTimeout(timer);
  }, [watchedStatus, trigger]);

  const handleExistingFileRemove = (fileId) => {
    // Remove from react-hook-form state
    const currentUploadedDocuments = watch("documentsNotes.uploadedDocuments");
    setValue(
      "documentsNotes.uploadedDocuments",
      currentUploadedDocuments.filter((doc) => doc._id !== fileId),
    );
    showSuccessToast("Existing file marked for removal.");
  };

  const onSubmit = (data) => {
    const payloadData = {
      ...data,
      productInfo: data.productInfo.map((product) => ({
        ...product,
        quantity: parseFloat(product.quantity),
        unitPriceUsd: parseFloat(product.unitPriceUsd),
        totalValueUsd: parseFloat(product.totalValueUsd),
      })),
      financialInfo: {
        ...data.financialInfo,
        lcAmountUsd: parseFloat(data.financialInfo.lcAmountUsd),
        exchangeRate: parseFloat(data.financialInfo.exchangeRate),
        lcAmountBdt: parseFloat(data.financialInfo.lcAmountBdt),
      },
      documentProductInfo: {
        ...data.documentProductInfo,
        products: data.documentProductInfo.products.map(product => ({
          ...product,
          quantity: parseFloat(product.quantity),
          unitPriceUsd: parseFloat(product.unitPriceUsd),
          totalValueUsd: parseFloat(product.totalValueUsd)
        })),
        costs: data.documentProductInfo?.costs || []
      }
    };

    const formDataToSend = new FormData();
    formDataToSend.append("lc_data", JSON.stringify(payloadData));
    newUploadedFiles.forEach((file) =>
      formDataToSend.append("documents", file),
    );

    const mutationOptions = {
      onSuccess: (responseData) => {
        onSave?.(responseData);
        if (isEditMode) {
          navigate(`/lc-details/${id}`);
        } else {
          navigate("/lc-management");
        }
      },
    };

    if (isEditMode) {
      updateLCMutation.mutate(formDataToSend, mutationOptions);
    } else {
      createLCMutation.mutate(formDataToSend, mutationOptions);
    }
  };

  const isLoading = unitsLoading || accountsLoading || countriesLoading; // General loading for external data
  const formSubmitting =
    createLCMutation.isLoading || updateLCMutation.isLoading;

  return (
    <FormPageLayout
      title={
        isEditMode ? "Edit Letter of Credit" : "Create New Letter of Credit"
      }
      subtitle={`Fill in the details below to ${isEditMode ? "update" : "create"
        } a new LC`}
      cancelLink={isEditMode ? `/lc-details/${id}` : "/lc-management"}
      onSubmit={handleSubmit(onSubmit)} // Use handleSubmit from react-hook-form
      isEditMode={isEditMode}
      submitButtonText="LC"
      isLoading={isLoading} // General loading for external data
      isSubmitting={isSubmitting || formSubmitting} // Mutation loading state
      isValid={isValid}
    >
      {SECTIONS_CONFIG.map((section) => (
        <FormSection
          key={section.id}
          title={section.title}
          icon={section.icon}
          isExpanded={expandedSections[section.id]}
          onToggle={() => toggleSection(section.id)}
          sectionRef={(el) => setSectionRef(section.id, el)}
          defaultOpen={section.defaultOpen}
        >
          {section.id === "basicInfo" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <InputField
                label="LC Number"
                name="basicInfo.lcNumber"
                register={register}
                error={errors.basicInfo?.lcNumber?.message}
                validation={{ required: "LC Number is required" }}
                disabled={isEditMode}
                placeholder="e.g., LC-2024-001"
              />
              <InputField
                label="LC Opening Date"
                name="basicInfo.lcOpeningDate"
                type="datetime-local"
                register={register}
                error={errors.basicInfo?.lcOpeningDate?.message}
                validation={{ required: "LC Opening Date is required" }}
              />
              <SelectField
                label="Status"
                name="basicInfo.status"
                control={control}
                error={errors.basicInfo?.status?.message}
                options={[
                  { value: "Draft", label: "Draft" },
                  { value: "Active", label: "Active" },
                  { value: "Completed", label: "Completed" },
                  { value: "Cancelled", label: "Cancelled" },
                ]}
                validation={{ required: "Status is required" }}
              />

              <SelectField
                label="Choose an account"
                name="basicInfo.accountId"
                control={control}
                error={errors.basicInfo?.accountId?.message}
                options={accounts
                  .filter((acc) => acc.accountType === "Bank")
                  .map((acc) => ({
                    value: acc._id,
                    label: formatAccountLabel(acc),
                  }))}
                placeholder="Select Bank"
                validation={{ required: isDraft ? false : "Bank account is required" }}
                loading={accountsLoading}
              />

              <InputField
                label="Supplier Name"
                name="basicInfo.supplierName"
                register={register}
                error={errors.basicInfo?.supplierName?.message}
                validation={{ required: isDraft ? false : "Supplier Name is required" }}
                placeholder="e.g., Global Steel Inc."
              />
              <SelectField
                label="Supplier Country"
                name="basicInfo.supplierCountry"
                control={control}
                error={errors.basicInfo?.supplierCountry?.message}
                options={countries.map((c) => ({ value: c.name, label: c.name }))}
                validation={{ required: isDraft ? false : "Supplier Country is required" }}
                placeholder="Select Country"
                loading={countriesLoading}
              />
            </div>
          )}
          {section.id === "financialInfo" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <InputField
                  label="LC Amount (USD)"
                  name="financialInfo.lcAmountUsd"
                  type="number"
                  register={register}
                  error={errors.financialInfo?.lcAmountUsd?.message}
                  validation={{
                    required: isDraft ? false : "LC Amount (USD) is required",
                    min: { value: 0, message: "Amount cannot be negative" },
                    valueAsNumber: true,
                  }}
                  step="any"
                  placeholder="e.g., 50000"
                />
                <InputField
                  label="Exchange Rate"
                  name="financialInfo.exchangeRate"
                  type="number"
                  register={register}
                  error={errors.financialInfo?.exchangeRate?.message}
                  validation={{
                    required: isDraft ? false : "Exchange Rate is required",
                    min: { value: 0, message: "Rate cannot be negative" },
                    valueAsNumber: true,
                  }}
                  step="any"
                  placeholder="e.g., 115.50"
                />
                <InputField
                  label={`LC Amount (${settings?.currency || "BDT"})`}
                  name="financialInfo.lcAmountBdt"
                  type="number"
                  register={register} // Still register for consistency, but disable
                  error={errors.financialInfo?.lcAmountBdt?.message}
                  disabled
                />
              </div>
              <CostsSection
                // pass register and errors to CostsSection for its fields
                control={control}
                register={register}
                errors={errors}
                watch={watch}
                section="financialInfo.costs" // Adjusted name for field array
                accounts={accounts}
                paymentMethods={["Cash", "Bank", "Mobile Banking"]}
                isSubmitting={formSubmitting}
              />
            </div>
          )}
          {section.id === "productInfo" && (
            <div className="space-y-4 sm:space-y-6">
              <AnimatePresence>
                {productFields.map((field, index) => (
                  <ProductFields
                    key={field.id}
                    field={field}
                    index={index}
                    removeProductField={removeProductField}
                    hasPermission={hasPermission}
                    register={register}
                    errors={errors}
                    control={control}
                    setValue={setValue}
                    watch={watch}
                    units={units}
                    unitsLoading={unitsLoading}
                    isDraft={isDraft}
                  />
                ))}
              </AnimatePresence>
              {hasPermission("LC_UPDATE") && (
                <Button
                  type="button"
                  onClick={() =>
                    appendProduct({
                      id: Math.random(),
                      itemName: "",
                      thickness: "",
                      width: "",
                      length: "",
                      grade: "",
                      quantityUnit: "",
                      quantity: 0,
                      unitPriceUsd: 0,
                      totalValueUsd: 0,
                    })
                  }
                  variant="secondary" // Use secondary variant
                  className="w-full border-dashed border-gray-300 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  disabled={isSubmitting}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  <span>Add Another Product</span>
                </Button>
              )}
            </div>
          )}
          {section.id === "documentProductInfo" && (
            <div className="space-y-4 sm:space-y-6">
              {/* Product Fields */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Products</h3>
                <AnimatePresence>
                  {documentProductFields.map((field, index) => (
                    <ProductFields
                      key={field.id}
                      field={field}
                      index={index}
                      removeProductField={removeDocumentProductField}
                      hasPermission={hasPermission}
                      register={register}
                      errors={errors}
                      control={control}
                      setValue={setValue}
                      watch={watch}
                      units={units}
                      unitsLoading={unitsLoading}
                      baseName="documentProductInfo.products"
                      isDraft={isDraft}
                    />
                  ))}
                </AnimatePresence>
                {hasPermission("LC_UPDATE") && (
                  <Button
                    type="button"
                    onClick={() => appendDocumentProduct({
                      id: Math.random(),
                      itemName: "",
                      thickness: "",
                      width: "",
                      length: "",
                      grade: "",
                      quantityUnit: "",
                      quantity: 0,
                      unitPriceUsd: 0,
                      totalValueUsd: 0,
                    })}
                    variant="secondary"
                    className="w-full border-dashed border-gray-300 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                    disabled={isSubmitting}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    <span>Add Another Document Item</span>
                  </Button>
                )}
              </div>

              {/* Costs Section */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Document Related Costs</h3>
                <CostsSection
                  control={control}
                  register={register}
                  errors={errors}
                  watch={watch}
                  setValue={setValue}
                  section="documentProductInfo.costs"
                  accounts={accounts}
                  paymentMethods={["Cash", "Bank", "Mobile Banking"]}
                  isSubmitting={formSubmitting}
                  isDocumentSection={true}
                />
              </div>
            </div>
          )}
          {section.id === "shippingCustomsInfo" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <InputField
                  label="Port of Shipment"
                  name="shippingCustomsInfo.portOfShipment"
                  register={register}
                  error={errors.shippingCustomsInfo?.portOfShipment?.message}
                  placeholder="e.g., Port of Busan"
                />
                <InputField
                  label="Port of Destination"
                  name="shippingCustomsInfo.portOfDestination"
                  register={register}
                  error={errors.shippingCustomsInfo?.portOfDestination?.message}
                  placeholder="e.g., Port of Chattogram"
                />
                <InputField
                  label="Expected Arrival Date"
                  name="shippingCustomsInfo.expectedArrivalDate"
                  type="datetime-local"
                  register={register}
                  error={
                    errors.shippingCustomsInfo?.expectedArrivalDate?.message
                  }
                />
              </div>
              <CostsSection
                control={control}
                register={register}
                errors={errors}
                watch={watch}
                section="shippingCustomsInfo.costs"
                accounts={accounts}
                paymentMethods={["Cash", "Bank", "Mobile Banking"]}
                isSubmitting={formSubmitting}
              />
            </div>
          )}
          {section.id === "agentTransportInfo" && (
            <CostsSection
              control={control}
              register={register}
              errors={errors}
              watch={watch}
              section="agentTransportInfo.costs"
              accounts={accounts}
              paymentMethods={["Cash", "Bank", "Mobile Banking"]}
              isSubmitting={formSubmitting}
            />
          )}
          {section.id === "otherExpenses" && (
            <CostsSection
              control={control}
              register={register}
              errors={errors}
              watch={watch}
              section="otherExpenses.costs"
              accounts={accounts}
              paymentMethods={["Cash", "Bank", "Mobile Banking"]}
              isSubmitting={formSubmitting}
            />
          )}
          {section.id === "documentsNotes" && (
            <div className="space-y-6">
              <TextAreaField
                label="Note"
                name="documentsNotes.note"
                register={register}
                error={errors.documentsNotes?.note?.message}
                rows={4}
                placeholder="Add any relevant notes about the LC, documents, or other details here."
              />
              {isEditMode &&
                watch("documentsNotes.uploadedDocuments")?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Existing Documents
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {watch("documentsNotes.uploadedDocuments").map((doc) => (
                        <div
                          key={doc._id}
                          className="flex items-center justify-between p-3 bg-[var(--color-primary-light)] border border-[var(--color-primary)] rounded-lg" // Themed colors
                        >
                          <div className="flex items-center min-w-0">
                            <FileIcon className="w-4 h-4 text-[var(--color-primary)] mr-2 flex-shrink-0" />
                            <span className="text-xs text-gray-900 truncate font-medium">
                              {doc.originalName}
                            </span>
                          </div>
                          {hasPermission("LC_UPDATE") && (
                            <Button
                              type="button"
                              onClick={() => handleExistingFileRemove(doc._id)}
                              variant="subtle"
                              className="!p-1.5 text-[var(--color-danger)] hover:bg-[var(--color-danger-light)]" // Themed colors
                              aria-label="Remove document"
                              disabled={formSubmitting}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  {isEditMode ? "Upload New Documents" : "Upload Documents"}
                </h4>
                <FileInput
                  files={newUploadedFiles}
                  onFileChange={(files) =>
                    setNewUploadedFiles((prev) => [...prev, ...files])
                  }
                  onFileRemove={(index) =>
                    setNewUploadedFiles((prev) =>
                      prev.filter((_, i) => i !== index),
                    )
                  }
                  maxSize={10}
                  acceptedTypes="*/*"
                  label="Drop files here or click to upload"
                  disabled={formSubmitting}
                />
              </div>
            </div>
          )}
        </FormSection>
      ))}
    </FormPageLayout>
  );
};

LCForm.propTypes = {
  onSave: PropTypes.func,
  isEditMode: PropTypes.bool.isRequired,
  id: PropTypes.string,
  initialData: PropTypes.object,
  hasPermission: PropTypes.func.isRequired,
};

LCFormWrapper.propTypes = {
  onSave: PropTypes.func,
};

export default React.memo(LCFormWrapper);
