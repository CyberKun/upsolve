import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from './useAuth';
import { InlineError } from '@/shared/ui/InlineError';
import { AuthLayout } from './AuthLayout';

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(1, 'Password is required'),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [globalError, setGlobalError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginValues) => {
    try {
      setGlobalError('');
      await login(data.username, data.password);
      navigate('/today');
    } catch (err: any) {
      setGlobalError(err.message || 'Invalid username or password');
    }
  };

  return (
    <AuthLayout title="Welcome back." description="Pick up where you left off. Your next breakthrough is waiting.">
          {globalError && (
            <div className="mb-4 p-3 bg-error-light border border-error-light rounded-md">
              <InlineError message={globalError} />
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-primary-text mb-1.5" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-primary-bg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                {...register('username')}
              />
              {errors.username && <InlineError message={errors.username.message as string} />}
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-text mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-primary-bg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                {...register('password')}
              />
              {errors.password && <InlineError message={errors.password.message as string} />}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2.5 border border-clear rounded-md shadow-sm shadow-theme text-sm font-medium text-on-accent bg-accent hover:bg-button-hover focus:outline-none transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-4">
            <button
              onClick={async () => {
                try {
                  setGlobalError('');
                  await login('demo', 'demo123');
                  navigate('/today');
                } catch (err: any) {
                  setGlobalError('Demo login failed. Make sure seed data is loaded.');
                }
              }}
              className="w-full flex justify-center py-2.5 border border-border rounded-md shadow-sm shadow-theme text-sm font-medium text-primary-text bg-primary-bg hover:bg-surface-hover focus:outline-none transition-colors"
            >
              Try Demo User (Read-Only)
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-secondary-text">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-accent hover:underline">
              Create an account
            </Link>
          </div>
    </AuthLayout>
  );
}
