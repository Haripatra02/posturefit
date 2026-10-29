import React from 'react';
import { ShieldCheck, Lock, EyeOff } from 'lucide-react';
import { Card } from '../components/common/Card';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-charcoal-heading tracking-tight">
          Privacy Notice & Data Handling
        </h1>
        <p className="text-sm text-charcoal-muted mt-1">Last updated: October 2026</p>
      </div>

      <Card className="p-6 sm:p-8 space-y-6 text-sm text-charcoal-body leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-charcoal-heading flex items-center gap-2">
            <Lock className="w-4 h-4 text-brand-600" />
            1. What Information We Collect
          </h2>
          <p>
            PostureFit respects your privacy. We store only the minimum data required to deliver the wellness service:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-charcoal-muted text-xs sm:text-sm">
            <li>Account credentials (email, hashed password, and preferred display name).</li>
            <li>User settings (work and break timer durations, sound and reminder preferences).</li>
            <li>Tracked session durations and completed activity logs.</li>
            <li>Points ledger and badge achievement records.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-charcoal-heading flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-emerald-600" />
            2. What Information We DO NOT Collect
          </h2>
          <p>
            PostureFit does not collect, record, or store:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-charcoal-muted text-xs sm:text-sm">
            <li>No webcam video, facial images, or pose estimation camera streams.</li>
            <li>No medical histories, clinical diagnoses, or health insurance records.</li>
            <li>No biometric heart rate, GPS location, or keystroke tracking.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-charcoal-heading flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            3. Data Storage & Security
          </h2>
          <p>
            All user data is partitioned securely using PostgreSQL Row Level Security (RLS) policies. Only you can view or modify your personal activity logs and settings.
          </p>
        </section>
      </Card>
    </div>
  );
};
