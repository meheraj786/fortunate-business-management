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
  const { data: users, isLoading, error } = useUsers();
  const { hasPermission, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isSuperAdmin) {
      showErrorToast("You don't have permission to view this page.");
      navigate("/");
    }
  }, [isSuperAdmin, navigate]);

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

      {isLoading && <p>Loading...</p>}
      {error && <p>Error loading users.</p>}

      {isSuperAdmin && filteredUsers && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <TeamMemberCard key={user._id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamPage;
