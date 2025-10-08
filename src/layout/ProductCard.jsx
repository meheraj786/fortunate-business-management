import { Layers, Palette, Ruler } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router';
import { warehouses } from '../data/data'; // Import warehouses

const ProductCard = ({ product }) => {
  const getStockColor = (quantity) => {
    if (quantity <= 10) return 'bg-red-100 text-red-800';
    if (quantity <= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStockStatus = (quantity) => {
    if (quantity <= 10) return 'Low Stock';
    if (quantity <= 50) return 'Medium Stock';
    return 'In Stock';
  };

  const formatSize = (product) => {
    const parts = [];
    if (product.thickness_mm) parts.push(`${product.thickness_mm}mm`);
    if (product.width_mm) parts.push(`${product.width_mm}mm`);
    if (product.length_m) parts.push(`${product.length_m}m`);
    if (product.width_ft) parts.push(`${product.width_ft}ft`);
    if (product.length_ft) parts.push(`${product.length_ft}ft`);
    if (product.width_inch) parts.push(`${product.width_inch}"`);
    return parts.join(' x ');
  };

  const warehouse = warehouses.find(w => w.id === product.productLocation);

  return (
    <Link to={`/stock/product/${product.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow duration-200 h-full">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate pr-2">
              {product.productName}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 truncate">{product.category}</p>
          </div>
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStockColor(product.quantity)}`}>
            {getStockStatus(product.quantity)}
          </span>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-gray-600">
            <Ruler size={12} className="sm:hidden flex-shrink-0" />
            <Ruler size={14} className="hidden sm:block flex-shrink-0" />
            <span className="text-xs sm:text-sm">Size: {formatSize(product)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <Palette size={12} className="sm:hidden flex-shrink-0" />
            <Palette size={14} className="hidden sm:block flex-shrink-0" />
            <span className="text-xs sm:text-sm">Color: {product.color}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <Layers size={12} className="sm:hidden flex-shrink-0" />
            <Layers size={14} className="hidden sm:block flex-shrink-0" />
            <span className="text-xs sm:text-sm">Qty: {product.quantity} {product.unit}</span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500">Unit Price</span>
            <span className="font-semibold text-gray-900 text-sm">{product.unitPrice || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Location</span>
            <span className="text-xs text-gray-700">{warehouse ? warehouse.name : 'N/A'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;