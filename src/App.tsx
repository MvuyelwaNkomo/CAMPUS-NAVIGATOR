// client/src/App.tsx
// Updated to include authentication routes and role-based guards

import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './guards/PrivateRoute';
import { AdminRoute } from './guards/PrivateRoute';

// Lazy load pages for code splitting
const Home          = lazy(() => import('./components/home'));
const LoginPage     = lazy(() => import('./pages/LoginPage'));
const RegisterPage  = lazy(() => import('./pages/RegisterPage'));
const AdminPage     = lazy(() => import('./pages/AdminPage'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>

            {/* ── Public routes ─────────────────────────────────────── */}
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* ── Student routes (login required) ───────────────────── */}
            <Route element={<PrivateRoute />}>
              <Route path="/home" element={<Home />} />
            </Route>

            {/* ── Admin routes (admin/superadmin role required) ──────── */}
            <Route element={<PrivateRoute />}>
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Route>

            {/* ── Redirects ──────────────────────────────────────────── */}
            {/* Root redirects to login; auth guard then sends to /home or /admin */}
            <Route path="/"  element={<Navigate to="/login" replace />} />
            <Route path="*"  element={<Navigate to="/login" replace />} />

          </Routes>
        </Suspense>
      </ThemeProvider>
    </AuthProvider>
  );
  
}

export default App;
