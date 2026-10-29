import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-surface-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="4" r="2" />
                  <path d="M12 6v14" />
                  <path d="M8 10c2-1 6-1 8 0" />
                </svg>
              </div>
              <span className="text-lg font-bold text-charcoal-heading">Posture<span className="text-brand-600">Fit</span></span>
            </div>
            <p className="text-sm text-charcoal-muted max-w-md">
              A gamified workplace posture awareness and activity platform designed to help students, developers, and desk workers maintain balanced ergonomics and consistent movement habits.
            </p>
            <div className="flex items-center gap-2 text-xs text-charcoal-muted pt-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Evidence-informed workplace ergonomics</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold text-charcoal-heading uppercase tracking-wider mb-3">
              Explore
            </h3>
            <ul className="space-y-2 text-sm text-charcoal-muted">
              <li>
                <Link to="/timer" className="hover:text-brand-700 transition-colors">
                  Work / Sitting Timer
                </Link>
              </li>
              <li>
                <Link to="/challenge" className="hover:text-brand-700 transition-colors">
                  5-Minute Guided Challenges
                </Link>
              </li>
              <li>
                <Link to="/exercises" className="hover:text-brand-700 transition-colors">
                  Exercise Library
                </Link>
              </li>
              <li>
                <Link to="/posture-guide" className="hover:text-brand-700 transition-colors">
                  Posture Awareness Guide
                </Link>
              </li>
              <li>
                <Link to="/badges" className="hover:text-brand-700 transition-colors">
                  Gamification & Badges
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Health Disclaimer */}
          <div>
            <h3 className="text-xs font-semibold text-charcoal-heading uppercase tracking-wider mb-3">
              Safety & Terms
            </h3>
            <ul className="space-y-2 text-sm text-charcoal-muted">
              <li>
                <Link to="/privacy" className="hover:text-brand-700 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-brand-700 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/posture-guide#ergonomics-faq" className="hover:text-brand-700 transition-colors">
                  Ergonomics FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Health Advisory Banner */}
        <div className="mt-8 pt-6 border-t border-surface-border text-xs text-charcoal-muted flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            <strong className="text-charcoal-body">Wellness Disclaimer:</strong> PostureFit is an educational wellness and habit-support tool. It does not provide medical diagnoses, treatment plans, or replace professional healthcare advice.
          </p>
          <p className="shrink-0 flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-brand-600 fill-brand-600" /> for healthier desk work.
          </p>
        </div>
      </div>
    </footer>
  );
};
