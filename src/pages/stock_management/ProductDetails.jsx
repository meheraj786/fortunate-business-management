import React from 'react';
import { useParams } from 'react-router';
import { products, initialSalesData, warehouses } from '../../data/data';
import { Package, DollarSign, ShoppingCart } from 'lucide-react';
import StatBox from '../../layout/StatBox';
import Breadcrumb from '../../components/common/Breadcrumb';

const ProductDetails = () => {
  const { productId } = useParams();
  const product = products.find((p) => p.id === parseInt(productId));
  const sales = initialSalesData.filter((s) => s.productId === parseInt(productId));

  const totalUnitsSold = sales.reduce((acc, sale) => acc + sale.quantity, 0);
  const totalRevenue = sales.reduce((acc, sale) => acc + sale.quantity * sale.price, 0);

  const warehouse = warehouses.find((w) => w.id === product?.productLocation);

  if (!product) {
    return <div className="min-h-screen p-6 flex items-center justify-center">Product not found</div>;
  }

  const breadcrumbItems = [
    { label: 'Stock', path: '/stock-management' },
    { label: warehouse?.name, path: `/stock/${product.productLocation}` },
    { label: product.productName },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <Package className="h-8 w-8 text-gray-600" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.productName}</h1>
              <p className="text-gray-600 mt-1">{product.category}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Details</h2>
            
            <div className="mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">LC Number</p>
                  <p className="font-medium text-gray-900">{product.lcNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium text-gray-900">{product.category}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 my-6"></div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                {product.grade && (
                  <div>
                    <p className="text-sm text-gray-600">Grade</p>
                    <p className="font-medium text-gray-900">{product.grade}</p>
                  </div>
                )}
                {product.color && (
                  <div>
                    <p className="text-sm text-gray-600">Color</p>
                    <p className="font-medium text-gray-900">{product.color}</p>
                  </div>
                )}
                {product.thickness_mm && (
                  <div>
                    <p className="text-sm text-gray-600">Thickness</p>
                    <p className="font-medium text-gray-900">{product.thickness_mm} mm</p>
                  </div>
                )}
                {product.width_mm && (
                  <div>
                    <p className="text-sm text-gray-600">Width</p>
                    <p className="font-medium text-gray-900">{product.width_mm} mm</p>
                  </div>
                )}
                {product.length_m && (
                  <div>
                    <p className="text-sm text-gray-600">Length</p>
                    <p className="font-medium text-gray-900">{product.length_m} m</p>
                  </div>
                )}
                {product.width_ft && (
                  <div>
                    <p className="text-sm text-gray-600">Width</p>
                    <p className="font-medium text-gray-900">{product.width_ft} ft</p>
                  </div>
                )}
                {product.length_ft && (
                  <div>
                    <p className="text-sm text-gray-600">Length</p>
                    <p className="font-medium text-gray-900">{product.length_ft} ft</p>
                  </div>
                )}
                {product.width_inch && (
                  <div>
                    <p className="text-sm text-gray-600">Width</p>
                    <p className="font-medium text-gray-900">{product.width_inch}"</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 my-6"></div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Inventory</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Quantity in Stock</p>
                  <p className="font-medium text-gray-900">{product.quantity} {product.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium text-gray-900">{warehouse?.name}</p>
                </div>
                {product.unitPrice && (
                  <div>
                    <p className="text-sm text-gray-600">Unit Price</p>
                    <p className="font-bold text-lg text-gray-900">{product.unitPrice || 'N/A'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Sales Overview</h2>
            <div className="space-y-4">
              <StatBox 
                title="Total Units Sold" 
                number={totalUnitsSold.toLocaleString()} 
                Icon={ShoppingCart}
              />
              <StatBox 
                title="Total Revenue" 
                number={`${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
                Icon={DollarSign}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 px-6 pt-6">Recent Sales</h2>
          
          <div className="block sm:hidden">
            <div className="space-y-2">
              {sales.map((sale) => (
                <div key={sale.id} className="border-t border-gray-200 last:border-b bg-white ">
                  <div className="px-4 py-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium text-gray-900">{sale.customer}</div>
                      <span className="text-sm text-gray-500">{sale.date}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Qty: {sale.quantity}</span>
                      <span className="text-gray-600">Price: ${sale.price.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-100 my-2"></div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Total</span>
                      <span className="font-bold text-gray-900">${(sale.quantity * sale.price).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {sales.length === 0 && (
                <div className="text-center py-8 text-gray-500 border-t">
                  No sales data available for this product.
                </div>
              )}
            </div>
          </div>

          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Customer
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Qty
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Price
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.date}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sale.customer}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sale.quantity}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${sale.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${(sale.quantity * sale.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sales.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No sales data available for this product.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;