import { MapPin, Phone, User, Edit } from "lucide-react";
import React from "react";
import { Link } from "react-router";

const TeamMemberCard = ({ member, onEdit }) => {
  const getRoleColor = (role) => {
    if (!role) return "bg-gray-100 text-gray-800";
    switch (role.toLowerCase()) {
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "admin":
        return "bg-red-100 text-white-800";
      case "warehouse keeper":
        return "bg-green-100 text-green-800";
      case "accountant":
        return "bg-purple-100 text-purple-800";
      case "sales executive":
        return "bg-orange-100 text-orange-800";
      case "operations coordinator":
        return "bg-pink-100 text-pink-800";
      case "logistics officer":
        return "bg-yellow-100 text-yellow-800";
      case "quality inspector":
        return "bg-teal-100 text-teal-800";
      case "customs officer":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow duration-200 relative">
      <button
        onClick={() => onEdit(member)}
        className="absolute top-2 right-2 p-1 bg-gray-100 rounded-full hover:bg-gray-200"
      >
        <Edit size={16} />
      </button>
      <Link to={`/team/${member._id}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <User size={16} className="sm:hidden text-gray-600" />
                <User size={20} className="hidden sm:block text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                  {member?.name}
                </h3>
              </div>
            </div>
            <span
              className={`inline-flex px-2 py-1 sm:px-3 text-xs font-medium rounded-full ${getRoleColor(
                member?.role
              )}`}
            >
              {member?.role}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Phone size={12} className="sm:hidden flex-shrink-0" />
            <Phone size={14} className="hidden sm:block flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate">{member?.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={12} className="sm:hidden flex-shrink-0" />
            <MapPin size={14} className="hidden sm:block flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate">
              {member?.location}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default TeamMemberCard;
