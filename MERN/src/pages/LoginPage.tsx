import React, { useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../context/AppContext';
import { isValidUniversityEmail } from '../utils/formatters';

export const LoginPage: React.FC = () => {
  const { login, navigate, addToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const validate = () => {
    const next: { email?: string; password?: string } = {};
    if (!email.trim()) {
      next.email = 'University email is required.';
    } else if (!isValidUniversityEmail(email)) {
      next.email = 'Use format: name.rollnumber@presidencyuniversity.in (e.g. navya.46@presidencyuniversity.in).';
    }
    if (!password) {
      next.password = 'Password is required.';
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password)) {
      next.password = 'Password must contain at least 6 characters, including letters and numbers.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setServerError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const user = await login(loginEmail, loginPass);
      setSuccessMsg(`Welcome back, ${user.fullName}. Redirecting...`);
      addToast({ type: 'success', title: `Signed in as ${user.fullName}` });
      setTimeout(() => {
        navigate(user.role === 'admin' ? 'admin' : 'dashboard');
      }, 450);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await performLogin(email, password);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={() => navigate('landing')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to CampusCart
          </button>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h1 className="font-display text-2xl font-bold text-slate-900">Sign in to CampusCart</h1>
            <p className="text-sm text-slate-600 mt-1">
              Sign in with your Presidency University, Bangalore email (name.rollnumber@presidencyuniversity.in).
            </p>

            {serverError && (
              <div
                role="alert"
                className="mt-5 p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-sm text-red-700"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            {successMsg && (
              <div
                role="status"
                className="mt-5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-sm text-emerald-800"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <Input
                label="University Email"
                type="email"
                placeholder="navya.46@presidencyuniversity.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                autoComplete="email"
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  autoComplete="current-password"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setResetSent(false);
                      setForgotOpen(true);
                    }}
                    className="text-xs font-medium text-teal-700 hover:text-teal-900 cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <Button type="submit" fullWidth size="lg" loading={loading}>
                Login
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              New to CampusCart?{' '}
              <button
                type="button"
                onClick={() => navigate('signup')}
                className="font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>
      </main>

      <Modal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        title="Reset your password"
        subtitle="We will send a reset link to your university email."
        maxWidth="sm"
      >
        {resetSent ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Password reset instructions have been sent to {resetEmail}.</span>
            </div>
            <Button fullWidth onClick={() => setForgotOpen(false)}>
              Back to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <Input
              label="University Email"
              type="email"
              required
              placeholder="navya.46@presidencyuniversity.in"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setForgotOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Send Reset Link</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
