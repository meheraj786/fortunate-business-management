import React, { useState } from 'react';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiGlobe,
  FiDollarSign,
  FiCreditCard,
  FiFileText,
  FiShoppingBag,
  FiPieChart,
  FiClipboard,
  FiEdit,
  FiDownload,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiHome,
  FiBriefcase,
  FiStar
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import { useParams } from 'react-router';
import { customers } from '../../data/data';


// Mock customer data
// const customerData = {
//   basicInfo: {
//     customerId: 'CUST-2023-0896',
//     name: 'Global Imports Inc.',
//     type: 'Wholesale',
//     status: 'Active',
//     profilePhoto: null,
//     joinDate: '2022-05-15',
//     customerTier: 'Gold'
//   },
//   contactInfo: {
//     phone: '+1 (555) 123-4567',
//     email: 'purchase@globalimports.com',
//     website: 'www.globalimports.com',
//     billingAddress: '123 Trade Center, New York, NY 10001, USA',
//     shippingAddress: '123 Trade Center, New York, NY 10001, USA',
//     contactPerson: 'Michael Johnson',
//     contactPersonPhone: '+1 (555) 987-6543',
//     contactPersonEmail: 'michael@globalimports.com'
//   },
//   businessInfo: {
//     companyName: 'Global Imports Inc.',
//     businessType: 'Importer & Distributor',
//     tradeLicense: 'TL-78945613',
//     tin: 'TIN-987654321',
//     vatInfo: 'VAT Registered (NY-789456)',
//     creditLimit: 50000,
//     paymentTerms: 'Net 30 days',
//     currency: 'USD'
//   },
//   bankInfo: {
//     bankName: 'New York Commercial Bank',
//     branch: 'Main Branch',
//     accountNumber: '********1234',
//     routingNumber: '021000021',
//     swiftCode: 'NYCBUS33',
//     iban: 'US33NYCB1234567890'
//   },
//   transactionHistory: {
//     totalPurchases: 245000,
//     outstandingDues: 12500,
//     advancePaid: 0,
//     lastPurchaseDate: '2023-10-28',
//     lastPurchaseAmount: 18500,
//     totalTransactions: 47,
//     averageOrderValue: 5212
//   },
//   lcLinks: [
//     { lcNumber: 'LC-2023-0875', status: 'Open', value: 125000, issueDate: '2023-10-15' },
//     { lcNumber: 'LC-2023-0654', status: 'Closed', value: 85000, issueDate: '2023-07-22' },
//     { lcNumber: 'LC-2023-0421', status: 'Closed', value: 35000, issueDate: '2023-04-10' }
//   ],
//   documents: [
//     { name: 'Trade_License.pdf', type: 'PDF', size: '2.4 MB', uploadDate: '2022-05-20' },
//     { name: 'Contract_Agreement.pdf', type: 'PDF', size: '3.8 MB', uploadDate: '2022-05-18' },
//     { name: 'Tax_Certificate.pdf', type: 'PDF', size: '1.5 MB', uploadDate: '2022-06-05' }
//   ],
//   notes: {
//     remarks: 'VIP Customer - Prefers email communication. Usually pays on time. Large order volume during holiday season.',
//     assignedManager: 'Sarah Johnson',
//     managerContact: 'sarah@company.com',
//     lastContact: '2023-10-25',
//     nextFollowUp: '2023-11-15',
//     specialInstructions: 'Offer seasonal discounts. Provide priority shipping during peak seasons.'
//   }
// };

