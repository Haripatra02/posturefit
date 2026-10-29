import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const RegisterPage: React.FC = () => {
  const { register, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (displayName.trim().length < 2) {
      setError('Display name must be at least 2 characters');
      return;
    }
    if (!email.includes('@')) {
      setError('Please provide a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      await register(email, password, displayName);
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-charcoal-heading">Create Account</h1>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
            Start tracking movement breaks & posture awareness
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
              Preferred Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Alex Rivera"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-heading uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-heading uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
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
            Create Free Account
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
          onClick={async () => {
            setIsLoading(true);
            try {
              await loginAsDemo();
              navigate('/dashboard');
            } catch {
              setError('Demo login failed');
            } finally {
              setIsLoading(false);
            }
          }}
          isLoading={isLoading}
          leftIcon={<Sparkles className="w-4 h-4 text-brand-600" />}
        >
          Sign In as Demo User
        </Button>

        <p className="text-center text-xs text-charcoal-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 underline">
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  );
};
