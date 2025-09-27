import React, { useState } from 'react';
import { BarChart3, CreditCard, Package, Users, Building2, TrendingUp, DollarSign, AlertTriangle, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';

// Data imports (using the provided data structure) - All amounts converted to BDT
const usdToBdtRate = 110; // Current USD to BDT conversion rate

const lcData = [
  {
    id: 1,
    lcNumber: "LC-2023-001",
    status: "Active",
    openDate: "15/08/2023",
    dueDate: "15/11/2023",
    products: "Cotton Fabric, Polyester",
    quantity: "5000 yards",
    totalAmount: "৳49,77,500",
    beneficiary: "ABC Textiles Ltd",
    basicInfo: {
      lcNumber: "LC-2023-001",
      lcType: "Sight LC",
      issueDate: "2023-08-15",
      expiryDate: "2023-11-15",
      lcValue: 4977500, // 45250 * 110
      currency: "BDT",
      status: "Active",
    }
  },
  {
    id: 2,
    lcNumber: "LC-2023-002",
    status: "Expired",
    openDate: "22/07/2023",
    dueDate: "22/10/2023",
    products: "Rice, Wheat",
    quantity: "2000 MT",
    totalAmount: "৳1,38,38,000",
    beneficiary: "XYZ Trading Co",
    basicInfo: {
      lcNumber: "LC-2023-002",
      lcType: "Usance LC",
      issueDate: "2023-07-22",
      expiryDate: "2023-10-22",
      lcValue: 13838000, // 125800 * 110
      currency: "BDT",
      status: "Expired",
    }
  },
  {
    id: 3,
    lcNumber: "LC-2023-003",
    status: "Pending",
    openDate: "10/09/2023",
    dueDate: "10/12/2023",
    products: "Electronics Components",
    quantity: "1500 units",
    totalAmount: "৳98,56,000",
    beneficiary: "Tech Solutions Inc",
    basicInfo: {
      lcNumber: "LC-2023-003",
      lcType: "Sight LC",
      issueDate: "2023-09-10",
      expiryDate: "2023-12-10",
      lcValue: 9856000, // 89600 * 110
      currency: "BDT",
      status: "Pending",
    }
  },
  {
    id: 4,
    lcNumber: "LC-2023-004",
    status: "Active",
    openDate: "05/09/2023",
    dueDate: "05/01/2024",
    products: "Leather Goods",
    quantity: "800 pieces",
    totalAmount: "৳35,64,000",
    beneficiary: "Premium Leather Co",
    basicInfo: {
      lcNumber: "LC-2023-004",
      lcType: "Sight LC",
      issueDate: "2023-09-05",
      expiryDate: "2024-01-05",
      lcValue: 3564000, // 32400 * 110
      currency: "BDT",
      status: "Active",
    }
  },
  {
    id: 5,
    lcNumber: "LC-2023-005",
    status: "Completed",
    openDate: "18/06/2023",
    dueDate: "18/09/2023",
    products: "Tea, Spices",
    quantity: "3000 kg",
    totalAmount: "৳20,62,500",
    beneficiary: "Spice Garden Ltd",
    basicInfo: {
      lcNumber: "LC-2023-005",
      lcType: "Sight LC",
      issueDate: "2023-06-18",
      expiryDate: "2023-09-18",
      lcValue: 2062500, // 18750 * 110
      currency: "BDT",
      status: "Completed",
    }
  },
  {
    id: 6,
    lcNumber: "LC-2023-006",
    status: "Under Review",
    openDate: "12/09/2023",
    dueDate: "12/12/2023",
    products: "Pharmaceutical Items",
    quantity: "500 units",
    totalAmount: "৫74,67,900",
    beneficiary: "MediCare Pharma",
    basicInfo: {
      lcNumber: "LC-2023-006",
      lcType: "Standby LC",
      issueDate: "2023-09-12",
      expiryDate: "2023-12-12",
      lcValue: 7467900, // 67890 * 110
      currency: "BDT",
      status: "Under Review",
    }
  }
];

const customers = [
  {
    id: 1,
    name: "Ahmed Hassan",
    phone: "+880 1712-345678",
    location: "Dhaka, Bangladesh",
    totalPurchased: "৳3,57,500", // $3,250 * 110
    lastPurchase: "20 Sep 2023",
    status: "Active"
  },
  {
    id: 2,
    name: "Sarah Khan",
    phone: "+880 1523-456789",
    location: "Chittagong, Bangladesh",
    totalPurchased: "৳2,07,955", // $1,890.50 * 110
    lastPurchase: "18 Sep 2023",
    status: "Active"
  },
  {
    id: 3,
    name: "Mohammad Ali",
    phone: "+880 1634-567890",
    location: "Sylhet, Bangladesh",
    totalPurchased: "৳4,53,283", // $4,120.75 * 110
    lastPurchase: "12 Sep 2023",
    status: "Inactive"
  },
  {
    id: 4,
    name: "Fatima Rahman",
    phone: "+880 1845-678901",
    location: "Rajshahi, Bangladesh",
    totalPurchased: "৳2,94,278", // $2,675.25 * 110
    lastPurchase: "25 Aug 2023",
    status: "Pending"
  },
  {
    id: 5,
    name: "Karim Ahmed",
    phone: "+880 1956-789012",
    location: "Khulna, Bangladesh",
    totalPurchased: "৳5,99,500", // $5,450 * 110
    lastPurchase: "22 Sep 2023",
    status: "Active"
  },
  {
    id: 6,
    name: "Nadia Islam",
    phone: "+880 1367-890123",
    location: "Barishal, Bangladesh",
    totalPurchased: "৳1,35,383", // $1,230.75 * 110
    lastPurchase: "10 Sep 2023",
    status: "Pending"
  }
];

const products = [
  { id: 1, name: "Mild Steel Rod", category: "Steel Rods", quantity: 150, unitPrice: "৳2,805", location: "Warehouse A" }, // $25.50 * 110
  { id: 2, name: "Galvanized Steel Sheet", category: "Steel Sheets", quantity: 75, unitPrice: "৳4,950", location: "Warehouse B" }, // $45.00 * 110
  { id: 3, name: "Steel Angle Bar", category: "Structural Steel", quantity: 35, unitPrice: "৳2,063", location: "Warehouse A" }, // $18.75 * 110
  { id: 4, name: "Stainless Steel Plate", category: "Steel Plates", quantity: 8, unitPrice: "৳13,750", location: "Warehouse C" }, // $125.00 * 110
  { id: 5, name: "Steel Pipe", category: "Steel Pipes", quantity: 25, unitPrice: "৳7,205", location: "Warehouse B" }, // $65.50 * 110
  { id: 6, name: "Carbon Steel Bar", category: "Steel Bars", quantity: 120, unitPrice: "৳3,548", location: "Warehouse A" } // $32.25 * 110
];

const salesData = [
  { id: 1, productName: "Mild Steel Rod", quantity: 25, price: 2805, date: "2024-09-21", customer: "Rahman Steel Works" }, // $25.5 * 110
  { id: 2, productName: "Galvanized Steel Sheet", quantity: 10, price: 4950, date: "2024-09-22", customer: "Metro Construction" }, // $45.0 * 110
  { id: 3, productName: "Steel Angle Bar", quantity: 8, price: 2063, date: "2024-09-20", customer: "Building Solutions Ltd" }, // $18.75 * 110
  { id: 4, productName: "Stainless Steel Plate", quantity: 2, price: 13750, date: "2024-09-19", customer: "Industrial Fabricators" }, // $125.0 * 110
  { id: 5, productName: "Steel Pipe", quantity: 5, price: 7205, date: "2024-09-18", customer: "Pipe & Fittings Co" } // $65.5 * 110
];

const expensesData = [
  { id: 1, date: "2025-09-23", category: "Transport", description: "Fuel for delivery truck", amount: 2500, paymentMethod: "Cash" },
  { id: 2, date: "2025-09-23", category: "Transport", description: "Driver salary advance", amount: 3000, paymentMethod: "Cash" },
  { id: 3, date: "2025-09-23", category: "Maintenance", description: "Truck repair and service", amount: 4500, paymentMethod: "Bank" },
  { id: 4, date: "2025-09-23", category: "Office", description: "Tea and snacks for workers", amount: 800, paymentMethod: "Cash" },
  { id: 5, date: "2025-09-22", category: "Rent", description: "Office rent payment", amount: 15000, paymentMethod: "Bank" }
];

const teamMembers = [
  { id: 1, name: "Rashid Khan", phone: "+880 1712-123456", role: "Manager", location: "Dhaka, Bangladesh" },
  { id: 2, name: "Fatima Ahmed", phone: "+880 1523-234567", role: "Warehouse Keeper", location: "Chittagong, Bangladesh" },
  { id: 3, name: "Nasir Rahman", phone: "+880 1634-345678", role: "Accountant", location: "Dhaka, Bangladesh" },
  { id: 4, name: "Ayesha Islam", phone: "+880 1845-456789", role: "Sales Executive", location: "Rajshahi, Bangladesh" }
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate statistics
  const totalLCValue = lcData.reduce((sum, lc) => sum + lc.basicInfo.lcValue, 0);
  const activeLCs = lcData.filter(lc => lc.status === 'Active').length;
  const completedLCs = lcData.filter(lc => lc.status === 'Completed').length;
  const totalProducts = products.reduce((sum, product) => sum + product.quantity, 0);
  const totalSales = salesData.reduce((sum, sale) => sum + (sale.quantity * sale.price), 0);
  const totalExpenses = expensesData.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Additional financial calculations in BDT
  const totalRevenue = lcData.filter(lc => lc.status === 'Completed').reduce((sum, lc) => sum + lc.basicInfo.lcValue, 0);
  const pendingPayments = lcData.filter(lc => ['Active', 'Pending'].includes(lc.status)).reduce((sum, lc) => sum + lc.basicInfo.lcValue, 0);
  const monthlyProfit = totalSales - totalExpenses;
  
  // Format large numbers in standard format with BDT symbol
  const formatBDTAmount = (amount) => {
    return `৳${amount.toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      case 'Under Review': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active': return <CheckCircle className="w-4 h-4" />;
      case 'Completed': return <CheckCircle className="w-4 h-4" />;
      case 'Pending': return <Clock className="w-4 h-4" />;
      case 'Expired': return <XCircle className="w-4 h-4" />;
      case 'Under Review': return <Eye className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1">
              +{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total LC Value"
          value={`৳${(totalLCValue / 10000000).toFixed(2)}`}
          icon={CreditCard}
          color="bg-gradient-to-r from-blue-500 to-blue-600"
          change="12"
        />
        <StatCard
          title="Active LCs"
          value={activeLCs}
          icon={Building2}
          color="bg-gradient-to-r from-green-500 to-green-600"
          change="8"
        />
        <StatCard
          title="Total Products"
          value={totalProducts}
          icon={Package}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
          change="5"
        />
        <StatCard
          title="Total Sales"
          value={`৳${(totalSales / 100000).toFixed(1)}`}
          icon={TrendingUp}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
          change="15"
        />
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent LCs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Recent Letters of Credit</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {lcData.slice(0, 4).map((lc) => (
                <div key={lc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(lc.status)}
                    <div>
                      <p className="font-medium text-gray-900">{lc.lcNumber}</p>
                      <p className="text-sm text-gray-600">{lc.beneficiary}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{lc.totalAmount}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lc.status)}`}>
                      {lc.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {salesData.slice(0, 4).map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{sale.productName}</p>
                    <p className="text-sm text-gray-600">{sale.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">৳{(sale.quantity * sale.price / 1000).toFixed(0)}K</p>
                    <p className="text-sm text-gray-600">{sale.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Inventory & Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {products.filter(product => product.quantity < 50).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">{product.quantity} units</p>
                    <p className="text-sm text-gray-600">{product.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {expensesData.slice(0, 4).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{expense.description}</p>
                    <p className="text-sm text-gray-600">{expense.category} • {expense.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">৳{expense.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{expense.paymentMethod}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLCManagement = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Letters of Credit Management</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LC Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beneficiary</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {lcData.map((lc) => (
              <tr key={lc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{lc.lcNumber}</div>
                  <div className="text-sm text-gray-500">{lc.basicInfo.lcType}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lc.beneficiary}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{lc.products}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lc.totalAmount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lc.dueDate}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lc.status)}`}>
                    {getStatusIcon(lc.status)}
                    <span className="ml-1">{lc.status}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Customer Management</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Purchased</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Purchase</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.totalPurchased}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.lastPurchase}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                    {customer.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Stock Management</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.unitPrice}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.location}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    product.quantity < 50 ? 'bg-red-100 text-red-800' : 
                    product.quantity < 100 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {product.quantity < 50 ? 'Low Stock' : product.quantity < 100 ? 'Medium Stock' : 'In Stock'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-600" />
              <h1 className="ml-3 text-xl font-bold text-gray-900">Business Dashboard</h1>
            </div>
            <div className="flex items-center space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'overview' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('lc')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'lc' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                LC Management
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'inventory' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Stock Management
              </button>
              <button
                onClick={() => setActiveTab('customers')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'customers' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Customers
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'lc' && renderLCManagement()}
        {activeTab === 'customers' && renderCustomers()}
        {activeTab === 'inventory' && renderInventory()}
      </main>
    </div>
  );
};

export default Dashboard;