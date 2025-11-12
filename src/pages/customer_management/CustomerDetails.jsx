import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { customers, salesData } from "../../data/data";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiDollarSign,
  FiFileText,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiBriefcase,
  FiStar,
  FiDownload,
  FiPieChart,
} from "react-icons/fi";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import CollapsibleCard from "../../components/common/CollapsibleCard";
import axios from "axios";
import { UrlContext } from "../../context/UrlContext";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import toast from "react-hot-toast";

const StatusBadge = ({ status }) => {
  let bgColor, icon;

  switch (status?.toLowerCase()) {
    case "active":
      bgColor = "bg-green-100 text-green-800";
      icon = <FiCheckCircle className="mr-1" />;
      break;
    case "inactive":
      bgColor = "bg-gray-100 text-gray-800";
      icon = <FiXCircle className="mr-1" />;
      break;
    case "pending":
      bgColor = "bg-yellow-100 text-yellow-800";
      icon = <FiAlertCircle className="mr-1" />;
      break;
    default:
      bgColor = "bg-gray-100 text-gray-800";
      icon = <FiAlertCircle className="mr-1" />;
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

const DataField = ({ label, value, icon, hidden = false, className = "" }) => {
  if (hidden || !value) return null;

  return (
    <div className={`mb-3 last:mb-0 ${className}`}>
      <div className="flex items-center text-sm text-gray-500 mb-1">
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </div>
      <div className="text-gray-900 font-medium">{value}</div>
    </div>
  );
};

const CustomerDetails = () => {
  const { id } = useParams();
  const [customerData, setCustomerData] = useState(null);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const { baseUrl } = useContext(UrlContext);

  const navigate = useNavigate();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    axios
      .get(`${baseUrl}customer/get-customer/${id}`)
      .then((res) => {
        console.log("Response:", res.data.data);
        setCustomerData(res.data.data);
      })
      .catch((err) => console.error(err));

    axios
      .get(`${baseUrl}sales/customer/${id}`)
      .then((res) => {
        setRecentPurchases(res.data.data);
      })
      .catch((err) => console.error(err));
  }, [id, baseUrl]);

  const handleDelete = async () => {
    setIsConfirming(true);
    try {
      const res = await axios.delete(
        `${baseUrl}customer/delete-customer/${id}`
      );
      console.log("Delete Response:", res.data);
      toast.success("Customer deleted successfully!");
      navigate("/customers");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete customer.");
    } finally {
      setIsConfirming(false);
      setIsConfirmModalOpen(false);
    }
  };

  if (!customerData) {
    return <div>Customer not found</div>;
  }

  return (
    <div className="min-h-screen py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <FiUser className="text-[#003b75] text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {customerData?.name}
              </h1>
              <div className="flex items-center mt-1">
                <span className="text-gray-600 mr-3">
                  {customerData?.customerId}
                </span>
                <StatusBadge status={customerData?.customerStatus} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-x-3">
            <button
              onClick={() => navigate(`/customer-form/${id}`)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <FiEdit size={20} />
              Edit Customer
            </button>
            <button
              onClick={() => setIsConfirmModalOpen(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <FiTrash2 size={20} />
              Delete Customer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 */}
          <div className="space-y-4 lg:order-1 lg:col-span-2">
            <CollapsibleCard title="General Info" icon={<FiUser />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DataField
                  label="Company Name"
                  value={customerData?.companyName}
                  icon={<FiBriefcase />}
                />

                <DataField
                  label="Email"
                  value={customerData?.email}
                  icon={<FiMail />}
                />

                <DataField
                  label="Billing Address"
                  value={customerData?.billingAddress}
                  icon={<FiMapPin />}
                />

                <DataField
                  label="Credit Limit"
                  value={customerData?.creditLimit?.toLocaleString()}
                  icon={<FiDollarSign />}
                />

                <DataField
                  label="Customer Status"
                  value={<StatusBadge status={customerData?.customerStatus} />}
                />

                <DataField
                  label="Customer Type"
                  value={customerData?.customerType}
                />

                <DataField
                  label="Customer Joined Date"
                  value={customerData?.joinDate}
                  icon={<FiCalendar />}
                />

                <DataField
                  label="Customer Note"
                  value={customerData?.customerNote}
                />
              </div>
            </CollapsibleCard>

            <div className="lg:hidden">
              <CollapsibleCard title="Status Info" icon={<FiStar />}>
                <div className="space-y-3">
                  <DataField
                    label="Customer ID"
                    value={customerData?.customerId}
                  />
                  <DataField
                    label="Customer Type"
                    value={customerData?.customerType}
                  />
                  <DataField
                    label="Customer Status"
                    value={
                      <StatusBadge status={customerData?.customerStatus} />
                    }
                  />
                  <DataField
                    label="Customer Joined Date"
                    value={customerData?.joinDate}
                    icon={<FiCalendar />}
                  />
                </div>
              </CollapsibleCard>
            </div>

            <div className="lg:hidden">
              <CollapsibleCard title="Others" icon={<FiFileText />}>
                <DataField
                  label="Customer Note"
                  value={customerData?.customerNote}
                  icon={<FiFileText />}
                  className="sm:col-span-2"
                />
                <div className="space-y-2 mt-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Uploaded Documents
                  </h3>
                  {customerData?.documents?.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center p-2 bg-gray-50 rounded-md"
                    >
                      <FiFileText className="text-gray-400 mr-2" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-700 truncate">
                          {file.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {file.type} • {file.size} • {file.uploadDate}
                        </div>
                      </div>
                      <button className="ml-2 text-[#003b75] hover:text-blue-800">
                        <FiDownload />
                      </button>
                    </div>
                  ))}
                </div>
              </CollapsibleCard>
            </div>

            <CollapsibleCard title="Transaction Overview" icon={<FiPieChart />}>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-700">
                    {customerData?.stats?.totalPurchases || 0}
                  </div>
                  <div className="text-sm text-[#003b75]">Total Purchases</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-700">
                    ${(customerData?.stats?.totalSpent || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-green-600">Total Spent</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-700">
                    {customerData?.stats?.notInvoiced || 0}
                  </div>
                  <div className="text-sm text-yellow-600">Not Invoiced</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-700">
                    $
                    {(
                      customerData?.stats?.outstandingDues || 0
                    ).toLocaleString()}
                  </div>
                  <div className="text-sm text-red-600">Outstanding Dues</div>
                </div>
              </div>
            </CollapsibleCard>
          </div>

          {/* Column 2 */}
          <div className="space-y-4 lg:order-2 lg:col-span-1">
            <div className="hidden lg:block">
              <CollapsibleCard title="Status Info" icon={<FiStar />}>
                <div className="space-y-3">
                  <DataField
                    label="Customer ID"
                    value={customerData?.customerId}
                  />
                  <DataField
                    label="Customer Type"
                    value={customerData?.customerType}
                  />
                  <DataField
                    label="Customer Status"
                    value={
                      <StatusBadge status={customerData?.customerStatus} />
                    }
                  />
                  <DataField
                    label="Customer Joined Date"
                    value={customerData?.joinDate}
                    icon={<FiCalendar />}
                  />
                </div>
              </CollapsibleCard>
            </div>

            <div className="hidden lg:block">
              <CollapsibleCard title="Others" icon={<FiFileText />}>
                <DataField
                  label="Customer Note"
                  value={customerData?.customerNote}
                  icon={<FiFileText />}
                  className="sm:col-span-2"
                />
                <div className="space-y-2 mt-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Uploaded Documents
                  </h3>
                  {customerData?.documents?.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center p-2 bg-gray-50 rounded-md"
                    >
                      <FiFileText className="text-gray-400 mr-2" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-700 truncate">
                          {file.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {file.type} • {file.size} • {file.uploadDate}
                        </div>
                      </div>
                      <button className="ml-2 text-[#003b75] hover:text-blue-800">
                        <FiDownload />
                      </button>
                    </div>
                  ))}
                </div>
              </CollapsibleCard>
            </div>
          </div>
        </div>

        <div className="mt-3 lg:col-span-3">
          <CollapsibleCard title="Recent Purchases" icon={<FiDollarSign />}>
            <div className="block sm:hidden">
              <div className="space-y-2">
                {recentPurchases.map((sale) => (
                  <div
                    key={sale._id}
                    className="border-t border-gray-200 last:border-b bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="px-4 py-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium text-gray-900">
                          {sale.product.name}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(sale.saleDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          Qty: {sale.quantity}
                        </span>
                        <span className="text-gray-600">
                          Price: $
                          {parseFloat(sale.pricePerUnit || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="border-t border-gray-100 my-2"></div>
                      <div className="flex justify-between items-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            sale.invoiceStatus === "Invoiced"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {sale.invoiceStatus}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            sale.paymentStatus === "Paid Payment"
                              ? "bg-green-100 text-green-800"
                              : sale.paymentStatus === "Due Payment"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {sale.paymentStatus}
                        </span>
                      </div>
                      <div className="border-t border-gray-100 my-2"></div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Total</span>
                        <span className="font-bold text-gray-900">
                          ${(sale.totalAmount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {recentPurchases.length === 0 && (
                  <div className="text-center py-8 text-gray-500 border-t">
                    No sales data available for this customer.
                  </div>
                )}
              </div>
            </div>
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      LC Number
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentPurchases.map((sale) => (
                    <tr key={sale._id}>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {new Date(sale.saleDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-[#003b75]">
                        {sale.product.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {sale.product.LC?.basic_info?.lc_number || "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {sale.quantity} {sale.unit}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        ${sale.pricePerUnit.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        ${sale.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={sale.invoiceStatus} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={sale.paymentStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleCard>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Customer"
        description={`Are you sure you want to delete customer "${customerData?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isConfirming={isConfirming}
        confirmingText="Deleting..."
        icon={FiTrash2}
        iconBgColor="bg-red-100"
        iconTextColor="text-red-600"
        confirmButtonBgColor="bg-red-600"
        confirmButtonHoverBgColor="hover:bg-red-700"
      />
    </div>
  );
};

export default CustomerDetails;
