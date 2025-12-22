import React, { useState, useEffect, useCallback, useMemo } from "react";
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
} from "lucide-react";
import api from "@/services/apiService";
import toast from "react-hot-toast";
import PropTypes from "prop-types";

// Custom Hooks
import {
  useFormData,
  useUnits,
  useAccounts,
  useCostManagement,
} from "@/hooks/formHooks";
import { useSectionManager } from "@/hooks/useSectionManager";

// Components
import FormSection from "@/components/ui/FormSection";
import InputField from "@/components/ui/InputField";
import SelectField from "@/components/ui/SelectField";
import TextAreaField from "@/components/ui/TextAreaField";
import FileInput from "@/components/ui/FileInput";
import FormPageLayout from "@/components/ui/FormPageLayout";
import CostsSection from "@/components/LCForm/CostsSection";

// Constants
const SECTIONS = [
  { id: "basicInfo", title: "Basic Information", icon: FileText },
  { id: "financialInfo", title: "Financial Information", icon: DollarSign },
  { id: "productInfo", title: "Product Information", icon: Package },
  { id: "shippingCustomsInfo", title: "Shipping & Customs", icon: Truck },
  { id: "agentTransportInfo", title: "Agent & Transport", icon: User },
  { id: "documentsNotes", title: "Documents & Notes", icon: Clipboard },
];

const LCForm = ({ onSave }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // Custom Hooks
  const { units, isLoading: unitsLoading } = useUnits();
  const { accounts, isLoading: accountsLoading } = useAccounts();
  const { expandedSections, toggleSection, setSectionRef } =
    useSectionManager(SECTIONS);

  const {
    formData,
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
  } = useFormData(isEditMode, id, accounts);

  // Effects
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
  }, [formData.financialInfo.lcAmountUsd, formData.financialInfo.exchangeRate]);

  useEffect(() => {
    const updatedProducts = formData.productInfo.map((product) => {
      const { quantity, unitPriceUsd } = product;
      if (quantity && unitPriceUsd) {
        const totalValue = parseFloat(quantity) * parseFloat(unitPriceUsd);
        return { ...product, totalValueUsd: totalValue.toFixed(2) };
      }
      return product;
    });

    if (
      JSON.stringify(updatedProducts) !== JSON.stringify(formData.productInfo)
    ) {
      setProductInfo(updatedProducts);
    }
  }, [formData.productInfo]);

  // Event Handlers
  const handleFileChange = useCallback((files) => {
    setUploadedFiles((prev) => [...prev, ...files]);
  }, []);

  const handleFileRemove = useCallback((index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const payloadData = formatFormDataForSubmit();
      const payload = new FormData();
      payload.append("lc_data", JSON.stringify(payloadData));
      uploadedFiles.forEach((file) => {
        payload.append("documents", file);
      });

      if (isEditMode) {
        await api.patch(`/lc/update-lc/${id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("LC Updated Successfully");
        navigate(`/lc-details/${id}`);
      } else {
        await api.post(`/lc/create-lc`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("LC Created Successfully");
        navigate("/lc-management");
      }

      if (onSave) onSave(formData);
      resetForm();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        `Failed to ${isEditMode ? "update" : "create"} LC. Please try again.`
      );
    }
  };

  // Render helpers
  const renderProductFields = (product, index) => (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="p-4 border border-gray-200 rounded-lg relative bg-gray-50"
    >
      {formData.productInfo.length > 1 && (
        <button
          type="button"
          onClick={() => removeProduct(product.id)}
          className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          aria-label={`Remove product ${index + 1}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      <h4 className="font-semibold text-gray-900 mb-4">Product {index + 1}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
          label="Quantity Unit"
          value={product.quantityUnit}
          onChange={(e) =>
            handleProductChange(product.id, "quantityUnit", e.target.value)
          }
          options={units}
          placeholder="Select Unit"
          required
          loading={unitsLoading}
        />
        <InputField
          label="Quantity"
          type="number"
          value={product.quantity}
          onChange={(e) =>
            handleProductChange(product.id, "quantity", e.target.value)
          }
          required
          min="0"
          step="0.01"
        />
        <InputField
          label="Unit Price (USD)"
          type="number"
          value={product.unitPriceUsd}
          onChange={(e) =>
            handleProductChange(product.id, "unitPriceUsd", e.target.value)
          }
          required
          min="0"
          step="0.01"
        />
        <InputField
          label="Total Value (USD)"
          type="number"
          value={product.totalValueUsd}
          disabled
        />
      </div>
    </motion.div>
  );

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
      submitButtonText="LC"
      isLoading={unitsLoading || accountsLoading}
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
          ariaLabel={`${section.title} section`}
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
                autoFocus
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
                options={accounts
                  .filter((acc) => acc.accountType === "Bank")
                  .map((acc) => ({
                    value: acc._id,
                    label: acc.accountName,
                  }))}
                placeholder="Select Bank"
                required
                loading={accountsLoading}
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
                  min="0"
                  step="0.01"
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
                  min="0"
                  step="0.0001"
                />
                <InputField
                  label="LC Amount (BDT)"
                  type="number"
                  value={formData.financialInfo.lcAmountBdt}
                  disabled
                />
                <InputField
                  label="LC Margin Paid (BDT)"
                  type="number"
                  value={formData.financialInfo.lcMarginPaidBdt}
                  onChange={(e) =>
                    handleInputChange(
                      "financialInfo",
                      "lcMarginPaidBdt",
                      e.target.value
                    )
                  }
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <CostsSection
                costs={formData.financialInfo.costs}
                section="financialInfo"
                onCostChange={handleCostChange}
                onAddCost={() => addCost("financialInfo")}
                onRemoveCost={(costId) => removeCost("financialInfo", costId)}
                accounts={accounts}
                paymentMethods={["Cash", "Bank", "Mobile Banking"]}
              />
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
              </div>{" "}
              <CostsSection
                costs={formData.shippingCustomsInfo.costs}
                section="shippingCustomsInfo"
                onCostChange={handleCostChange}
                onAddCost={() => addCost("shippingCustomsInfo")}
                onRemoveCost={(costId) =>
                  removeCost("shippingCustomsInfo", costId)
                }
                accounts={accounts}
                paymentMethods={["Cash", "Bank", "Mobile Banking"]}
              />
            </div>
          )}

          {section.id === "agentTransportInfo" && (
            <div className="flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"></div>
              <CostsSection
                costs={formData.agentTransportInfo.costs}
                section="agentTransportInfo"
                onCostChange={handleCostChange}
                onAddCost={() => addCost("agentTransportInfo")}
                onRemoveCost={(costId) =>
                  removeCost("agentTransportInfo", costId)
                }
                accounts={accounts}
                paymentMethods={["Cash", "Bank", "Mobile Banking"]}
              />
            </div>
          )}

          {section.id === "documentsNotes" && (
            <div className="space-y-4 sm:space-y-6">
              <TextAreaField
                label="Note"
                value={formData.documentsNotes.note}
                onChange={(e) =>
                  handleInputChange("documentsNotes", "note", e.target.value)
                }
                rows={4}
                autoResize
              />
              <FileInput
                files={uploadedFiles}
                onFileChange={handleFileChange}
                onFileRemove={handleFileRemove}
                maxSize={10}
                acceptedTypes="*/*"
                label="Upload Documents"
                required={!isEditMode}
              />
            </div>
          )}
        </FormSection>
      ))}
    </FormPageLayout>
  );
};

LCForm.propTypes = {
  onSave: PropTypes.func,
};

export default React.memo(LCForm);
