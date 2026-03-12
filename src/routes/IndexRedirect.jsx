import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import LayoutSkeleton from "@/components/layout/LayoutSkeleton";

const IndexRedirect = () => {
  const { hasPermission, loading } = useAuth();

  if (loading) {
    return <LayoutSkeleton />;
  }

  // Check permissions in order of priority/menu representation
  // This ensures users land on the first module they have access to
  if (hasPermission("LC_VIEW_TABLE")) return <Navigate to="/lc-management" replace />;
  if (hasPermission("WAREHOUSE_VIEW")) return <Navigate to="/stock-management" replace />;
  if (hasPermission("SALE_VIEW_TABLE")) return <Navigate to="/sales" replace />;
  if (hasPermission("CASH_VIEW")) return <Navigate to="/daily-cash-flow" replace />;
  if (hasPermission("ACCOUNT_VIEW_ALL")) return <Navigate to="/accounts" replace />;
  if (hasPermission("ADVANCE_PAYMENT_VIEW")) return <Navigate to="/advance-payments" replace />;
  if (hasPermission("USER_VIEW_ALL")) return <Navigate to="/team" replace />;
  if (hasPermission("CUSTOMER_VIEW_TABLE")) return <Navigate to="/customers" replace />;
  
  // If the user has none of the above module permissions, default to the settings page
  // Settings is generally accessible (or has its own internal permission checks)
  return <Navigate to="/settings" replace />;
};

export default IndexRedirect;
