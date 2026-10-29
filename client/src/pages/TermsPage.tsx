import React from 'react';
import { ShieldCheck, HeartHandshake, AlertTriangle } from 'lucide-react';
import { Card } from '../components/common/Card';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-charcoal-heading tracking-tight">
          Terms of Service & Wellness Agreement
        </h1>
        <p className="text-sm text-charcoal-muted mt-1">Last updated: October 2026</p>
      </div>

      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs sm:text-sm flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-amber-900">Critical Wellness Disclaimer:</strong>
          <p className="mt-1 leading-relaxed">
            PostureFit is a posture awareness, habit-formation, and educational platform. It does not provide medical diagnoses, treatment plans, or orthopedic prescriptions. Participation in physical exercises is entirely voluntary. If you experience discomfort, dizziness, or sharp pain, stop immediately and consult a qualified medical professional.
          </p>
        </div>
      </div>

      <Card className="p-6 sm:p-8 space-y-6 text-sm text-charcoal-body leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-charcoal-heading">1. Purpose and Scope</h2>
          <p>
            PostureFit offers computer users guidance on healthy sitting habits, movement-break intervals, and short mobility exercises. It is designed to assist in desk-work habit tracking and is not intended to cure or treat chronic musculoskeletal disorders.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-charcoal-heading">2. User Responsibility & Safety</h2>
          <p>
            Users are solely responsible for ensuring that their workspace, physical health, and environment allow for safe execution of gentle stretches. Users should exercise within their comfortable range of motion and never force joints or hyperextend the spine.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-charcoal-heading">3. Account Integrity & Gamification</h2>
          <p>
            Points, badges, and streaks are motivational metrics awarded according to application rules. Users agree not to exploit software vulnerabilities or manipulate client data to award unauthorized rewards.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-charcoal-heading">4. Contact & Support</h2>
          <p>
            For questions regarding these terms, inquiries may be addressed to support@posturefit.local.
          </p>
        </section>
      </Card>
    </div>
  );
};
