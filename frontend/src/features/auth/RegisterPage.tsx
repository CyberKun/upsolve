import { useState } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from './useAuth';
import { InlineError } from '@/shared/ui/InlineError';
import { AuthLayout } from './AuthLayout';

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Maximum 50 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters').refine(p => new TextEncoder().encode(p).length <= 72, 'Maximum 72 UTF-8 bytes'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { register: registerApi } = useAuth();
  const [globalError, setGlobalError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterValues) => {
    try {
      setGlobalError('');
      await registerApi(data.username, data.password);
      setIsSuccess(true);
    } catch (err: any) {
      setGlobalError(err.message || 'Failed to register account');
    }
  };

  return (
    <AuthLayout title="Create an account" description="Make room for better practice. Start your Upsolve journey.">
          
          {isSuccess ? (
            <div className="text-center">
              <div className="mb-4 p-4 bg-accent-light text-accent rounded-md font-medium text-sm">
                Account created successfully!
              </div>
              <Link
                to="/login"
                className="w-full flex justify-center py-2.5 border border-clear rounded-md shadow-sm shadow-theme text-sm font-medium text-on-accent bg-accent hover:bg-button-hover focus:outline-none transition-colors"
              >
                Go to Sign in
              </Link>
            </div>
          ) : (
            <>
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

                <div>
                  <label className="block text-sm font-medium text-primary-text mb-1.5" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="w-full px-3 py-2 border border-border rounded-md text-sm bg-primary-bg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                    {...register('confirmPassword')}
                  />
                  {errors.confirmPassword && <InlineError message={errors.confirmPassword.message as string} />}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2.5 border border-clear rounded-md shadow-sm shadow-theme text-sm font-medium text-on-accent bg-accent hover:bg-button-hover focus:outline-none transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating account...' : 'Create account'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-secondary-text">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-accent hover:underline">
                  Sign in
                </Link>
              </div>
            </>
          )}
    </AuthLayout>
  );
}
