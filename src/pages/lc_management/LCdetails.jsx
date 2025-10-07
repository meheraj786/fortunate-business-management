import React, { useState } from "react";
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
  FiHome,
  FiMapPin,
  FiCreditCard,
  FiArchive,
  FiPieChart,
  FiDownload,
  FiEdit,
} from "react-icons/fi";
import { motion, AnimatePresence } from "motion/react";
import { useParams } from "react-router";
import { lcData as allLc } from "../../data/data";
import CollapsibleCard from "../../components/common/CollapsibleCard";

const StatusBadge = ({ status }) => {
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
  const lcData = allLc.find((l) => l.id == id);

  const { financial_info, shipping_customs_info, agent_transport_info, product_info } = lcData;

  const customs_total_bdt = shipping_customs_info.customs_duty_bdt + shipping_customs_info.vat_bdt + shipping_customs_info.ait_bdt + shipping_customs_info.other_port_expenses_bdt;
  const transport_other_bdt = agent_transport_info.transport_cost_bdt;
  const total_lc_cost_bdt = financial_info.lc_amount_bdt + financial_info.bank_charges_bdt + financial_info.insurance_cost_bdt + customs_total_bdt + agent_transport_info.cnf_agent_commission_bdt + transport_other_bdt;
  const per_unit_landing_cost_bdt = total_lc_cost_bdt / product_info.quantity_ton;

  const cost_summary = {
    lc_amount_bdt: financial_info.lc_amount_bdt,
    bank_charges_bdt: financial_info.bank_charges_bdt,
    insurance_cost_bdt: financial_info.insurance_cost_bdt,
    customs_total_bdt,
    agent_commission_bdt: agent_transport_info.cnf_agent_commission_bdt,
    transport_other_bdt,
    total_lc_cost_bdt,
    per_unit_landing_cost_bdt
  }

  return (
    <div className="min-h-screen  py-4 px-4 sm:px-6 lg:px-8">
      <div className=" mx-auto">
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
            <button className="flex items-center px-4 py-2 bg-[#003b75] border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700">
              <FiEdit className="mr-2" />
              Edit
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - 2/3 width on large screens */}
          <div className="lg:col-span-2 space-y-4">
            <CollapsibleCard title="Basic LC Information" icon={<FiFile />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DataField label="LC Number" value={lcData.basic_info.lc_number} />
                <DataField label="LC Opening Date" value={lcData.basic_info.lc_opening_date} />
                <DataField label="Bank Name" value={lcData.basic_info.bank_name} />
                <DataField label="Status" value={<StatusBadge status={lcData.basic_info.status} />} />
                <DataField label="Supplier Name" value={lcData.basic_info.supplier_name} />
                <DataField label="Supplier Country" value={lcData.basic_info.supplier_country} />
              </div>
            </CollapsibleCard>

            <CollapsibleCard title="Financial Information" icon={<FiDollarSign />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DataField label="LC Amount (USD)" value={financial_info.lc_amount_usd.toLocaleString()} />
                <DataField label="Exchange Rate" value={financial_info.exchange_rate} />
                <DataField label="LC Amount (BDT)" value={financial_info.lc_amount_bdt.toLocaleString()} />
                <DataField label="LC Margin Paid (BDT)" value={financial_info.lc_margin_paid_bdt.toLocaleString()} />
                <DataField label="Bank Charges (BDT)" value={financial_info.bank_charges_bdt.toLocaleString()} />
                <DataField label="Insurance Cost (BDT)" value={financial_info.insurance_cost_bdt.toLocaleString()} />
              </div>
            </CollapsibleCard>

            <CollapsibleCard title="Product Information" icon={<FiBox />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DataField label="Item Name" value={product_info.item_name} />
                <DataField label="Unit Price (USD)" value={product_info.unit_price_usd.toLocaleString()} />
                <DataField label="Specification" value={`Thickness: ${product_info.specification.thickness_mm}mm, Width: ${product_info.specification.width_mm}mm, Length: ${product_info.specification.length_mm}mm, Grade: ${product_info.specification.grade}`} />
                <DataField label="Total Value (USD)" value={product_info.total_value_usd.toLocaleString()} />
                <DataField label="Quantity (Ton)" value={product_info.quantity_ton} />                
                <DataField label="Total Value (BDT)" value={product_info.total_value_bdt.toLocaleString()} />
              </div>
            </CollapsibleCard>

            <CollapsibleCard title="Shipping & Customs Information" icon={<FiTruck />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DataField label="Port of Shipment" value={shipping_customs_info.port_of_shipment} />
                <DataField label="Port of Arrival" value={shipping_customs_info.port_of_arrival} />
                <DataField label="Expected Arrival Date" value={shipping_customs_info.expected_arrival_date} />
                <DataField label="Actual Arrival Date" value={shipping_customs_info.actual_arrival_date} />
                <DataField label="Customs Duty (BDT)" value={shipping_customs_info.customs_duty_bdt.toLocaleString()} />
                <DataField label="VAT (BDT)" value={shipping_customs_info.vat_bdt.toLocaleString()} />
                <DataField label="AIT (BDT)" value={shipping_customs_info.ait_bdt.toLocaleString()} />
                <DataField label="Other Port Expenses (BDT)" value={shipping_customs_info.other_port_expenses_bdt.toLocaleString()} />
              </div>
            </CollapsibleCard>

            <CollapsibleCard title="Agent & Transport Information" icon={<FiUser />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DataField label="C&F Agent Name" value={agent_transport_info.cnf_agent_name} />
                <DataField label="C&F Agent Commission (BDT)" value={agent_transport_info.cnf_agent_commission_bdt.toLocaleString()} />
                <DataField label="Indenting Agent Commission (BDT)" value={agent_transport_info.indenting_agent_commission_bdt.toLocaleString()} />
                <DataField label="Transport Cost (BDT)" value={agent_transport_info.transport_cost_bdt.toLocaleString()} />
              </div>
            </CollapsibleCard>

          </div>

          {/* Sidebar - 1/3 width on large screens */}
          <div className="space-y-4">

            <CollapsibleCard title="Cost Summary" icon={<FiPieChart />}>
              <div className="space-y-3">
                <DataField label="LC Amount (BDT)" value={cost_summary.lc_amount_bdt.toLocaleString()} />
                <DataField label="Bank Charges (BDT)" value={cost_summary.bank_charges_bdt.toLocaleString()} />
                <DataField label="Insurance Cost (BDT)" value={cost_summary.insurance_cost_bdt.toLocaleString()} />
                <DataField label="Customs Total (BDT)" value={cost_summary.customs_total_bdt.toLocaleString()} />
                <DataField label="Agent Commission (BDT)" value={cost_summary.agent_commission_bdt.toLocaleString()} />
                <DataField label="Transport & Other (BDT)" value={cost_summary.transport_other_bdt.toLocaleString()} />
                <hr className="my-4 border-gray-200" />
                <div className="flex justify-between items-center">
                  <p className="font-semibold">Total Cost (BDT)</p>
                  <p className="font-bold text-lg">{cost_summary.total_lc_cost_bdt.toLocaleString()}</p>
                </div>
                <DataField label="Per Unit Landing Cost (BDT)" value={cost_summary.per_unit_landing_cost_bdt.toLocaleString()} />
              </div>
            </CollapsibleCard>

            <CollapsibleCard title="Documents & Notes" icon={<FiClipboard />}>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-2">Uploaded Documents</div>
                  <div className="space-y-2">
                    {lcData.documents_notes.uploaded_documents.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center p-2 bg-gray-50 rounded-md"
                      >
                        <FiFile className="text-gray-400 mr-2" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-700 truncate">
                            {file}
                          </div>
                        </div>
                        <button className="ml-2 text-[#003b75] hover:text-blue-800">
                          <FiDownload />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <DataField label="Remarks" value={lcData.documents_notes.remarks} />
              </div>
            </CollapsibleCard>

            

          </div>
        </div>
      </div>
    </div>
  );
};

export default LCdetails;
