import { Navigate, useLocation } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import type { ReactNode } from 'react';

interface ProfileGuardProps {
  children: ReactNode;
}

export default function ProfileGuard({ children }: ProfileGuardProps) {
  const { activeProfile } = useProfile();
  const location = useLocation();

  if (!activeProfile) {
    return <Navigate to="/profiles" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