const StatusBadge = ({ status }) => {
  let bgColor, icon;
  
  switch(status.toLowerCase()) {
    case 'active':
      bgColor = 'bg-green-100 text-green-800';
      icon = <FiCheckCircle className="mr-1" />;
      break;
    case 'inactive':
      bgColor = 'bg-gray-100 text-gray-800';
      icon = <FiXCircle className="mr-1" />;
      break;
    case 'blacklisted':
      bgColor = 'bg-red-100 text-red-800';
      icon = <FiAlertCircle className="mr-1" />;
      break;
    default:
      bgColor = 'bg-gray-100 text-gray-800';
      icon = <FiAlertCircle className="mr-1" />;
  }
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bgColor}`}>
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
        {isOpen ? 
          <FiAlertCircle className="text-gray-500 transform rotate-180 transition-transform" /> : 
          <FiAlertCircle className="text-gray-500" />
        }
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
  const {id}=useParams()
  const customerData=customers.find((c)=>c.id==id)
  return (
    <div className="min-h-screen  py-4 px-4 sm:px-6 lg:px-8">
      <div className=" mx-auto">
        <motion.div 
          className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <FiUser className="text-[#003b75] text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{customerData.basicInfo.name}</h1>
              <div className="flex items-center mt-1">
                <span className="text-gray-600 mr-3">{customerData.basicInfo.customerId}</span>
                <StatusBadge status={customerData.basicInfo.status} />
                {customerData.basicInfo.customerTier && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <FiStar className="mr-1" />
                    {customerData.basicInfo.customerTier}
                  </span>
                )}
              </div>
            </div>
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
            {/* Contact Information */}
            <SectionCard title="Contact Information" icon={<FiMail />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DataField label="Phone" value={customerData.contactInfo.phone} icon={<FiPhone />} />
                <DataField label="Email" value={customerData.contactInfo.email} icon={<FiMail />} />
                <DataField label="Website" value={customerData.contactInfo.website} icon={<FiGlobe />} />
                <DataField label="Contact Person" value={customerData.contactInfo.contactPerson} icon={<FiUser />} />
                <DataField label="Contact Phone" value={customerData.contactInfo.contactPersonPhone} icon={<FiPhone />} />
                <DataField label="Contact Email" value={customerData.contactInfo.contactPersonEmail} icon={<FiMail />} />
                <DataField label="Billing Address" value={customerData.contactInfo.billingAddress} icon={<FiMapPin />} className="sm:col-span-2" />
                <DataField label="Shipping Address" value={customerData.contactInfo.shippingAddress} icon={<FiMapPin />} className="sm:col-span-2" />
              </div>
            </SectionCard>
            
            {/* Business Information */}
            <SectionCard title="Business Information" icon={<FiBriefcase />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DataField label="Company Name" value={customerData.businessInfo.companyName} icon={<FiHome />} />
                <DataField label="Business Type" value={customerData.businessInfo.businessType} icon={<FiBriefcase />} />
                <DataField label="Trade License" value={customerData.businessInfo.tradeLicense} icon={<FiFileText />} />
                <DataField label="TIN Number" value={customerData.businessInfo.tin} icon={<FiFileText />} />
                <DataField label="VAT Info" value={customerData.businessInfo.vatInfo} icon={<FiFileText />} />
                <DataField label="Credit Limit" value={`${customerData.businessInfo.currency} ${customerData.businessInfo.creditLimit.toLocaleString()}`} icon={<FiDollarSign />} />
                <DataField label="Payment Terms" value={customerData.businessInfo.paymentTerms} icon={<FiCreditCard />} />
              </div>
            </SectionCard>
            
            {/* Transaction History */}
            <SectionCard title="Transaction History" icon={<FiPieChart />}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-700">
                    {customerData.transactionHistory.totalTransactions}
                  </div>
                  <div className="text-sm text-[#003b75]">Total Transactions</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-700">
                    {customerData.businessInfo.currency} {customerData.transactionHistory.totalPurchases.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-600">Total Purchases</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-700">
                    {customerData.businessInfo.currency} {customerData.transactionHistory.outstandingDues.toLocaleString()}
                  </div>
                  <div className="text-sm text-red-600">Outstanding Dues</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-700">
                    {customerData.businessInfo.currency} {customerData.transactionHistory.averageOrderValue.toLocaleString()}
                  </div>
                  <div className="text-sm text-purple-600">Avg. Order Value</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DataField label="Last Purchase Date" value={customerData.transactionHistory.lastPurchaseDate} icon={<FiCalendar />} />
                <DataField label="Last Purchase Amount" value={`${customerData.businessInfo.currency} ${customerData.transactionHistory.lastPurchaseAmount.toLocaleString()}`} icon={<FiDollarSign />} />
                <DataField label="Advance Paid" value={`${customerData.businessInfo.currency} ${customerData.transactionHistory.advancePaid.toLocaleString()}`} icon={<FiDollarSign />} />
              </div>
            </SectionCard>
            
            {/* Linked LCs/Orders */}
            <SectionCard title="Linked LCs/Orders" icon={<FiClipboard />}>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LC Number</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customerData.lcLinks.map((lc, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-[#003b75]">
                          {lc.lcNumber}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500">{lc.issueDate}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                          {customerData.businessInfo.currency} {lc.value.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusBadge status={lc.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
          
          {/* Sidebar - 1/3 width on large screens */}
          <div className="space-y-4">
            {/* Basic Information */}
            <SectionCard title="Basic Information" icon={<FiUser />}>
              <div className="space-y-3">
                <DataField label="Customer ID" value={customerData.basicInfo.customerId} />
                <DataField label="Customer Type" value={customerData.basicInfo.type} />
                <DataField label="Status" value={<StatusBadge status={customerData.basicInfo.status} />} />
                <DataField label="Join Date" value={customerData.basicInfo.joinDate} icon={<FiCalendar />} />
                <DataField label="Customer Tier" value={customerData.basicInfo.customerTier} icon={<FiStar />} />
              </div>
            </SectionCard>
            
            {/* Bank Information */}
            <SectionCard title="Bank Information" icon={<FiCreditCard />}>
              <div className="space-y-3">
                <DataField label="Bank Name" value={customerData.bankInfo.bankName} />
                <DataField label="Branch" value={customerData.bankInfo.branch} />
                <DataField label="Account Number" value={customerData.bankInfo.accountNumber} />
                <DataField label="Routing Number" value={customerData.bankInfo.routingNumber} />
                <DataField label="SWIFT Code" value={customerData.bankInfo.swiftCode} />
                <DataField label="IBAN" value={customerData.bankInfo.iban} />
              </div>
            </SectionCard>
            
            {/* Documents */}
            <SectionCard title="Documents" icon={<FiFileText />}>
              <div className="space-y-2">
                {customerData.documents.map((file, index) => (
                  <div key={index} className="flex items-center p-2 bg-gray-50 rounded-md">
                    <FiFileText className="text-gray-400 mr-2" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-700 truncate">{file.name}</div>
                      <div className="text-xs text-gray-500">{file.type} • {file.size} • {file.uploadDate}</div>
                    </div>
                    <button className="ml-2 text-[#003b75] hover:text-blue-800">
                      <FiDownload />
                    </button>
                  </div>
                ))}
              </div>
            </SectionCard>
            
            {/* Notes & Tracking */}
            <SectionCard title="Notes & Tracking" icon={<FiClipboard />}>
              <div className="space-y-3">
                <DataField label="Assigned Manager" value={customerData.notes.assignedManager} icon={<FiUser />} />
                <DataField label="Manager Contact" value={customerData.notes.managerContact} icon={<FiMail />} />
                <DataField label="Last Contact" value={customerData.notes.lastContact} icon={<FiCalendar />} />
                <DataField label="Next Follow-up" value={customerData.notes.nextFollowUp} icon={<FiCalendar />} />
                
                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <FiClipboard className="mr-2" />
                    Remarks
                  </div>
                  <div className="text-gray-900 font-medium">{customerData.notes.remarks}</div>
                </div>
                
                <div>
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <FiAlertCircle className="mr-2" />
                    Special Instructions
                  </div>
                  <div className="text-gray-900 font-medium">{customerData.notes.specialInstructions}</div>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;