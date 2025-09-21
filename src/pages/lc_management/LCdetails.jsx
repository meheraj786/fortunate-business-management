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
  FiPhone,
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

const lcData = {
  basicInfo: {
    lcNumber: "LC-2023-0875",
    lcType: "Sight LC",
    issueDate: "2023-10-15",
    expiryDate: "2024-04-15",
    lcValue: 125000,
    currency: "USD",
    status: "Open",
  },
  buyerInfo: {
    name: "John Smith",
    company: "Global Imports Inc.",
    address: "123 Trade Center, New York, NY 10001, USA",
    contactPerson: "Michael Johnson",
    phone: "+1 (555) 123-4567",
    email: "purchase@globalimports.com",
  },
  sellerInfo: {
    name: "Zhang Wei",
    company: "Shanghai Manufacturing Co.",
    address: "456 Industrial Zone, Pudong, Shanghai, China",
    bankName: "Bank of China",
    accountNumber: "9876543210",
    swiftCode: "BKCHCNBJ",
    email: "wei@shanghaimfg.com",
  },
  bankInfo: {
    issuingBank: "New York Commercial Bank",
    advisingBank: "Bank of China Shanghai Branch",
    correspondentBank: "Standard Chartered Bank",
    swiftCode: "NYCBUS33",
    branch: "Main Branch",
    accountManager: "Sarah Williams",
    managerContact: "sarah.w@nycb.com",
  },
  shipmentInfo: {
    portOfLoading: "Shanghai Port, China",
    portOfDischarge: "Port of New York, USA",
    shipmentDate: "2024-03-10",
    lastShipmentDate: "2024-03-20",
    transportType: "Sea Freight",
    shippingCompany: "Maersk Line",
    insurance: "All Risk Coverage by Ping An Insurance",
    incoterms: "CIF",
  },
  goodsInfo: [
    {
      productName: "Electronic Components",
      hsCode: "8542.31.00",
      quantity: 5000,
      unit: "PCS",
      unitPrice: 20,
      totalValue: 100000,
      description: "High-quality electronic components for industrial use",
    },
    {
      productName: "LED Displays",
      hsCode: "8531.20.00",
      quantity: 500,
      unit: "PCS",
      unitPrice: 50,
      totalValue: 25000,
      description: "Full HD LED displays, 55-inch",
    },
  ],
  paymentInfo: {
    terms: "At Sight",
    marginAmount: 25000,
    bankCharges: 500,
    commission: 750,
    dueDate: "2024-04-05",
    status: "Pending",
    paidAmount: 0,
    paymentDate: "",
  },
  documentsRequired: [
    "Commercial Invoice",
    "Packing List",
    "Bill of Lading",
    "Insurance Certificate",
    "Certificate of Origin",
    "Inspection Certificate",
  ],
  tracking: {
    status: "Documents Submitted",
    remarks:
      "Waiting for document verification. All documents submitted on March 15, 2024.",
    attachments: [
      { name: "LC_Application.pdf", type: "PDF", size: "2.4 MB" },
      { name: "Proforma_Invoice.pdf", type: "PDF", size: "1.8 MB" },
      { name: "Contract_Agreement.pdf", type: "PDF", size: "3.2 MB" },
    ],
    lastUpdated: "2024-03-15 14:30",
  },
};

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

