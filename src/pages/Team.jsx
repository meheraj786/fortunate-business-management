import React, { useState } from "react";
import { Search, Plus, Phone, MapPin, User } from "lucide-react";
import { teamMembers } from "../data/data";
import TeamMemberCard from "../layout/TeamMemberCard";

const Team = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm)
  );

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className=" mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Team Members
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Manage your team members and their information.
              </p>
            </div>
            <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors w-full sm:w-auto justify-center sm:justify-start">
              <Plus size={20} />
              Add Member
            </button>
          </div>

          <div className="relative w-full sm:max-w-md">
            <Search
              size={18}
              className="sm:hidden absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <Search
              size={20}
              className="hidden sm:block absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {filteredMembers.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-400 mb-2">
              <User size={32} className="sm:hidden mx-auto" />
              <User size={48} className="hidden sm:block mx-auto" />
            </div>
            <p className="text-gray-500 text-base sm:text-lg">
              No team members found
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">
              Try adjusting your search criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Team;
