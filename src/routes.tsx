import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router';
import { Spin } from 'antd';
import { AppLayout } from '@/components/layout';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Residences = lazy(() => import('@/pages/Residences'));
const ResidenceDetails = lazy(() => import('@/pages/Residences/ResidenceDetails'));
const Payments = lazy(() => import('@/pages/Payments'));
const Users = lazy(() => import('@/pages/Users'));
const UserDetails = lazy(() => import('@/pages/Users/UserDetails'));
const DeletionRequests = lazy(() => import('@/pages/DeletionRequests'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spin size="large" />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/residences" element={<Residences />} />
          <Route path="/residences/:id" element={<ResidenceDetails />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<UserDetails />} />
          <Route path="/deletion-requests" element={<DeletionRequests />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
