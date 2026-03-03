import React, { memo } from "react";
import { Link } from "react-router";
import { Mail, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const getRoleBadgeStyle = (roleName) => {
  const role = roleName?.toLowerCase();
  if (role?.includes("admin") || role?.includes("owner"))
    return "bg-[var(--color-primary-light)] text-[var(--color-primary)]";
  if (role?.includes("manager"))
    return "bg-[var(--color-success-light)] text-[var(--color-success)]";
  return "bg-gray-100 text-gray-700";
};

const TeamMemberCard = memo(({ user }) => {
  const { hasPermission } = useAuth();

  const CardContent = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all duration-200 group">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center text-lg font-bold flex-shrink-0">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt=""
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            user.name?.charAt(0).toUpperCase()
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-[var(--color-primary)] transition-colors">
              {user.name}
            </h3>
          </div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${getRoleBadgeStyle(user.roleName)}`}
          >
            {user.roleName}
          </span>
          <div className="flex items-center gap-1.5 mt-1.5 text-gray-500">
            <Mail size={12} className="flex-shrink-0" />
            <span className="text-xs truncate">{user.email}</span>
          </div>
        </div>

        {/* Arrow indicator */}
        {hasPermission("USER_VIEW_DETAILS") && (
          <ChevronRight
            size={18}
            className="text-gray-300 group-hover:text-[var(--color-primary)] transition-colors flex-shrink-0"
          />
        )}
      </div>
    </div>
  );

  return hasPermission("USER_VIEW_DETAILS") ? (
    <Link to={`/team/${user._id}`}>
      <CardContent />
    </Link>
  ) : (
    <CardContent />
  );
});

export default TeamMemberCard;
