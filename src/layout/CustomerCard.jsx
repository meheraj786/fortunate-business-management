import { MapPin, Phone, ShoppingBag, DollarSign } from "lucide-react";
import { Link } from "react-router";

const CustomerCard = ({ customer }) => {
  const totalPurchased = customer.totalSpent || 0;
  const totalDue = customer.totalDue || 0;
  const lastPurchaseDate = customer.lastPurchaseDate
    ? new Date(customer.lastPurchaseDate).toLocaleDateString()
    : "N/A";

  return (
    <Link to={`/customer-details/${customer._id}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate pr-2">
              {customer.name}
            </h3>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-gray-600">
            <Phone size={14} className="flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate">
              {customer.phone}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={14} className="flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate">
              {customer.billingAddress}
            </span>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1 text-gray-600">
              <ShoppingBag size={14} />
              <span className="text-xs">Total Purchased</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">
              ${totalPurchased.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1 text-red-600">
              <DollarSign size={14} />
              <span className="text-xs">Total Due</span>
            </div>
            <span className="font-semibold text-red-600 text-sm">
              ${totalDue.toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Last purchase: {lastPurchaseDate}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CustomerCard;
