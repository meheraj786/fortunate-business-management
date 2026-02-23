import React, { memo } from "react";
import { Link } from "react-router";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

const TeamMemberCard = memo(({ user }) => {
  const { hasPermission } = useAuth();

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold">{user.name}</h3>
        <p className="text-gray-600">{user.email}</p>
        <p className="text-gray-500">{user.roleName}</p>
      </div>
      {hasPermission("USER_VIEW_DETAILS") && (
        <Link to={`/team/${user._id}`}>
          <Button variant="outline">View Details</Button>
        </Link>
      )}
    </div>
  );
});

export default TeamMemberCard;
