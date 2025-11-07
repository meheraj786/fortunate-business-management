import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronLeft, FileText, User, Calendar, DollarSign, Truck, Info, ShoppingCart, Package, Printer } from 'lucide-react';
import Breadcrumb from '../../components/common/Breadcrumb';
import { UrlContext } from '../../context/UrlContext';

const SaleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { baseUrl } = useContext(UrlContext);
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invoiceHistory, setInvoiceHistory] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchSaleDetails = async () => {
      try {
        const response = await fetch(`${baseUrl}sales/get-sales/${id}`);
        const result = await response.json();
        
        if (result.success) {
          setSale(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError('Failed to fetch sale details.');
      } finally {
        setLoading(false);
      }
    };

    const fetchInvoiceHistory = async () => {
      try {
        const response = await fetch(`${baseUrl}invoice/sale/${id}`);
        const result = await response.json();
        if (result.success) {
          setInvoiceHistory(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch invoice history:", error);
      }
    };

    if (baseUrl && id) {
      fetchSaleDetails();
      fetchInvoiceHistory();
    }
  }, [id, baseUrl]);

  // Calculations
  const totalOtherCharges = sale?.otherCharges?.reduce((sum, charge) => sum + charge.amount, 0) ?? 0;
  const totalPayments = sale?.payments?.reduce((sum, payment) => sum + payment.amount, 0) ?? 0;
  const netAmount = sale?.totalAmountToBePaid ?? 0;
  const balanceDue = netAmount - totalPayments;

  const handleGenerateInvoice = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`${baseUrl}invoice/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ saleId: id }),
      });
      const result = await response.json();
      if (result.success) {
        navigate(`/sales/${id}/invoice/${result.data._id}`);
      } else {
        // Handle error - maybe show a toast notification
        console.error("Failed to generate invoice:", result.message);
      }
    } catch (error) {
      console.error("Error generating invoice:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper functions
  const formatCurrency = (amount) => `$${(amount || 0).toFixed(2)}`;

  // Loading and Error States
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (!sale) return <NotFoundState />;

  const breadcrumbItems = [
    { label: "Sales", path: "/sales" },
    { label: `Sale #${sale._id}` },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={breadcrumbItems} />

        <HeaderSection sale={sale} netAmount={netAmount} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <MainContent 
            sale={sale} 
            totalOtherCharges={totalOtherCharges}
            netAmount={netAmount}
            totalPayments={totalPayments}
            balanceDue={balanceDue}
            formatCurrency={formatCurrency}
          />
          
          <Sidebar sale={sale} />
        </div>

        <InvoiceSection 
          sale={sale}
          invoiceHistory={invoiceHistory}
          onGenerateInvoice={handleGenerateInvoice}
          navigate={navigate}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  );
};

// Sub-components
const LoadingState = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <p className="text-2xl font-bold">Loading Sale Details...</p>
    </div>
  </div>
);

const ErrorState = ({ error }) => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <p className="text-2xl font-bold text-red-600 mb-4">Error</p>
      <p className="text-gray-700">{error}</p>
      <BackToSalesLink />
    </div>
  </div>
);

const NotFoundState = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <p className="text-2xl font-bold mb-4">Sale Not Found</p>
      <BackToSalesLink />
    </div>
  </div>
);

const BackToSalesLink = () => {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate('/sales')} className="inline-flex items-center text-blue-500 hover:text-blue-700 hover:underline transition-colors mt-4">
      <ChevronLeft size={16} className="mr-1" />
      Back to Sales
    </button>
  );
};

