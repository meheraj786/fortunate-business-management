import React from "react";
import { NavLink, Outlet } from "react-router";
import { useAuth } from "@/hooks/useAuth";

const ReportsPage = () => {
    const { hasPermission } = useAuth();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reports</h1>
                <p className="mt-2 text-sm sm:text-base font-medium leading-6 text-gray-500">
                    View business reports and insights at a glance.
                </p>
            </div>

            <div>
                <div className="px-2 py-2 sm:px-3 bg-white border border-gray-200 rounded-lg overflow-x-auto">
                    <nav className="flex gap-1.5 sm:gap-2 md:gap-4">
                        {hasPermission("CUSTOMER_VIEW_TABLE") && (
                            <NavLink
                                to="/reports"
                                end
                                className={({ isActive }) =>
                                    `inline-flex items-center px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200 rounded-lg whitespace-nowrap ${isActive
                                        ? "text-white bg-[var(--color-primary)]"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                                    }`
                                }
                            >
                                Due Customers
                            </NavLink>
                        )}
                        {/* Future report tabs go here */}
                    </nav>
                </div>

                <div className="mt-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
