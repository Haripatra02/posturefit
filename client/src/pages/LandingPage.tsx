import React from 'react';
import { Link } from 'react-router-dom';
import {
  Timer,
  Zap,
  Award,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Flame,
  Clock,
  Sparkles,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, loginAsDemo } = useAuth();

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-8 sm:pb-12 overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-brand-100/60 to-emerald-100/40 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-800 border border-brand-200 mb-6 animate-in fade-in duration-300">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Ergonomics & Movement for Desk Workers</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-charcoal-heading tracking-tight leading-[1.15]">
            Build Healthier Desk Habits with <span className="text-brand-600">PostureFit</span>.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-charcoal-body/90 max-w-2xl mx-auto leading-relaxed font-normal">
            A gamified workplace wellness platform that reminds you to take movement breaks, guides you through 5-minute desk-friendly exercises, and rewards healthy sitting habits.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Get Started Free
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={loginAsDemo}
                  leftIcon={<Sparkles className="w-4 h-4 text-brand-600" />}
                >
                  Quick Demo Login
                </Button>
              </>
            )}
          </div>

          {/* Key Value Highlights */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-charcoal-muted">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-600" />
              Evidence-based micro-breaks
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-600" />
              5-minute guided challenges
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-600" />
              Transparent points & streaks
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-600" />
              No webcam or sensors required
            </span>
          </div>
        </div>
      </section>

      {/* PROBLEM & SOLUTION SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-heading">
            Why Micro-Movement Matters at the Desk
          </h2>
          <p className="text-sm sm:text-base text-charcoal-muted mt-2">
            Prolonged sitting without posture shifts leads to fatigue, stiff neck muscles, and wrist strain. Small consistent movement breaks counteract fixed desk fatigue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center mb-4">
              <Timer className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-charcoal-heading">Mindful Work Timer</h3>
            <p className="text-sm text-charcoal-muted mt-2 leading-relaxed">
              Start focused work intervals with gentle, user-friendly break notifications that cue you to stand and reset your posture.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-charcoal-heading">5-Minute Challenges</h3>
            <p className="text-sm text-charcoal-muted mt-2 leading-relaxed">
              Step through curated sequences of cervical retractions, scapular squeezes, and wrist glides designed specifically for screen workers.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-charcoal-heading">Motivating Gamification</h3>
            <p className="text-sm text-charcoal-muted mt-2 leading-relaxed">
              Earn points, unlock levels, maintain multi-day habit streaks, and collect achievement badges with server-validated reward rules.
            </p>
          </Card>
        </div>
      </section>

      {/* SAMPLE DAILY CHALLENGE PREVIEW */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-brand-900 to-brand-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden relative">
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-800 text-brand-200 mb-4">
              <Zap className="w-3.5 h-3.5" /> Sample Guided Experience
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              The 5-Minute Desk Reset
            </h2>
            <p className="text-brand-200 text-sm sm:text-base mt-2 leading-relaxed">
              5 gentle, non-sweat exercises that counteract forward-head slouch and tight shoulders. Perfect between meetings or deep coding blocks.
            </p>

            {/* Steps snippet */}
            <div className="mt-6 space-y-2.5">
              {[
                'Chin Tucks — 60s cervical spine realignment',
                'Shoulder Blade Squeezes — 60s scapular retraction',
                'Wrist & Forearm Flexor Extensor Reset — 60s carpal relief',
                'Seated Thoracic Cat-Cow Flow — 60s spinal decompression',
                'Standing Calf Raises — 60s venous circulation boost',
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-brand-100 bg-brand-800/40 p-2.5 rounded-xl border border-brand-700/50">
                  <span className="w-5 h-5 rounded-md bg-brand-600 flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-4">
              <Link to="/challenge">
                <Button variant="secondary" size="md">
                  Try 5-Min Challenge Now
                </Button>
              </Link>
              <span className="text-xs text-brand-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-accent-amber" /> Awards +60 points
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* GAMIFICATION & REWARDS OVERVIEW */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <Badge variant="amber" className="mb-3">
              Habit Psychology & Rewards
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-heading">
              Stay Motivated with Transparent Habit Streaks
            </h2>
            <p className="text-charcoal-muted text-sm sm:text-base mt-3 leading-relaxed">
              Habit formation requires clear positive feedback. PostureFit tracks your daily activity completions and sitting break discipline with an immutable ledger.
            </p>

            <div className="mt-6 space-y-4 text-sm text-charcoal-body">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-charcoal-heading">Daily Movement Streak</h4>
                  <p className="text-xs text-charcoal-muted mt-0.5">
                    Calculated in your local timezone. Taking at least one break or exercise maintains your streak.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-charcoal-heading">Level Progression</h4>
                  <p className="text-xs text-charcoal-muted mt-0.5">
                    Advance from Posture Novice to Spine Guardian and Ergonomic Legend as your points accumulate.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-charcoal-heading">Unlockable Badges</h4>
                  <p className="text-xs text-charcoal-muted mt-0.5">
                    Earn milestone achievements for 3-day, 7-day, and 30-day streaks, 10 breaks, and challenge mastery.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gamification Preview Card */}
          <Card className="p-6 bg-surface-subtle/50">
            <h3 className="font-bold text-base text-charcoal-heading mb-4">
              Reward Rules Transparency
            </h3>
            <div className="space-y-3">
              {[
                { action: 'Complete a 60s Ergonomic Exercise', pts: '+20 pts', color: 'text-brand-700 bg-brand-50' },
                { action: 'Complete a 5-Minute Challenge', pts: '+60 pts', color: 'text-brand-700 bg-brand-50' },
                { action: 'Log a Work Session Movement Break', pts: '+10 pts', color: 'text-blue-700 bg-blue-50' },
                { action: 'Hit Your Daily Movement Goal', pts: '+50 pts bonus', color: 'text-emerald-700 bg-emerald-50' },
                { action: 'Reach 7-Day Movement Streak', pts: '+100 pts bonus', color: 'text-amber-700 bg-amber-50' },
              ].map((rule, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white border border-surface-border text-xs sm:text-sm">
                  <span className="font-medium text-charcoal-body">{rule.action}</span>
                  <span className={`font-bold px-2.5 py-1 rounded-lg ${rule.color}`}>
                    {rule.pts}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <Card className="p-8 sm:p-12 bg-brand-50 border-brand-200">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-950">
            Ready for More Balanced Workdays?
          </h2>
          <p className="text-brand-800 text-sm sm:text-base mt-2 max-w-lg mx-auto leading-relaxed">
            Join students, programmers, and office workers building healthier posture awareness. Free to start, no special equipment needed.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register">
              <Button size="lg" variant="primary">
                Create Free Account
              </Button>
            </Link>
            <Link to="/posture-guide">
              <Button size="lg" variant="outline">
                Read Posture Guide
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
};
