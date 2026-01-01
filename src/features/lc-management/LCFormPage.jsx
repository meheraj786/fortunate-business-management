import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
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
import toast from "react-hot-toast";
import PropTypes from "prop-types";

// Custom Hooks & API
import { useFormData } from "@/hooks/formHooks";
import { useSectionManager } from "@/hooks/useSectionManager";
import { useUnits } from "@/api/hooks/unit";
import { useAccounts } from "@/api/hooks/account";
import { useLC, useCreateLC, useUpdateLC } from "@/api/hooks/lc";

// Components
import FormSection from "@/components/ui/FormSection";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import TextAreaField from "@/components/ui/TextAreaField";
import FileInput from "@/components/ui/FileInput";
import FormPageLayout from "@/components/ui/FormPageLayout";
import CostsSection from "@/components/LCForm/CostsSection";
import Loading from "@/components/layout/Loading";

const SECTIONS = [
  { id: "basicInfo", title: "Basic Information", icon: FileText },
  { id: "financialInfo", title: "Financial Information", icon: DollarSign },
  { id: "productInfo", title: "Product Information", icon: Package },
  { id: "shippingCustomsInfo", title: "Shipping & Customs", icon: Truck },
  { id: "agentTransportInfo", title: "Agent & Transport", icon: User },
  { id: "otherExpenses", title: "Other Expenses", icon: DollarSign },
  { id: "documentsNotes", title: "Documents & Notes", icon: Clipboard },
];

const LCFormWrapper = ({ onSave }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: lcData, isLoading: isLcLoading, isError } = useLC(id);

  if (isLcLoading && isEditMode) return <Loading>Loading form data...</Loading>;
  if (isError) {
    toast.error("Failed to load LC data.");
    navigate("/lc-management");
    return null;
  }

  return (
    <LCForm
      onSave={onSave}
      isEditMode={isEditMode}
      id={id}
      initialData={lcData?.data}
    />
  );
};

