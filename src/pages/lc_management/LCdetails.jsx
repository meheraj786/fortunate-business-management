import React, { useState, useEffect, useContext } from "react";
import {
  FiFile,
  FiDollarSign,
  FiTruck,
  FiBox,
  FiClipboard,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiAlertCircle,
  FiUser,
  FiPieChart,
  FiDownload,
  FiEdit,
  FiTrash,
} from "react-icons/fi";
import { motion } from "motion/react";
import { useParams, useNavigate } from "react-router";
import CollapsibleCard from "../../components/common/CollapsibleCard";
import { UrlContext } from "../../context/UrlContext";
import axios from "axios";
import FormDialog from "../../components/common/FormDialog";
import toast from "react-hot-toast";

const StatusBadge = ({ status }) => {
  if (!status) return null;

  let bgColor, icon;

  switch (status.toLowerCase()) {
    case "open":
      bgColor = "bg-blue-100 text-blue-800";
      icon = <FiClock className="mr-1" />;
      break;
    case "partially used":
      bgColor = "bg-yellow-100 text-yellow-800";
      icon = <FiAlertCircle className="mr-1" />;
      break;
    case "closed":
    case "completed":
      bgColor = "bg-green-100 text-green-800";
      icon = <FiCheckCircle className="mr-1" />;
      break;
    case "cancelled":
      bgColor = "bg-red-100 text-red-800";
      icon = <FiXCircle className="mr-1" />;
      break;
    case "documents submitted":
      bgColor = "bg-purple-100 text-purple-800";
      icon = <FiClipboard className="mr-1" />;
      break;
    case "pending":
      bgColor = "bg-orange-100 text-orange-800";
      icon = <FiClock className="mr-1" />;
      break;
    default:
      bgColor = "bg-gray-100 text-gray-800";
      icon = <FiClock className="mr-1" />;
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bgColor}`}
    >
      {icon}
      {status}
    </span>
  );
};

const DataField = ({ label, value, icon, hidden = false }) => {
  if (hidden || !value) return null;

  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center text-sm text-gray-500 mb-1">
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </div>
      <div className="text-gray-900 font-medium">{value}</div>
    </div>
  );
};

const LCdetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lcData, setLcData] = useState(null);
  const { baseUrl } = useContext(UrlContext);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`${baseUrl}lc/delete-lc/${id}`);
      toast.success("LC deleted successfully");
      navigate("/lc-management");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete LC");
      console.error(error);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    axios
      .get(`${baseUrl}lc/get-lc/${id}`)
      .then((res) => setLcData(res.data.data))
      .catch((err) => console.error(err));
  }, [id, baseUrl]);
  if (!lcData) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Loading LC Details...
      </div>
    );
  }

  // Helper function to safely format numbers
  const formatNumber = (value) => {
    return value != null ? value.toLocaleString() : "-";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Safely extract data with fallbacks
  const financial_info = lcData?.financial_info || {};
  const shipping_customs_info = lcData?.shipping_customs_info || {};
  const agent_transport_info = lcData?.agent_transport_info || {};
  const product_info = lcData?.product_info || [];
  const basic_info = lcData?.basic_info || {};
  const documents_notes = lcData?.documents_notes || {};

  const sumOtherExpenses = (expenses) => {
    if (!expenses || !Array.isArray(expenses)) return 0;
    return expenses.reduce(
      (total, expense) => total + (expense.amount || 0),
      0
    );
  };

  const other_financial_expenses = sumOtherExpenses(
    financial_info.other_expenses
  );
  const other_shipping_expenses = sumOtherExpenses(
    shipping_customs_info.other_expenses
  );
  const other_agent_expenses = sumOtherExpenses(
    agent_transport_info.other_expenses
  );
  const customs_total_bdt =
    (shipping_customs_info.customs_duty_bdt || 0) +
    (shipping_customs_info.vat_bdt || 0) +
    (shipping_customs_info.ait_bdt || 0) +
    other_shipping_expenses;

  const transport_other_bdt =
    (agent_transport_info.transport_cost_bdt || 0) + other_agent_expenses;

  const total_lc_cost_bdt =
    (financial_info.lc_amount_bdt || 0) +
    (financial_info.bank_charges_bdt || 0) +
    (financial_info.insurance_cost_bdt || 0) +
    customs_total_bdt +
    (agent_transport_info.cnf_agent_commission_bdt || 0) +
    (agent_transport_info.indenting_agent_commission_bdt || 0) +
    transport_other_bdt +
    other_financial_expenses;

  const total_quantity_ton = product_info.reduce(
    (total, p) => total + (p.quantity_ton || 0),
    0
  );

  const per_unit_landing_cost_bdt = total_quantity_ton
    ? total_lc_cost_bdt / total_quantity_ton
    : 0;
  const cost_summary = {
    lc_amount_bdt: financial_info.lc_amount_bdt || 0,
    bank_charges_bdt: financial_info.bank_charges_bdt || 0,
    insurance_cost_bdt: financial_info.insurance_cost_bdt || 0,
    customs_total_bdt,
    agent_commission_bdt:
      (agent_transport_info.cnf_agent_commission_bdt || 0) +
      (agent_transport_info.indenting_agent_commission_bdt || 0),
    transport_other_bdt,
    total_lc_cost_bdt,
    per_unit_landing_cost_bdt,
    other_financial_expenses,
  };

  return (
    <div className="min-h-screen py-4 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto">
        <motion.div
          className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Letter of Credit Details
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Comprehensive view of your Letter of Credit
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              <FiDownload className="mr-2" />
              Export
            </button>
            <button
              onClick={() => navigate(`/lc-form/${id}`)}
              className="flex items-center px-4 py-2 bg-[#003b75] border border-transparent rounded-lg text-sm font-medium text-white hover:bg-[#002855]"
            >
              <FiEdit className="mr-2" />
              Edit
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-red-700"
            >
              <FiTrash className="mr-2" />
              Delete
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - 2/3 width on large screens */}
          <div className="lg:col-span-2 space-y-4">
            <CollapsibleCard title="Basic LC Information" icon={<FiFile />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DataField label="LC Number" value={basic_info.lc_number} />
                <DataField
                  label="LC Opening Date"
                  value={formatDate(basic_info.lc_opening_date)}
                />
                <DataField label="Bank Name" value={basic_info.bank_name} />
                <DataField
                  label="Status"
                  value={<StatusBadge status={basic_info.status} />}
                />
                <DataField
                  label="Supplier Name"
                  value={basic_info.supplier_name}
                />
                <DataField
                  label="Supplier Country"
                  value={basic_info.supplier_country}
                />
              </div>
            </CollapsibleCard>

            <CollapsibleCard
              title="Financial Information"
              icon={<FiDollarSign />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DataField
                  label="LC Amount (USD)"
                  value={formatNumber(financial_info.lc_amount_usd)}
                />
                <DataField
                  label="Exchange Rate"
                  value={financial_info.exchange_rate || "-"}
                />
                <DataField
                  label="LC Amount (BDT)"
                  value={formatNumber(financial_info.lc_amount_bdt)}
                />
                <DataField
                  label="LC Margin Paid (BDT)"
                  value={formatNumber(financial_info.lc_margin_paid_bdt)}
                />
                <DataField
                  label="Bank Charges (BDT)"
                  value={formatNumber(financial_info.bank_charges_bdt)}
                />
                <DataField
                  label="Insurance Cost (BDT)"
                  value={formatNumber(financial_info.insurance_cost_bdt)}
                />
              </div>
              {financial_info.other_expenses?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <h3 className="text-md font-semibold mb-2">Other Expenses</h3>
                  <div className="space-y-2">
                    {financial_info.other_expenses.map((expense) => (
                      <div
                        key={expense._id}
                        className="flex justify-between items-center"
                      >
                        <span className="text-gray-600">{expense.name}</span>
                        <span className="font-medium">
                          {formatNumber(expense.amount)} BDT
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleCard>

            <CollapsibleCard title="Product Information" icon={<FiBox />}>
              {product_info.map((p, index) => (
                <div
                  key={p._id || index}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b  border-gray-300 pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0"
                >
                  <DataField label="Item Name" value={p.item_name} />
                  <DataField
                    label="Unit Price (USD)"
                    value={formatNumber(p.unit_price_usd)}
                  />
                  {p.specification && (
                    <DataField
                      label="Specification"
                      value={[
                        p.specification.thickness_mm &&
                          `Thickness: ${p.specification.thickness_mm}mm`,
                        p.specification.width_mm &&
                          `Width: ${p.specification.width_mm}mm`,
                        p.specification.length_mm &&
                          `Length: ${p.specification.length_mm}mm`,
                        p.specification.grade &&
                          `Grade: ${p.specification.grade}`,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    />
                  )}
                  <DataField
                    label="Total Value (USD)"
                    value={formatNumber(p.total_value_usd)}
                  />
                  <DataField
                    label="Quantity Unit"
                    value={p.quantity_unit || "-"}
                  />
                  <DataField
                    label={`Quantity (${p.quantity_unit || "N/A"})`}
                    value={p.quantity_ton || "-"}
                  />
                  <DataField
                    label="Total Value (BDT)"
                    value={formatNumber(p.total_value_bdt)}
                  />
                </div>
              ))}
            </CollapsibleCard>

            <CollapsibleCard
              title="Shipping & Customs Information"
              icon={<FiTruck />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DataField
                  label="Port of Shipment"
                  value={shipping_customs_info.port_of_shipment}
                />
                <DataField
                  label="Expected Arrival Date"
                  value={formatDate(
                    shipping_customs_info.expected_arrival_date
                  )}
                />
                <DataField
                  label="Customs Duty (BDT)"
                  value={formatNumber(shipping_customs_info.customs_duty_bdt)}
                />
                <DataField
                  label="VAT (BDT)"
                  value={formatNumber(shipping_customs_info.vat_bdt)}
                />
                <DataField
                  label="AIT (BDT)"
                  value={formatNumber(shipping_customs_info.ait_bdt)}
                />
              </div>
              {shipping_customs_info.other_expenses?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <h3 className="text-md font-semibold mb-2">Other Expenses</h3>
                  <div className="space-y-2">
                    {shipping_customs_info.other_expenses.map((expense) => (
                      <div
                        key={expense._id}
                        className="flex justify-between items-center"
                      >
                        <span className="text-gray-600">{expense.name}</span>
                        <span className="font-medium">
                          {formatNumber(expense.amount)} BDT
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleCard>

            <CollapsibleCard
              title="Agent & Transport Information"
              icon={<FiUser />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DataField
                  label="C&F Agent Name"
                  value={agent_transport_info.cnf_agent_name}
                />
                <DataField
                  label="C&F Agent Commission (BDT)"
                  value={formatNumber(
                    agent_transport_info.cnf_agent_commission_bdt
                  )}
                />
                <DataField
                  label="Indenting Agent Commission (BDT)"
                  value={formatNumber(
                    agent_transport_info.indenting_agent_commission_bdt
                  )}
                />
                <DataField
                  label="Transport Cost (BDT)"
                  value={formatNumber(agent_transport_info.transport_cost_bdt)}
                />
              </div>
              {agent_transport_info.other_expenses?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <h3 className="text-md font-semibold mb-2">Other Expenses</h3>
                  <div className="space-y-2">
                    {agent_transport_info.other_expenses.map((expense) => (
                      <div
                        key={expense._id}
                        className="flex justify-between items-center"
                      >
                        <span className="text-gray-600">{expense.name}</span>
                        <span className="font-medium">
                          {formatNumber(expense.amount)} BDT
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleCard>
          </div>

          {/* Sidebar - 1/3 width on large screens */}
          <div className="space-y-4">
            <CollapsibleCard title="Cost Summary" icon={<FiPieChart />}>
              <div className="space-y-3">
                <DataField
                  label="LC Amount (BDT)"
                  value={formatNumber(cost_summary.lc_amount_bdt)}
                />
                <DataField
                  label="Bank Charges (BDT)"
                  value={formatNumber(cost_summary.bank_charges_bdt)}
                />
                <DataField
                  label="Insurance Cost (BDT)"
                  value={formatNumber(cost_summary.insurance_cost_bdt)}
                />
                <DataField
                  label="Other Financial Expenses"
                  value={formatNumber(cost_summary.other_financial_expenses)}
                />
                <DataField
                  label="Customs Total (BDT)"
                  value={formatNumber(cost_summary.customs_total_bdt)}
                />
                <DataField
                  label="Agent Commission (BDT)"
                  value={formatNumber(cost_summary.agent_commission_bdt)}
                />
                <DataField
                  label="Transport & Other (BDT)"
                  value={formatNumber(cost_summary.transport_other_bdt)}
                />
                <hr className="my-4 border-gray-200" />
                <div className="flex justify-between items-center">
                  <p className="font-semibold">Total Cost (BDT)</p>
                  <p className="font-bold text-lg">
                    {formatNumber(cost_summary.total_lc_cost_bdt)}
                  </p>
                </div>
              </div>
            </CollapsibleCard>

            <CollapsibleCard title="Documents & Notes" icon={<FiClipboard />}>
              <div className="space-y-4">
                {documents_notes.uploaded_documents &&
                  documents_notes.uploaded_documents.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-500 mb-2">
                        Uploaded Documents
                      </div>
                      <div className="space-y-2">
                        {documents_notes.uploaded_documents.map((doc) => (
                          <div
                            key={doc._id}
                            className="flex items-center p-2 bg-gray-50 rounded-md"
                          >
                            <FiFile className="text-gray-400 mr-2 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-700 truncate">
                                {doc.original_name}
                              </div>
                            </div>
                            <a
                              href={`${baseUrl}lc/${lcData._id}/documents/${doc.stored_name}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="ml-2 text-[#003b75] hover:text-blue-800"
                            >
                              <FiDownload />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                <DataField label="Remarks" value={documents_notes.remarks} />
              </div>
            </CollapsibleCard>
          </div>
        </div>
      </div>
      <FormDialog
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        primaryButtonText={isDeleting ? "Deleting..." : "Delete"}
        secondaryButtonText="Cancel"
        onSubmit={handleDelete}
        isPrimaryButtonDisabled={isDeleting}
      >
        <p className="text-gray-600">
          Are you sure you want to delete this Letter of Credit (
          {lcData?.basic_info?.lc_number})? This action cannot be undone.
        </p>
      </FormDialog>
    </div>
  );
};

export default LCdetails;
