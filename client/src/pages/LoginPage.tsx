import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Sparkles, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';

export const LoginPage: React.FC = () => {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot / Reset Password state
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide your email and password');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await loginAsDemo();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);

    if (!resetEmail || !resetNewPassword) {
      setResetError('Please enter your email and a new password.');
      return;
    }

    if (resetNewPassword.length < 6) {
      setResetError('New password must be at least 6 characters.');
      return;
    }

    setIsResetting(true);
    try {
      const res = await authApi.resetPassword({
        email: resetEmail,
        new_password: resetNewPassword,
      });
      setResetSuccess(res.message || 'Password updated successfully!');
      setEmail(resetEmail);
      setPassword(resetNewPassword);
    } catch (err: any) {
      setResetError(err.message || 'Failed to reset password. Please verify the email.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-charcoal-heading">Welcome Back</h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Sign in to your PostureFit account
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-heading uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-charcoal-heading uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setResetError(null);
                  setResetSuccess(null);
                  setResetModalOpen(true);
                }}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            size="lg"
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-surface-border" />
          </div>
          <span className="relative bg-white px-3 text-xs text-charcoal-muted uppercase">
            or quick demo
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleDemoLogin}
          isLoading={isLoading}
          leftIcon={<Sparkles className="w-4 h-4 text-brand-600" />}
        >
          Sign In as Demo User
        </Button>

        <p className="text-center text-xs text-charcoal-muted mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700 underline">
            Register free
          </Link>
        </p>
      </Card>

      {/* Forgot / Reset Password Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset Account Password"
        maxWidth="md"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <p className="text-xs text-charcoal-muted leading-relaxed">
            Enter your registered PostureFit account email and a new password. Your credentials will be updated immediately.
          </p>

          {resetError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{resetError}</span>
            </div>
          )}

          {resetSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{resetSuccess}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-charcoal-heading uppercase tracking-wider mb-1">
              Account Email
            </label>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-heading uppercase tracking-wider mb-1">
              New Password (min 6 characters)
            </label>
            <input
              type="password"
              value={resetNewPassword}
              onChange={(e) => setResetNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-3.5 py-2 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setResetModalOpen(false)}
            >
              Close
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isResetting}
              leftIcon={<KeyRound className="w-4 h-4" />}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
