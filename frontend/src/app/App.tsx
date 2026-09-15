import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router';
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
import { lazy, Suspense, useEffect } from 'react';
const InsightsPage = lazy(() => import('../features/insights/InsightsPage').then(m => ({ default: m.InsightsPage })));
import { SettingsPage } from '../features/settings/SettingsPage';
import { ExplorePage } from '../features/explore/ExplorePage';
import { AppHeader } from '../shared/ui/AppHeader';
import { ThemeSwitcher } from '../shared/ui/ThemeSwitcher';
import { ThemeProvider, useTheme } from '../shared/theme/ThemeProvider';
import { themes } from '../shared/theme/themes';
import { useAuth } from '../features/auth/useAuth';

const navigation = [
  { to: '/explore', label: 'Explore' },
  { to: '/today', label: 'Today' },
  { to: '/queue', label: 'Upsolve Queue' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/insights', label: 'Insights' },
];

function Header() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  return <AppHeader links={navigation} accountLink={isAuthenticated ? { to: '/settings', label: 'Settings' } : { to: '/login', label: 'Sign in' }} themeSwitcher={<ThemeSwitcher value={theme} options={themes} onChange={setTheme} />} />;
}

function RouteScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
    },
  },
});

export function App() {
  return (
    <ThemeProvider><QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RouteScrollReset />
        <AuthProvider>
          <Header />
          <main id="main-content" tabIndex={-1} className="min-h-[calc(100dvh-var(--header-height))]">
          <Routes>
            <Route path="/explore" element={<ExplorePage />} />
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
          </main>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider></ThemeProvider>
  );
}
