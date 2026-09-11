import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from './useAuth';
import { InlineError } from '@/shared/ui/InlineError';

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
    <div className="min-h-screen bg-[#F6F5F1] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-xl font-mono font-semibold text-[#35634E] lowercase mb-6">
          upsolve
        </h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-[#E5E2DB]">
          {globalError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <InlineError message={globalError} />
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-[#242824] mb-1.5" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="w-full px-3 py-2 border border-[#E5E2DB] rounded-md text-sm bg-white focus:outline-none focus:border-[#35634E] focus:ring-1 focus:ring-[#35634E] transition-colors"
                {...register('username')}
              />
              {errors.username && <InlineError message={errors.username.message as string} />}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#242824] mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full px-3 py-2 border border-[#E5E2DB] rounded-md text-sm bg-white focus:outline-none focus:border-[#35634E] focus:ring-1 focus:ring-[#35634E] transition-colors"
                {...register('password')}
              />
              {errors.password && <InlineError message={errors.password.message as string} />}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#35634E] hover:bg-[#2D5442] focus:outline-none transition-colors disabled:opacity-50"
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
              className="w-full flex justify-center py-2.5 border border-[#E5E2DB] rounded-md shadow-sm text-sm font-medium text-[#242824] bg-white hover:bg-[#F0EFEB] focus:outline-none transition-colors"
            >
              Try Demo User (Read-Only)
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-[#6B7280]">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-[#35634E] hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
