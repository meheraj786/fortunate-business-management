import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router';
import { Check, X, Calendar, Package } from 'lucide-react';
import { products } from '../../data/data';
import { UrlContext } from '../../context/UrlContext';

const getProductLcNumber = (productId) => {
  const product = products.find((p) => p.id === productId);
  return product ? product.lcNumber : 'N/A';
};

const SalesTable = ({ sales }) => {

  if (!sales || sales.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="text-gray-500">
          <Package className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm sm:text-base">No sales records found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LC Number</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sales.map((sale) => (
            <tr key={sale._id} className="hover:bg-gray-50 cursor-pointer">
              <td className="px-6 py-4 whitespace-nowrap">
                <Link to={`/sales/${sale._id}`}>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{sale?.product?.name}</div>
                  </div>
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale?.lcNumber}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.quantity} {sale.unit}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${sale?.product?.unitPrice}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${sale?.totalAmount}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale?.customer?.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {sale.invoiceStatus === 'yes' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Check className="w-3 h-3 mr-1" />
                    Invoiced
                  </span>
                ) : sale.invoiceStatus === 'no' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <X className="w-3 h-3 mr-1" />
                    Not Invoiced
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Calendar className="w-3 h-3 mr-1" />
                    {sale.invoiceStatus}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sale.paymentStatus === 'Paid Payment' ? 'bg-green-100 text-green-800' : sale.paymentStatus === 'Due Payment' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                  {sale.paymentStatus}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(sale.saleDate).toLocaleDateString('en-GB')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTable;
