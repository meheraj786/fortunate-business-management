import React, { useMemo } from "react";
import { NavLink, Outlet } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { ShieldAlert } from "lucide-react";

/**
 * Each report tab declares the permission it requires.
 * Add future tabs here — the rest is handled automatically.
 */
const REPORT_TABS = [
    { label: "Due Customers", path: "/reports", end: true, permission: "CUSTOMER_VIEW_TABLE" },
    // { label: "Sales Summary", path: "/reports/sales", permission: "SALE_VIEW_TABLE" },
    // { label: "Stock Report", path: "/reports/stock", permission: "PRODUCT_VIEW_TABLE" },
];

const ReportsPage = () => {
    const { hasPermission } = useAuth();

    const visibleTabs = useMemo(
        () => REPORT_TABS.filter((tab) => hasPermission(tab.permission)),
        [hasPermission],
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reports</h1>
                <p className="mt-2 text-sm sm:text-base font-medium leading-6 text-gray-500">
                    View business reports and insights at a glance.
                </p>
            </div>

            {visibleTabs.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 sm:p-12 text-center">
                    <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Reports Available</h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                        You don't have permission to view any reports. Contact your administrator to request access.
                    </p>
                </div>
            ) : (
                <div>
                    <div className="px-2 py-2 sm:px-3 bg-white border border-gray-200 rounded-lg overflow-x-auto">
                        <nav className="flex gap-1.5 sm:gap-2 md:gap-4">
                            {visibleTabs.map((tab) => (
                                <NavLink
                                    key={tab.path}
                                    to={tab.path}
                                    end={tab.end}
                                    className={({ isActive }) =>
                                        `inline-flex items-center px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200 rounded-lg whitespace-nowrap ${isActive
                                            ? "text-white bg-[var(--color-primary)]"
                                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                                        }`
                                    }
                                >
                                    {tab.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    <div className="mt-6">
                        <Outlet />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsPage;
