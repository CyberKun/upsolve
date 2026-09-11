import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../features/auth/AuthProvider';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { Layout } from './Layout';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { SetupPage } from '../features/onboarding/SetupPage';
import { TodayPage } from '../features/today/TodayPage';
import { QueuePage } from '../features/queue/QueuePage';
import { ProblemDetailPage } from '../features/queue/ProblemDetailPage';
import { ReviewsPage } from '../features/reviews/ReviewsPage';
import { lazy, Suspense } from 'react';
const InsightsPage = lazy(() => import('../features/insights/InsightsPage').then(m => ({ default: m.InsightsPage })));
import { SettingsPage } from '../features/settings/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/setup" element={<SetupPage />} />
              <Route path="/" element={<Navigate to="/today" replace />} />
              <Route path="/today" element={<TodayPage />} />
              <Route path="/queue" element={<QueuePage />} />
              <Route path="/queue/:id" element={<ProblemDetailPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/insights" element={<Suspense fallback={<p>Loading insights...</p>}><InsightsPage /></Suspense>} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/today" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
