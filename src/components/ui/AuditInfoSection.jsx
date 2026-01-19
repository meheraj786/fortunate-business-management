import React from "react";
import { format } from "date-fns";
import PropTypes from "prop-types";
import { Clock, User, Edit3, Trash2, ShieldAlert } from "lucide-react";

// Helper to safely format dates
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return format(new Date(dateString), "PPpp"); // e.g., Apr 29, 2021, 5:30:00 PM
  } catch (error) {
    return "Invalid Date";
  }
};

const AuditItem = ({ label, user, date, icon: Icon, colorClass }) => {
  if (!user && !date) return null;

  return (
    <div className="flex items-start space-x-3 p-3 rounded-md bg-white border border-gray-100 shadow-sm">
      <div className={`p-2 rounded-full bg-opacity-10 ${colorClass} shrink-0`}>
        <Icon size={16} className={colorClass.replace("bg-", "text-")} />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
          {label}
        </span>
        <div className="text-sm font-semibold text-gray-900 truncate">
          {user?.name || "Unknown User"}
        </div>
        <div className="text-xs text-gray-500 flex items-center mt-1">
          <Clock size={12} className="mr-1" />
          {formatDate(date)}
        </div>
        {user?.email && (
          <div
            className="text-xs text-gray-400 mt-0.5 truncate"
            title={user.email}
          >
            {user.email}
          </div>
        )}
      </div>
    </div>
  );
};

AuditItem.propTypes = {
  label: PropTypes.string.isRequired,
  user: PropTypes.object,
  date: PropTypes.string,
  icon: PropTypes.elementType.isRequired,
  colorClass: PropTypes.string.isRequired,
};

const AuditInfoSection = ({
  createdBy,
  createdAt,
  modifiedBy,
  updatedAt,
  deletedBy,
  deletedAt,
  isDeleted,
}) => {
  // If no audit info is present, don't render the section
  if (!createdBy && !createdAt && !modifiedBy && !updatedAt && !deletedBy) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center mb-4">
        <ShieldAlert className="w-5 h-5 text-gray-400 mr-2" />
        <h3 className="text-lg font-bold text-gray-800">Audit Trail</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Creation Info */}
        {(createdBy || createdAt) && (
          <AuditItem
            label="Created By"
            user={createdBy}
            date={createdAt}
            icon={User}
            colorClass="bg-blue-500 text-blue-600"
          />
        )}

        {/* Modification Info */}
        {(modifiedBy || updatedAt) && (
          <AuditItem
            label="Last Modified By"
            user={modifiedBy}
            date={updatedAt}
            icon={Edit3}
            colorClass="bg-amber-500 text-amber-600"
          />
        )}

        {/* Deletion Info (Only if deleted) */}
        {isDeleted && (deletedBy || deletedAt) && (
          <AuditItem
            label="Deleted By"
            user={deletedBy}
            date={deletedAt}
            icon={Trash2}
            colorClass="bg-red-500 text-red-600"
          />
        )}
      </div>
    </div>
  );
};

AuditInfoSection.propTypes = {
  createdBy: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
  }),
  createdAt: PropTypes.string,
  modifiedBy: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
  }),
  updatedAt: PropTypes.string,
  deletedBy: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
  }),
  deletedAt: PropTypes.string,
  isDeleted: PropTypes.bool,
};

export default AuditInfoSection;