const SectionCard = ({ title, icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <button
        className="w-full flex items-center justify-between p-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <span className="text-[#003b75] mr-3 text-lg">{icon}</span>
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>
        {isOpen ? (
          <FiAlertCircle className="text-gray-500 transform rotate-180 transition-transform" />
        ) : (
          <FiAlertCircle className="text-gray-500" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
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
            {/* Basic LC Information */}
            <SectionCard title="Basic LC Information" icon={<FiFile />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DataField
                  label="LC Number"
                  value={lcData.basicInfo.lcNumber}
                />
                <DataField label="LC Type" value={lcData.basicInfo.lcType} />
                <DataField
                  label="Issue Date"
                  value={lcData.basicInfo.issueDate}
                />
                <DataField
                  label="Expiry Date"
                  value={lcData.basicInfo.expiryDate}
                />
                <DataField
                  label="LC Value"
                  value={`${
                    lcData.basicInfo.currency
                  } ${lcData.basicInfo.lcValue.toLocaleString()}`}
                />
                <DataField
                  label="Status"
                  value={<StatusBadge status={lcData.basicInfo.status} />}
                />
              </div>
            </SectionCard>

            {/* Payment Information */}
            <SectionCard title="Payment Information" icon={<FiDollarSign />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DataField
                  label="Payment Terms"
                  value={lcData.paymentInfo.terms}
                />
                <DataField
                  label="Due Date"
                  value={lcData.paymentInfo.dueDate}
                />
                <DataField
                  label="Margin Amount"
                  value={`${
                    lcData.basicInfo.currency
                  } ${lcData.paymentInfo.marginAmount.toLocaleString()}`}
                />
                <DataField
                  label="Bank Charges"
                  value={`${
                    lcData.basicInfo.currency
                  } ${lcData.paymentInfo.bankCharges.toLocaleString()}`}
                />
                <DataField
                  label="Commission/Fees"
                  value={`${
                    lcData.basicInfo.currency
                  } ${lcData.paymentInfo.commission.toLocaleString()}`}
                />
                <DataField
                  label="Payment Status"
                  value={<StatusBadge status={lcData.paymentInfo.status} />}
                />
                <DataField
                  label="Paid Amount"
                  value={`${
                    lcData.basicInfo.currency
                  } ${lcData.paymentInfo.paidAmount.toLocaleString()}`}
                />
              </div>
            </SectionCard>

            {/* Goods Information */}
            <SectionCard title="Goods / Product Details" icon={<FiBox />}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        HS Code
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lcData.goodsInfo.map((good, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {good.productName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {good.description}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                          {good.hsCode}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                          {good.quantity.toLocaleString()} {good.unit}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                          {lcData.basicInfo.currency}{" "}
                          {good.unitPrice.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-medium">
                          {lcData.basicInfo.currency}{" "}
                          {good.totalValue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td
                        colSpan="4"
                        className="px-4 py-3 text-right font-medium text-gray-700"
                      >
                        Total LC Value:
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-bold">
                        {lcData.basicInfo.currency}{" "}
                        {lcData.basicInfo.lcValue.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </SectionCard>

            {/* Shipment Information */}
            <SectionCard title="Shipment Information" icon={<FiTruck />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DataField
                  label="Port of Loading"
                  value={lcData.shipmentInfo.portOfLoading}
                  icon={<FiMapPin />}
                />
                <DataField
                  label="Port of Discharge"
                  value={lcData.shipmentInfo.portOfDischarge}
                  icon={<FiMapPin />}
                />
                <DataField
                  label="Shipment Date"
                  value={lcData.shipmentInfo.shipmentDate}
                />
                <DataField
                  label="Last Shipment Date"
                  value={lcData.shipmentInfo.lastShipmentDate}
                />
                <DataField
                  label="Transport Type"
                  value={lcData.shipmentInfo.transportType}
                />
                <DataField
                  label="Shipping Company"
                  value={lcData.shipmentInfo.shippingCompany}
                />
                <DataField
                  label="Incoterms"
                  value={lcData.shipmentInfo.incoterms}
                />
                <DataField
                  label="Insurance"
                  value={lcData.shipmentInfo.insurance}
                />
              </div>
            </SectionCard>

            {/* Documents Required */}
            <SectionCard title="Documents Required" icon={<FiClipboard />}>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lcData.documentsRequired.map((doc, index) => (
                  <li key={index} className="flex items-center py-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">{doc}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>

          {/* Sidebar - 1/3 width on large screens */}
          <div className="space-y-4">
            {/* Tracking & Status */}
            <SectionCard title="Tracking & Status" icon={<FiPieChart />}>
              <div className="space-y-4">
                <DataField
                  label="Current Status"
                  value={<StatusBadge status={lcData.tracking.status} />}
                />
                <DataField
                  label="Last Updated"
                  value={lcData.tracking.lastUpdated}
                />
                <DataField label="Remarks" value={lcData.tracking.remarks} />

                <div>
                  <div className="text-sm text-gray-500 mb-2">Attachments</div>
                  <div className="space-y-2">
                    {lcData.tracking.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center p-2 bg-gray-50 rounded-md"
                      >
                        <FiFile className="text-gray-400 mr-2" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-700 truncate">
                            {file.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {file.type} • {file.size}
                          </div>
                        </div>
                        <button className="ml-2 text-[#003b75] hover:text-blue-800">
                          <FiDownload />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Buyer Information */}
            <SectionCard title="Buyer Information" icon={<FiUser />}>
              <div className="space-y-3">
                <DataField
                  label="Buyer/Importer Name"
                  value={lcData.buyerInfo.name}
                  icon={<FiUser />}
                />
                <DataField
                  label="Company Name"
                  value={lcData.buyerInfo.company}
                  icon={<FiHome />}
                />
                <DataField
                  label="Address"
                  value={lcData.buyerInfo.address}
                  icon={<FiMapPin />}
                />
                <DataField
                  label="Contact Person"
                  value={lcData.buyerInfo.contactPerson}
                  icon={<FiUser />}
                />
                <DataField
                  label="Phone"
                  value={lcData.buyerInfo.phone}
                  icon={<FiPhone />}
                />
                <DataField
                  label="Email"
                  value={lcData.buyerInfo.email}
                  icon={<FiArchive />}
                />
              </div>
            </SectionCard>

            {/* Seller Information */}
            <SectionCard title="Seller Information" icon={<FiUser />}>
              <div className="space-y-3">
                <DataField
                  label="Seller/Exporter Name"
                  value={lcData.sellerInfo.name}
                  icon={<FiUser />}
                />
                <DataField
                  label="Company Name"
                  value={lcData.sellerInfo.company}
                  icon={<FiHome />}
                />
                <DataField
                  label="Address"
                  value={lcData.sellerInfo.address}
                  icon={<FiMapPin />}
                />
                <DataField
                  label="Email"
                  value={lcData.sellerInfo.email}
                  icon={<FiArchive />}
                />
                <DataField
                  label="Bank Name"
                  value={lcData.sellerInfo.bankName}
                  icon={<FiCreditCard />}
                />
                <DataField
                  label="Account Number"
                  value={lcData.sellerInfo.accountNumber}
                  icon={<FiCreditCard />}
                />
                <DataField
                  label="SWIFT Code"
                  value={lcData.sellerInfo.swiftCode}
                  icon={<FiCreditCard />}
                />
              </div>
            </SectionCard>

            {/* Bank Information */}
            <SectionCard title="Bank Information" icon={<FiCreditCard />}>
              <div className="space-y-3">
                <DataField
                  label="Issuing Bank"
                  value={lcData.bankInfo.issuingBank}
                  icon={<FiCreditCard />}
                />
                <DataField
                  label="Advising Bank"
                  value={lcData.bankInfo.advisingBank}
                  icon={<FiCreditCard />}
                />
                <DataField
                  label="Correspondent Bank"
                  value={lcData.bankInfo.correspondentBank}
                  icon={<FiCreditCard />}
                />
                <DataField
                  label="SWIFT Code"
                  value={lcData.bankInfo.swiftCode}
                  icon={<FiCreditCard />}
                />
                <DataField
                  label="Branch"
                  value={lcData.bankInfo.branch}
                  icon={<FiHome />}
                />
                <DataField
                  label="Account Manager"
                  value={lcData.bankInfo.accountManager}
                  icon={<FiUser />}
                />
                <DataField
                  label="Manager Contact"
                  value={lcData.bankInfo.managerContact}
                  icon={<FiArchive />}
                />
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LCdetails;
