import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const location = useLocation();

  if (!token) {
    // Redirect to the appropriate login page based on the required role
    const loginPath = requiredRole === "admin" ? "/admin/login" : "/login";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    // If a specific role is required and the user doesn't have it, redirect to Forbidden
    return <Navigate to="/403" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
