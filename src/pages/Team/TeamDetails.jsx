import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router";
import { teamMembers } from "../../data/data";
import { CheckSquare, Square, Edit3, Save, X, Mail, Phone, MapPin } from "lucide-react";
import Breadcrumb from "../../components/common/Breadcrumb";
import toast from "react-hot-toast";

import { ROLES } from "../../data/data";
import axios from "axios";
import { UrlContext } from "../../context/UrlContext";

// Simulate API call for saving roles
const saveUserRoles = async (userId, roles) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate random success/failure for demo (remove in production)
  if (Math.random() < 0.9) { // 90% success rate for demo
    return { success: true, message: "Roles updated successfully" };
  } else {
    throw new Error("Network error: Failed to save roles");
  }
};

const TeamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [userRoles, setUserRoles] = useState(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
    const { baseUrl } = useContext(UrlContext);

  useEffect(() => {
        axios
      .get(`${baseUrl}auth/get-user/${id}`)
      .then((res) => setMember(res.data.data));
    setIsLoading(false);
  }, [id]);
  console.log(member);
  

  const handleRoleToggle = (role) => {
    const newRoles = new Set(userRoles);
    if (newRoles.has(role)) {
      newRoles.delete(role);
    } else {
      newRoles.add(role);
    }
    setUserRoles(newRoles);
  };

  const handleSaveRoles = async () => {
    if (!member) return;

    // Use toast.promise for the save operation
    toast.promise(
      saveUserRoles(member?.id, Array.from(userRoles)),
      {
        loading: 'Saving roles...',
        success: (data) => {
          // Update local state on success
          const updatedMember = {
            ...member,
            roles: Array.from(userRoles)
          };
          setMember(updatedMember);
          setIsEditing(false);
          return <b>Roles updated successfully!</b>;
        },
        error: (err) => <b>{err.message || 'Failed to update roles'}</b>,
      }
    );
  };

  const handleCancelEdit = () => {
    // Reset to original roles
    setUserRoles(new Set(member?.roles || []));
    setIsEditing(false);
    toast.success('Changes discarded');
  };

  const handleEditStart = () => {
    setIsEditing(true);
    toast('You are now in edit mode. Toggle roles to make changes.', {
      icon: '✏️',
      duration: 4000,
    });
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${type} copied to clipboard!`);
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Member Not Found</h2>
          <p className="text-gray-600 mb-6">The team member you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/team")}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Back to Team
          </button>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Team", path: "/team" },
    { label: member?.name },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Member Details</h1>
            <p className="text-gray-600 mt-1">
              Manage roles and permissions for team members.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveRoles}
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <Save size={18} className="mr-2" />
                  Save Changes
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  <X size={18} className="mr-2" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={handleEditStart}
                className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                <Edit3 size={18} className="mr-2" />
                Edit Permissions
              </button>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-md rounded-lg p-6 sticky top-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    <img 
                      src={member?.avatar} 
                      alt={member?.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl hidden"
                    >
                      {member?.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  {member?.status === 'Active' && (
                    <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 text-center">{member?.name}</h2>
                <p className="text-gray-600">{member?.role}</p>
                <span className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${member?.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {member?.status}
                </span>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div 
                    className="flex items-center text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    onClick={() => copyToClipboard(member?.email, 'Email')}
                  >
                    <Mail size={18} className="text-gray-400 mr-3" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-500">Email</p>
                      <p className="text-primary break-all">{member?.email}</p>
                    </div>
                  </div>
                  <div 
                    className="flex items-center text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    onClick={() => copyToClipboard(member?.phone, 'Phone number')}
                  >
                    <Phone size={18} className="text-gray-400 mr-3" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-500">Phone</p>
                      <p className="text-primary">{member?.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <MapPin size={18} className="text-gray-400 mr-3" />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-500">Location</p>
                      <p>{member?.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Roles & Permissions Card */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Roles & Permissions</h2>
                <div className="text-right">
                  <span className="text-sm text-gray-500 block">
                    {userRoles.size} of {ROLES.length} permissions granted
                  </span>
                  {isEditing && (
                    <span className="text-xs text-orange-600 block mt-1">
                      Editing mode active
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {ROLES.map((role) => (
                  <div
                    key={role}
                    className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg transition-all ${isEditing ? "cursor-pointer hover:bg-blue-50 hover:border-blue-200" : "hover:bg-gray-50"} ${userRoles.has(role) ? "border-green-200 bg-green-50" : ""}`}
                    onClick={() => isEditing && handleRoleToggle(role)}
                  >
                    <div className="flex items-center">
                      <span className="text-gray-800 font-medium">{role}</span>
                    </div>
                    
                    <button 
                      className={`focus:outline-none transition-colors ${isEditing ? "cursor-pointer hover:scale-110" : "cursor-not-allowed opacity-50"}`}
                      disabled={!isEditing}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRoleToggle(role);
                      }}
                    >
                      {userRoles.has(role) ? (
                        <CheckSquare size={24} className="text-green-600" />
                      ) : (
                        <Square size={24} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {!isEditing && userRoles.size === 0 && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-center">
                    No permissions granted yet. Click "Edit Permissions" to add roles.
                  </p>
                </div>
              )}

              {isEditing && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-center text-sm">
                    💡 Click on roles or checkboxes to toggle permissions. Don't forget to save your changes!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetails;