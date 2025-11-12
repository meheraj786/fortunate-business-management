import React from "react";
import { NavLink, Outlet } from "react-router";

const Settings = () => {
  return (
    <div className="flex flex-col">
      <div className="flex flex-1 overflow-x-hidden">
        <div className="flex flex-col flex-1">
          <main>
            <div className="py-6">
              <div className="px-4 mx-auto sm:px-6 md:px-8">
                <div className="max-w-md">
                  <h1 className="text-lg font-bold text-gray-900">Settings</h1>
                  <p className="mt-2 text-sm font-medium leading-6 text-gray-500">
                    Manage your account settings and preferences.
                  </p>
                </div>
              </div>

              <div className="px-4 mx-auto mt-8 sm:px-6 md:px-8">
                <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg">
                  <nav className="flex flex-wrap gap-4">
                    <NavLink
                      to="/settings"
                      end
                      className={({ isActive }) =>
                        `inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg whitespace-nowrap ${
                          isActive
                            ? "text-gray-900 bg-gray-100"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                        }`
                      }
                    >
                      Category
                    </NavLink>

                    <NavLink
                      to="/settings/units"
                      className={({ isActive }) =>
                        `inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-200 rounded-lg whitespace-nowrap ${
                          isActive
                            ? "text-gray-900 bg-gray-100"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                        }`
                      }
                    >
                      Units
                    </NavLink>
                  </nav>
                </div>

                <div className="mt-8">
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
