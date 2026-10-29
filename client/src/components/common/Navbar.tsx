import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  Timer,
  BookOpen,
  Award,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Flame,
  Zap,
  ShieldAlert,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from './Button';

export const Navbar: React.FC = () => {
  const { user, profile, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: Activity },
    { to: '/timer', label: 'Work Timer', icon: Timer },
    { to: '/challenge', label: '5-Min Challenge', icon: Zap },
    { to: '/exercises', label: 'Exercise Library', icon: BookOpen },
    { to: '/posture-guide', label: 'Posture Guide', icon: BookOpen },
    { to: '/badges', label: 'Rewards & Badges', icon: Award },
    { to: '/progress', label: 'Analytics', icon: BarChart3 },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ to: '/admin', label: 'Admin', icon: ShieldAlert });
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                {/* Custom minimalist posture spine icon */}
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="4" r="2" />
                  <path d="M12 6v14" />
                  <path d="M8 10c2-1 6-1 8 0" />
                  <path d="M8 15c2 1 6 1 8 0" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-charcoal-heading">Posture<span className="text-brand-600">Fit</span></span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">Wellness</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            {isAuthenticated && (
              <div className="hidden lg:flex items-center gap-1">
                {navLinks.slice(0, 5).map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.to);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                        active
                          ? 'bg-brand-50 text-brand-800 font-semibold'
                          : 'text-charcoal-body hover:text-charcoal-heading hover:bg-surface-subtle'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-brand-600' : 'text-charcoal-muted'}`} />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Secondary Links Dropdown / Items */}
                <Link
                  to="/badges"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/badges') ? 'bg-amber-50 text-amber-800 font-semibold' : 'text-charcoal-body hover:bg-surface-subtle'
                  }`}
                  title="Achievements & Rewards"
                >
                  <Award className="w-4 h-4 text-accent-amber" />
                  <span>Badges</span>
                </Link>

                <Link
                  to="/progress"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/progress') ? 'bg-brand-50 text-brand-800 font-semibold' : 'text-charcoal-body hover:bg-surface-subtle'
                  }`}
                  title="Progress & History"
                >
                  <BarChart3 className="w-4 h-4 text-brand-600" />
                  <span>Progress</span>
                </Link>

                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition-colors"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
                    Admin
                  </Link>
                )}

                {/* Profile menu */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-subtle transition-colors focus-visible:ring-2 focus-visible:ring-brand-600"
                    aria-expanded={profileDropdownOpen}
                    aria-label="User menu"
                  >
                    <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-800 font-bold flex items-center justify-center text-sm border border-brand-200">
                      {profile?.display_name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                    </div>
                  </button>

                  {profileDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-modal border border-surface-border py-2 animate-in fade-in zoom-in-95 duration-150 z-50"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-surface-border">
                        <p className="text-sm font-bold text-charcoal-heading truncate">{profile?.display_name}</p>
                        <p className="text-xs text-charcoal-muted truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/settings"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-charcoal-body hover:bg-surface-subtle transition-colors"
                      >
                        <Settings className="w-4 h-4 text-charcoal-muted" />
                        Settings
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-charcoal-body hover:bg-surface-subtle transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-surface-border bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {isAuthenticated ? (
            <>
              <div className="px-3 py-2 bg-surface-subtle rounded-xl mb-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-charcoal-heading">{profile?.display_name}</p>
                  <p className="text-xs text-charcoal-muted">{user?.email}</p>
                </div>
                <Link to="/settings" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm">
                    Settings
                  </Button>
                </Link>
              </div>

              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active ? 'bg-brand-50 text-brand-800 font-semibold' : 'text-charcoal-body hover:bg-surface-subtle'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-brand-600" />
                    {link.label}
                  </Link>
                );
              })}

              <div className="pt-3 border-t border-surface-border">
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-3 pt-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block">
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block">
                <Button variant="primary" className="w-full">
                  Get Started Free
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