const HeaderSection = ({ sale, netAmount }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <ShoppingCart className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Sale #{sale._id.slice(-6)}
          </h1>
          <p className="text-gray-600 mt-1 flex items-center">
            <Calendar size={16} className="mr-1" />
            Sold on {new Date(sale.saleDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col items-end">
        <StatusBadge status={sale.paymentStatus} />
        <p className="text-2xl font-bold text-gray-900 mt-2">
          ${netAmount.toFixed(2)}
        </p>
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    'Paid Payment': 'bg-green-100 text-green-800',
    'Due Payment': 'bg-yellow-100 text-yellow-800',
    'default': 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.default}`}>
      {status}
    </span>
  );
};

const MainContent = ({ sale, totalOtherCharges, netAmount, totalPayments, balanceDue, formatCurrency }) => (
  <div className="lg:col-span-2 space-y-6">
    <SaleInfoSection sale={sale} formatCurrency={formatCurrency} />
    
    {sale.invoiceStatus === 'Invoiced' && (
      <FinancialSummary 
        sale={sale}
        totalOtherCharges={totalOtherCharges}
        netAmount={netAmount}
        totalPayments={totalPayments}
        balanceDue={balanceDue}
        formatCurrency={formatCurrency}
      />
    )}
    
    <div className="lg:hidden">
      <AdditionalDetails sale={sale} />
    </div>
  </div>
);

const SaleInfoSection = ({ sale, formatCurrency }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <SectionHeader icon={Info} title="Sale Information" />
    
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <InfoField label="Product" value={sale.product.name} icon={Package} />
      <InfoField label="Quantity" value={`${sale.quantity} ${sale.unit}`} />
      <InfoField label="Price Per Unit" value={formatCurrency(sale.pricePerUnit)} />
      <InfoField label="Total Amount" value={formatCurrency(sale.totalAmount)} />
      <InfoField label="Invoice Status" value={sale.invoiceStatus} icon={FileText} />
      <InfoField label="Payment Status" value={sale.paymentStatus} icon={DollarSign} />
    </div>
  </div>
);

const InfoField = ({ label, value, icon: Icon }) => (
  <div>
    <p className="text-sm text-gray-600 mb-1">{label}</p>
    <p className="font-medium text-gray-900 flex items-center">
      {Icon && <Icon size={16} className="mr-2 text-gray-400" />}
      {value}
    </p>
  </div>
);

const FinancialSummary = ({ sale, totalOtherCharges, netAmount, totalPayments, balanceDue, formatCurrency }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Summary</h3>
    
    <div className="space-y-3">
      <FinancialRow label="Subtotal" value={formatCurrency(sale.totalAmount)} />
      <FinancialRow label="Delivery Charge" value={formatCurrency(sale.deliveryCharge)} icon={Truck} />
      
      {sale.otherCharges.length > 0 && (
        <FinancialRow label="Other Charges" value={formatCurrency(totalOtherCharges)} />
      )}
      
      <FinancialRow label="Discount" value={`-${formatCurrency(sale.discount)}`} isDiscount />
      
      <div className="border-t border-gray-200 pt-3 flex justify-between items-center font-semibold">
        <span className="text-gray-800">Net Amount</span>
        <span className="text-gray-800">{formatCurrency(netAmount)}</span>
      </div>
      
      <FinancialRow label="Payments Made" value={formatCurrency(totalPayments)} />
      
      <div className="border-t border-gray-200 pt-3 flex justify-between items-center font-semibold text-lg">
        <span className={balanceDue > 0 ? 'text-red-600' : 'text-green-600'}>
          {balanceDue > 0 ? 'Balance Due' : 'Overpayment'}
        </span>
        <span className={balanceDue > 0 ? 'text-red-600' : 'text-green-600'}>
          {formatCurrency(Math.abs(balanceDue))}
        </span>
      </div>
    </div>
  </div>
);

const FinancialRow = ({ label, value, icon: Icon, isDiscount = false }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-600 flex items-center">
      {Icon && <Icon size={16} className="mr-1 text-gray-400" />}
      {label}
    </span>
    <span className={`font-medium ${isDiscount ? 'text-green-600' : ''}`}>
      {value}
    </span>
  </div>
);

const Sidebar = ({ sale }) => (
  <div className="space-y-6">
    {sale.customer && <CustomerInfo customer={sale.customer} />}
    <div className="hidden lg:block">
      <AdditionalDetails sale={sale} />
    </div>
  </div>
);

const CustomerInfo = ({ customer }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
    <SectionHeader icon={User} title="Customer Information" />
    
    <div className="space-y-4">
      <InfoField label="Name" value={customer.name} />
      <InfoField label="Phone" value={customer.phone} />
      <InfoField label="Billing Address" value={customer.address} />
    </div>
  </div>
);

const AdditionalDetails = ({ sale }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Details</h3>
    
    <div className="space-y-4">
      {sale.otherCharges.length > 0 && (
        <ChargeList charges={sale.otherCharges} />
      )}
      
      {sale.invoiceStatus === 'Invoiced' && sale.payments.length > 0 && (
        <PaymentHistory payments={sale.payments} />
      )}
      
      <NotesSection notes={sale.notes} />
    </div>
  </div>
);

const ChargeList = ({ charges }) => (
  <div>
    <p className="text-sm font-medium text-gray-600 mb-2">Other Charges</p>
    <div className="space-y-2">
      {charges.map((charge, index) => (
        <div key={index} className="flex justify-between items-center text-sm">
          <span className="text-gray-600">{charge.name}</span>
          <span className="font-medium">${charge.amount?.toFixed(2) || '0.00'}</span>
        </div>
      ))}
    </div>
  </div>
);

const PaymentHistory = ({ payments }) => (
  <div>
    <p className="text-sm font-medium text-gray-600 mb-2">Payment History</p>
    <div className="space-y-2">
      {payments.map((payment, index) => (
        <div key={index} className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            {new Date(payment.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
          <span className="font-medium text-green-600">
            ${payment.amount?.toFixed(2) || '0.00'}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const NotesSection = ({ notes }) => (
  <div>
    <p className="text-sm font-medium text-gray-600 mb-2">Notes</p>
    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
      {notes || 'No additional notes for this sale.'}
    </p>
  </div>
);

const SectionHeader = ({ icon: Icon, title }) => (
  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
    <Icon size={20} className="mr-2 text-blue-500"/>
    {title}
  </h2>
);

const InvoiceSection = ({ sale, invoiceHistory, onGenerateInvoice, navigate, isGenerating }) => {
  if (sale.invoiceStatus !== 'Invoiced') return null;

  return (
    <div className="bg-white rounded-lg shadow-sm mt-6">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Invoice History</h2>
      </div>
      <div className="p-6">
        <button 
          onClick={onGenerateInvoice} 
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4 disabled:bg-blue-400"
        >
          <Printer size={16} />
          {isGenerating ? 'Generating...' : 'Generate New Invoice'}
        </button>
        <InvoiceList 
          invoices={invoiceHistory} 
          saleId={sale._id}
          navigate={navigate}
        />
      </div>
    </div>
  );
};

const InvoiceList = ({ invoices, saleId, navigate }) => (
  <div className="space-y-2">
    {invoices.length > 0 ? (
      invoices.map(invoice => (
        <div key={invoice._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-800">Invoice #{invoice._id.slice(-6)}</p>
            <p className="text-sm text-gray-500">
              Generated: {new Date(invoice.invoiceGeneratedDate).toLocaleString()}
            </p>
          </div>
          <button 
            onClick={() => navigate(`/sales/${saleId}/invoice/${invoice._id}`)} 
            className="text-sm text-blue-600 hover:underline"
          >
            View Invoice
          </button>
        </div>
      ))
    ) : (
      <p className="text-sm text-gray-500">No invoices generated yet.</p>
    )}
  </div>
);

export default SaleDetails;