const LCForm = ({ onSave, isEditMode, id, initialData }) => {
  const navigate = useNavigate();

  const { data: units, isLoading: unitsLoading } = useUnits();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { expandedSections, toggleSection, setSectionRef } =
    useSectionManager(SECTIONS);

  const {
    formData,
    setFormData,
    uploadedFiles,
    setUploadedFiles,
    handleInputChange,
    handleProductChange,
    addProduct,
    removeProduct,
    setProductInfo,
    handleCostChange,
    addCost,
    removeCost,
    validateForm,
    formatFormDataForSubmit,
    resetForm,
  } = useFormData(initialData);

  const createLCMutation = useCreateLC();
  const updateLCMutation = useUpdateLC(id);

  useEffect(() => {
    if (
      formData.financialInfo.lcAmountUsd &&
      formData.financialInfo.exchangeRate
    ) {
      const bdtAmount =
        parseFloat(formData.financialInfo.lcAmountUsd) *
        parseFloat(formData.financialInfo.exchangeRate);
      handleInputChange("financialInfo", "lcAmountBdt", bdtAmount.toFixed(2));
    }
  }, [
    formData.financialInfo.lcAmountUsd,
    formData.financialInfo.exchangeRate,
    handleInputChange,
  ]);

  useEffect(() => {
    const updatedProducts = formData.productInfo.map((product) => {
      const { quantity, unitPriceUsd } = product;
      if (quantity && unitPriceUsd) {
        return {
          ...product,
          totalValueUsd: (
            parseFloat(quantity) * parseFloat(unitPriceUsd)
          ).toFixed(2),
        };
      }
      return product;
    });

    if (
      JSON.stringify(updatedProducts) !== JSON.stringify(formData.productInfo)
    ) {
      setProductInfo(updatedProducts);
    }
  }, [formData.productInfo, setProductInfo]);

  const handleExistingFileRemove = (fileId) => {
    setFormData((prev) => ({
      ...prev,
      documentsNotes: {
        ...prev.documentsNotes,
        uploadedDocuments: prev.documentsNotes.uploadedDocuments.filter(
          (doc) => doc._id !== fileId
        ),
      },
    }));
    toast.success("Existing file marked for removal.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }

    const payloadData = formatFormDataForSubmit();
    const payload = new FormData();
    payload.append("lc_data", JSON.stringify(payloadData));
    uploadedFiles.forEach((file) => payload.append("documents", file));

    if (isEditMode) {
      updateLCMutation.mutate(payload, {
        onSuccess: (data) => {
          if (onSave) onSave(formData);
          resetForm();
          navigate(`/lc-details/${data.data._id}`);
        },
      });
    } else {
      createLCMutation.mutate(payload, {
        onSuccess: () => {
          if (onSave) onSave(formData);
          resetForm();
          navigate("/lc-management");
        },
      });
    }
  };

  const renderProductFields = (product, index) => (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="p-4 border border-gray-200 rounded-lg relative bg-gray-50 mb-4"
    >
      {formData.productInfo.length > 1 && (
        <button
          type="button"
          onClick={() => removeProduct(product.id)}
          className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      <h4 className="font-semibold text-gray-900 mb-4">Product {index + 1}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InputField
          label="Item Name"
          value={product.itemName}
          onChange={(e) =>
            handleProductChange(product.id, "itemName", e.target.value)
          }
          required
        />
        <InputField
          label="Thickness"
          value={product.thickness}
          onChange={(e) =>
            handleProductChange(product.id, "thickness", e.target.value)
          }
        />
        <InputField
          label="Width"
          value={product.width}
          onChange={(e) =>
            handleProductChange(product.id, "width", e.target.value)
          }
        />
        <InputField
          label="Length"
          value={product.length}
          onChange={(e) =>
            handleProductChange(product.id, "length", e.target.value)
          }
        />
        <InputField
          label="Grade"
          value={product.grade}
          onChange={(e) =>
            handleProductChange(product.id, "grade", e.target.value)
          }
        />
        <SelectField
          label="Unit"
          value={product.quantityUnit}
          onChange={(e) =>
            handleProductChange(product.id, "quantityUnit", e.target.value)
          }
          options={units?.data?.map((u) => ({ value: u._id, label: u.name })) || []}
          required
        />
        <InputField
          label="Quantity"
          type="number"
          value={product.quantity}
          onChange={(e) =>
            handleProductChange(product.id, "quantity", e.target.value)
          }
          required
        />
        <InputField
          label="Price (USD)"
          type="number"
          value={product.unitPriceUsd}
          onChange={(e) =>
            handleProductChange(product.id, "unitPriceUsd", e.target.value)
          }
          required
        />
        <InputField
          label="Total (USD)"
          value={product.totalValueUsd}
          disabled
        />
      </div>
    </motion.div>
  );

  const isSubmitting = createLCMutation.isLoading || updateLCMutation.isLoading;

  return (
    <FormPageLayout
      title={
        isEditMode ? "Edit Letter of Credit" : "Create New Letter of Credit"
      }
      subtitle={`Fill in the details below to ${
        isEditMode ? "update" : "create"
      } a new LC`}
      cancelLink={isEditMode ? `/lc-details/${id}` : "/lc-management"}
      onSubmit={handleSubmit}
      isEditMode={isEditMode}
      submitButtonText={
        isSubmitting
          ? isEditMode
            ? "Updating..."
            : "Creating..."
          : isEditMode
          ? "Update LC"
          : "Create LC"
      }
      isLoading={unitsLoading || accountsLoading}
      isSubmitting={isSubmitting}
      isValid={validateForm()}
    >
      {SECTIONS.map((section) => (
        <FormSection
          key={section.id}
          title={section.title}
          icon={section.icon}
          isExpanded={expandedSections[section.id]}
          onToggle={() => toggleSection(section.id)}
          sectionRef={(el) => setSectionRef(section.id, el)}
        >
          {section.id === "basicInfo" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <InputField
                label="LC Number"
                value={formData.basicInfo.lcNumber}
                onChange={(e) =>
                  handleInputChange("basicInfo", "lcNumber", e.target.value)
                }
                required
                disabled={isEditMode}
              />
              <InputField
                label="LC Opening Date"
                type="date"
                value={formData.basicInfo.lcOpeningDate}
                onChange={(e) =>
                  handleInputChange(
                    "basicInfo",
                    "lcOpeningDate",
                    e.target.value
                  )
                }
                required
              />
              <SelectField
                label="Status"
                value={formData.basicInfo.status}
                onChange={(e) =>
                  handleInputChange("basicInfo", "status", e.target.value)
                }
                options={[
                  { value: "Draft", label: "Draft" },
                  { value: "Active", label: "Active" },
                  { value: "Completed", label: "Completed" },
                  { value: "Cancelled", label: "Cancelled" },
                ]}
                required
              />
              <SelectField
                label="Choose an account"
                value={formData.basicInfo.accountId}
                onChange={(e) =>
                  handleInputChange("basicInfo", "accountId", e.target.value)
                }
                options={(accounts?.data || [])
                  ?.filter((acc) => acc.accountType === "Bank")
                  .map((acc) => ({
                    value: acc._id,
                    label: `${acc.bankName} (${acc.accountHolderName}) - ${acc.accountNumber}`,
                  }))}
                placeholder="Select Bank"
                required
              />
              <InputField
                label="Supplier Name"
                value={formData.basicInfo.supplierName}
                onChange={(e) =>
                  handleInputChange("basicInfo", "supplierName", e.target.value)
                }
                required
              />
              <InputField
                label="Supplier Country"
                value={formData.basicInfo.supplierCountry}
                onChange={(e) =>
                  handleInputChange(
                    "basicInfo",
                    "supplierCountry",
                    e.target.value
                  )
                }
                required
              />
            </div>
          )}
          {section.id === "financialInfo" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <InputField
                  label="LC Amount (USD)"
                  type="number"
                  value={formData.financialInfo.lcAmountUsd}
                  onChange={(e) =>
                    handleInputChange(
                      "financialInfo",
                      "lcAmountUsd",
                      e.target.value
                    )
                  }
                  required
                />
                <InputField
                  label="Exchange Rate"
                  type="number"
                  value={formData.financialInfo.exchangeRate}
                  onChange={(e) =>
                    handleInputChange(
                      "financialInfo",
                      "exchangeRate",
                      e.target.value
                    )
                  }
                  required
                />
                <InputField
                  label="LC Amount (BDT)"
                  type="number"
                  value={formData.financialInfo.lcAmountBdt}
                  disabled
                />
              </div>
              {!isEditMode && <CostsSection
                costs={formData.financialInfo.costs}
                section="financialInfo"
                onCostChange={handleCostChange}
                onAddCost={() => addCost("financialInfo")}
                onRemoveCost={(costId) => removeCost("financialInfo", costId)}
                accounts={accounts?.data || []}
                paymentMethods={["Cash", "Bank", "Mobile Banking"]}
              />}
            </div>
          )}
          {section.id === "productInfo" && (
            <div className="space-y-4 sm:space-y-6">
              <AnimatePresence>
                {formData.productInfo.map((product, index) =>
                  renderProductFields(product, index)
                )}
              </AnimatePresence>
              <button
                type="button"
                onClick={addProduct}
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 border border-dashed border-gray-300 rounded-lg hover:border-[#003b75] hover:text-[#003b75] transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Another Product</span>
              </button>
            </div>
          )}
          {section.id === "shippingCustomsInfo" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <InputField
                  label="Port of Shipment"
                  value={formData.shippingCustomsInfo.portOfShipment}
                  onChange={(e) =>
                    handleInputChange(
                      "shippingCustomsInfo",
                      "portOfShipment",
                      e.target.value
                    )
                  }
                />
                <InputField
                  label="Expected Arrival Date"
                  type="date"
                  value={formData.shippingCustomsInfo.expectedArrivalDate}
                  onChange={(e) =>
                    handleInputChange(
                      "shippingCustomsInfo",
                      "expectedArrivalDate",
                      e.target.value
                    )
                  }
                />
              </div>
              {!isEditMode && <CostsSection
                costs={formData.shippingCustomsInfo.costs}
                section="shippingCustomsInfo"
                onCostChange={handleCostChange}
                onAddCost={() => addCost("shippingCustomsInfo")}
                onRemoveCost={(costId) =>
                  removeCost("shippingCustomsInfo", costId)
                }
                accounts={accounts?.data || []}
                paymentMethods={["Cash", "Bank", "Mobile Banking"]}
              />}
            </div>
          )}
          {section.id === "agentTransportInfo" && (
            !isEditMode && (
              <CostsSection
                costs={formData.agentTransportInfo.costs}
                section="agentTransportInfo"
                onCostChange={handleCostChange}
                onAddCost={() => addCost("agentTransportInfo")}
                onRemoveCost={(costId) =>
                  removeCost("agentTransportInfo", costId)
                }
                accounts={accounts?.data || []}
                paymentMethods={["Cash", "Bank", "Mobile Banking"]}
              />
            )
          )}
          {section.id === "otherExpenses" && (
            !isEditMode && (
              <CostsSection
                costs={formData.otherExpenses.costs}
                section="otherExpenses"
                onCostChange={handleCostChange}
                onAddCost={() => addCost("otherExpenses")}
                onRemoveCost={(costId) => removeCost("otherExpenses", costId)}
                accounts={accounts?.data || []}
                paymentMethods={["Cash", "Bank", "Mobile Banking"]}
              />
            )
          )}
          {section.id === "documentsNotes" && (
            <div className="space-y-6">
              <TextAreaField
                label="Note"
                value={formData.documentsNotes?.note || ""}
                onChange={(e) =>
                  handleInputChange("documentsNotes", "note", e.target.value)
                }
                rows={4}
              />
              {isEditMode &&
                formData.documentsNotes.uploadedDocuments?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Existing Documents
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {formData.documentsNotes.uploadedDocuments.map((doc) => (
                        <div
                          key={doc._id}
                          className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg"
                        >
                          <div className="flex items-center min-w-0">
                            <FileIcon className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                            <span className="text-xs text-blue-900 truncate font-medium">
                              {doc.originalName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleExistingFileRemove(doc._id)}
                            className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
                  files={uploadedFiles}
                  onFileChange={(files) =>
                    setUploadedFiles((prev) => [...prev, ...files])
                  }
                  onFileRemove={(index) =>
                    setUploadedFiles((prev) =>
                      prev.filter((_, i) => i !== index)
                    )
                  }
                  maxSize={10}
                  acceptedTypes="*/*"
                  label="Drop files here or click to upload"
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
};

LCFormWrapper.propTypes = {
  onSave: PropTypes.func,
};

export default React.memo(LCFormWrapper);
