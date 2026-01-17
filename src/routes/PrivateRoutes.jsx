import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import LayoutSkeleton from "@/components/layout/LayoutSkeleton"; // Import the layout skeleton

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show a full-page layout skeleton while auth state is loading
    return <LayoutSkeleton />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;