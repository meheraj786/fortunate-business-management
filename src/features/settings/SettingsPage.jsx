import React from "react";
import { NavLink, Outlet } from "react-router";
import { useAuth } from "@/hooks/useAuth";

const Settings = () => {
  const { hasPermission, isSuperAdmin } = useAuth();

  return (
    <div className="flex flex-col">
      <div className="flex flex-1 overflow-x-hidden">
        <div className="flex flex-col flex-1">
          <main>
            <div>
              <div>
                <div className="max-w-md mb-8">
                  <h1 className="text-lg font-bold text-gray-900">Settings</h1>
                  <p className="mt-2 text-sm font-medium leading-6 text-gray-500">
                    Manage your account settings and preferences.
                  </p>
                </div>
              </div>

              <div>
                <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg">
                  <nav className="flex flex-wrap gap-4">
                    {isSuperAdmin && (
                      <NavLink
                        to="/settings/general"
                        className={({ isActive }) =>
                          `inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg whitespace-nowrap ${
                            isActive
                              ? "text-white bg-[var(--color-primary)]"
                              : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                          }`
                        }
                      >
                        General
                      </NavLink>
                    )}

                    {isSuperAdmin && (
                      <NavLink
                        to="/settings/wipeout"
                        className={({ isActive }) =>
                          `inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg whitespace-nowrap ${
                            isActive
                              ? "text-red-600 bg-red-50 border border-red-200"
                              : "text-gray-500 hover:text-red-600 hover:bg-red-50"
                          }`
                        }
                      >
                        Data Wipeout
                      </NavLink>
                    )}

                    {hasPermission("CATEGORY_VIEW") && (
                      <NavLink
                        to="/settings"
                        end
                        className={({ isActive }) =>
                          `inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg whitespace-nowrap ${
                            isActive
                              ? "text-white bg-[var(--color-primary)]"
                              : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                          }`
                        }
                      >
                        Category
                      </NavLink>
                    )}

                    {hasPermission("UNIT_VIEW") && (
                      <NavLink
                        to="/settings/units"
                        className={({ isActive }) =>
                          `inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg whitespace-nowrap ${
                            isActive
                              ? "text-white bg-[var(--color-primary)]"
                              : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                          }`
                        }
                      >
                        Units
                      </NavLink>
                    )}
                  </nav>
                </div>

                <div className="mt-8 mb-8">
                  <Outlet />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Settings;
