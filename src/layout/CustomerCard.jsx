import { MapPin, Phone, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router";

const CustomerCard = ({ customer }) => {
  return (
    <Link to={`/customer-details/${customer.id}`}>
    <div
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
    >
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
          <span className="text-xs sm:text-sm truncate">{customer.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin size={14} className="flex-shrink-0" />
          <span className="text-xs sm:text-sm truncate">
            {customer.location}
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
            {customer.totalPurchased}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Last purchase: {customer.lastPurchase}
        </div>
      </div>
    </div>
    </Link>
  );
};

export default CustomerCard;
