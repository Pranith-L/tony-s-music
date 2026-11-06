import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactElement;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FC3C44] to-[#FA243C] text-white flex items-center justify-center mb-4 shadow-xl border border-[#D4A017]/40 animate-pulse">
          <ShieldCheck className="w-8 h-8 text-[#F5D77F]" />
        </div>
        <h3 className="text-base font-bold text-[#1D1D1F]">Verifying Administrator Access</h3>
        <p className="text-xs text-[#86868B] mt-1">Authenticating official session with Supabase...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth?redirect=/admin" replace />;
  }

  return children;
};

export default AdminRoute;

