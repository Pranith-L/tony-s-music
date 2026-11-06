import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Sparkles } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FC3C44] to-[#FA243C] text-white flex items-center justify-center mb-4 animate-spin shadow-lg">
          <Sparkles className="w-6 h-6 text-[#F5D77F]" />
        </div>
        <p className="text-sm font-medium text-[#86868B]">Verifying your session...</p>
      </div>
    );
  }

  if (!user) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?redirect=${returnUrl}`} replace />;
  }

  return children;
};

export default ProtectedRoute;

