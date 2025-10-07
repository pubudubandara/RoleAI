import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  // Show loading while authentication is being initialized
  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated after loading is complete
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;