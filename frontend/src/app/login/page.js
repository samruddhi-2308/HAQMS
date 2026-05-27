'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { User, Lock, Activity, Eye, EyeOff, ShieldCheck, ClipboardList } from 'lucide-react';

export default function Login() {
  const { login, error: authError, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const emailRegex = /^[^\s@]+@[^\s@]+$/;

    if (!email) {
      setValidationError('Please enter your email address.');
      return;
    }

    if (!emailRegex.test(email)) {
      setValidationError('Please enter a valid email format.');
      return;
    }

    const result = await login(email, password);
    if (!result.success) {
      setValidationError(result.error || 'Invalid credentials');
    }
  };

  const useDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setValidationError('');
  };

  return (
    <div className="min-h-screen px-6 py-10 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden h-full min-h-[620px] flex-col justify-between rounded-2xl bg-slate-950 p-10 text-white shadow-2xl shadow-slate-900/20 lg:flex">
          <Link href="/" className="inline-flex w-fit items-center gap-2 text-3xl font-extrabold">
            <Activity className="h-8 w-8 text-teal-300" />
            HAQMS
          </Link>

          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-300/10 px-3 py-1 text-xs font-bold uppercase text-teal-100">
              <ShieldCheck className="h-4 w-4" />
              Staff access
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-tight">
              Hospital queue operations, kept clear and readable.
            </h1>
            <p className="mt-4 max-w-sm text-sm font-medium leading-6 text-slate-300">
              Sign in with an administrator, receptionist, or doctor account to continue into the workflow dashboard.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/10 p-4 text-sm">
            <div className="flex items-center gap-2 font-bold text-teal-100">
              <ClipboardList className="h-4 w-4" />
              Demo-ready credentials
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              Use the quick-fill buttons on the form to load seeded accounts instantly.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <Link href="/" className="inline-flex items-center gap-2 text-3xl font-extrabold text-teal-700 lg:hidden">
              <Activity className="h-8 w-8" />
              HAQMS
            </Link>
            <h2 className="mt-6 text-3xl font-black text-slate-950">
              Welcome back
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-600">
              Sign in to continue to the HAQMS staff portal.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/10 sm:p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {(validationError || authError) && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                  {validationError || authError}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-bold text-slate-800">
                  Email Address
                </label>
                <div className="relative mt-1 rounded-lg shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-3 text-sm font-medium text-slate-950 placeholder:text-slate-500 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-600"
                    placeholder="admin@haqms.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold text-slate-800">
                  Password
                </label>
                <div className="relative mt-1 rounded-lg shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-10 text-sm font-medium text-slate-950 placeholder:text-slate-500 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-600"
                    placeholder="password123"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-800 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="glow-btn flex w-full justify-center rounded-lg border border-transparent bg-teal-700 px-4 py-3 text-sm font-extrabold text-white shadow-md transition-all duration-300 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 border-t border-slate-200 pt-6">
              <h4 className="mb-3 text-xs font-extrabold uppercase text-slate-700">
                Seeded Demo Credentials
              </h4>
              <div className="grid gap-2 text-xs sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => useDemoAccount('admin@haqms.com')}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-left font-semibold text-slate-700 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800"
                >
                  <strong>Admin:</strong> admin@haqms.com
                </button>
                <button
                  type="button"
                  onClick={() => useDemoAccount('reception1@haqms.com')}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-left font-semibold text-slate-700 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800"
                >
                  <strong>Receptionist:</strong> reception1@haqms.com
                </button>
                <button
                  type="button"
                  onClick={() => useDemoAccount('doctor1@haqms.com')}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-left font-semibold text-slate-700 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800 sm:col-span-2"
                >
                  <strong>Doctor:</strong> doctor1@haqms.com
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
