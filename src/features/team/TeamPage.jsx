import React, { useState, useEffect } from "react";
import { useUsers } from "@/api/hooks/user";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import TeamMemberCard from "./components/TeamMemberCard";
import SearchBar from "@/components/ui/SearchBar";
import { showErrorToast } from "@/utils/notifications";

const TeamPage = () => {
  const { data: users, isLoading } = useUsers();
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!hasPermission("USER_VIEW_ALL")) {
      showErrorToast("You don't have permission to view this page.");
      navigate("/");
    }
  }, [hasPermission, navigate]);

  const filteredUsers = users?.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-4">
      <PageHeader
        title="Team Management"
        subtitle="Manage your team members and their permissions."
      >
        <div className="flex items-center gap-2">
          <SearchBar onSearch={setSearchTerm} />
          {hasPermission("USER_CREATE") && (
            <Link to="/team/add">
              <Button>Add Member</Button>
            </Link>
          )}
        </div>
      </PageHeader>

      {hasPermission("USER_VIEW_ALL") && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-100 rounded w-full"></div>
                  <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                </div>
              </div>
            ))
            : filteredUsers?.map((user) => (
              <TeamMemberCard key={user._id} user={user} />
            ))}
        </div>
      )}
    </div>
  );
};

export default TeamPage;
