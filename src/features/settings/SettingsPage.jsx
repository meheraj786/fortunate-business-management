import React from "react";
import { NavLink, Outlet } from "react-router";
import { useAuth } from "@/hooks/useAuth";

const getNavLinkClass = (isActive, isDanger = false) => {
  const base =
    "inline-flex items-center px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200 rounded-lg whitespace-nowrap";
  if (isDanger) {
    return `${base} ${isActive
        ? "text-red-600 bg-red-50 border border-red-200"
        : "text-gray-500 hover:text-red-600 hover:bg-red-50"
      }`;
  }
  return `${base} ${isActive
      ? "text-white bg-[var(--color-primary)]"
      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
    }`;
};

const Settings = () => {
  const { hasPermission, isSuperAdmin } = useAuth();

  const navItems = [
    { to: "/settings/backup", label: "Backup", show: hasPermission("SETTINGS_UPDATE") },
    { to: "/settings/general", label: "General", show: hasPermission("SETTINGS_UPDATE") },
    { to: "/settings/wipeout", label: "Data Wipeout", show: isSuperAdmin, isDanger: true },
    { to: "/settings/audit-logs", label: "Audit Logs", show: hasPermission("AUDIT_VIEW") },
    { to: "/settings", label: "Category", show: hasPermission("CATEGORY_VIEW"), end: true },
    { to: "/settings/countries", label: "Countries", show: hasPermission("COUNTRY_VIEW") },
    { to: "/settings/units", label: "Units", show: hasPermission("UNIT_VIEW") },
  ];

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
                <div className="px-2 py-2 sm:px-3 bg-white border border-gray-200 rounded-lg">
                  <nav className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-4">
                    {navItems
                      .filter((item) => item.show)
                      .map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.end}
                          className={({ isActive }) =>
                            getNavLinkClass(isActive, item.isDanger)
                          }
                        >
                          {item.label}
                        </NavLink>
                      ))}
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

