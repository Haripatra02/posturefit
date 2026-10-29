import React, { useState } from 'react';
import {
  BookOpen,
  Eye,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';

export const PostureGuidePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'workspace' | 'posture' | 'faq'>('workspace');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto">
        <Badge variant="brand" className="mb-3">
          Ergonomic Foundations
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-heading tracking-tight">
          Workplace Posture Awareness Guide
        </h1>
        <p className="text-sm sm:text-base text-charcoal-muted mt-2 leading-relaxed">
          Evidence-informed principles for comfortable desk work. Ergonomic comfort varies across individual bodies; listen to your physical signals and move frequently.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center border-b border-surface-border gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('workspace')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'workspace'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-charcoal-muted hover:text-charcoal-heading'
          }`}
        >
          Desk & Workspace Setup
        </button>
        <button
          onClick={() => setActiveTab('posture')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'posture'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-charcoal-muted hover:text-charcoal-heading'
          }`}
        >
          Key Posture Zones
        </button>
        <button
          onClick={() => setActiveTab('faq')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'faq'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-charcoal-muted hover:text-charcoal-heading'
          }`}
        >
          Ergonomics FAQ
        </button>
      </div>

      {/* TAB 1: WORKSPACE SETUP & INTERACTIVE DIAGRAM */}
      {activeTab === 'workspace' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Ergonomic SVG Diagram */}
          <Card className="p-6 sm:p-10 flex flex-col items-center justify-center bg-surface-subtle/50">
            <h3 className="font-bold text-lg text-charcoal-heading mb-2">
              Optimal Sitting Ergonomics Anatomy
            </h3>
            <p className="text-xs text-charcoal-muted mb-8 text-center max-w-md">
              Maintain natural neutral curves without rigid stiffness. Adjust desk, chair, and monitor heights to fit your body dimensions.
            </p>

            <svg viewBox="0 0 500 320" className="w-full max-w-lg h-auto select-none" fill="none">
              {/* Floor */}
              <line x1="40" y1="290" x2="460" y2="290" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="4 4" />
              <text x="50" y="308" fill="#94a3b8" fontSize="10" fontWeight="600">FLOOR LEVEL</text>

              {/* Desk */}
              <rect x="290" y="160" width="150" height="12" rx="3" fill="#64748b" />
              <rect x="410" y="172" width="10" height="118" fill="#94a3b8" />
              {/* Monitor */}
              <rect x="340" y="90" width="80" height="60" rx="4" fill="#0f172a" />
              <rect x="344" y="94" width="72" height="52" rx="2" fill="#38bdf8" fillOpacity="0.2" />
              <rect x="375" y="150" width="10" height="10" fill="#475569" />
              <rect x="365" y="158" width="30" height="4" rx="1" fill="#475569" />

              {/* Sightline from eyes to top third of screen */}
              <line x1="225" y1="105" x2="340" y2="105" stroke="#0d9488" strokeWidth="2" strokeDasharray="3 3" />
              <circle cx="225" cy="105" r="3" fill="#0d9488" />
              <text x="235" y="98" fill="#0d9488" fontSize="10" fontWeight="700">Eye Level (top 1/3)</text>

              {/* Chair */}
              <rect x="180" y="195" width="65" height="10" rx="3" fill="#475569" />
              <rect x="172" y="130" width="10" height="75" rx="3" fill="#475569" />
              <rect x="208" y="205" width="8" height="60" fill="#94a3b8" />
              <line x1="185" y1="265" x2="235" y2="265" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
              {/* Casters */}
              <circle cx="185" cy="275" r="6" fill="#64748b" />
              <circle cx="235" cy="275" r="6" fill="#64748b" />

              {/* Seated Person Stylized Silhouette */}
              {/* Head */}
              <circle cx="220" cy="105" r="16" fill="#0f766e" />
              {/* Spine */}
              <path d="M220 121 C224 140, 218 160, 220 195" stroke="#0f766e" strokeWidth="8" strokeLinecap="round" fill="none" />
              {/* Arm & Elbow 90 deg */}
              <path d="M220 140 L260 162 L295 162" stroke="#14b8a6" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="260" cy="162" r="3" fill="#0f766e" />
              <text x="250" y="152" fill="#0f766e" fontSize="9" fontWeight="700">90°-100° Elbow</text>

              {/* Thigh (Hip to Knee) */}
              <line x1="220" y1="195" x2="275" y2="195" stroke="#0f766e" strokeWidth="8" strokeLinecap="round" />
              {/* Shin & Calf */}
              <line x1="275" y1="195" x2="275" y2="275" stroke="#0f766e" strokeWidth="8" strokeLinecap="round" />
              {/* Foot flat */}
              <line x1="270" y1="275" x2="298" y2="275" stroke="#0f766e" strokeWidth="8" strokeLinecap="round" />
              <circle cx="275" cy="195" r="3" fill="#0f766e" />
              <text x="282" y="235" fill="#0f766e" fontSize="9" fontWeight="700">90° Knee & Flat Feet</text>
            </svg>
          </Card>

          {/* Setup Principles Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h4 className="font-bold text-charcoal-heading text-base mb-2">1. Screen Placement</h4>
              <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
                Position your monitor roughly an arm’s length away (20–30 inches). The top third of the display should be level with your horizontal eye line to prevent downward neck tilting.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="font-bold text-charcoal-heading text-base mb-2">2. Chair & Lumbar Support</h4>
              <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
                Adjust your chair height so feet rest flat on the floor with thighs parallel. Use a small lumbar cushion or adjust the chair backrest to preserve the natural inward curve of the lower spine.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="font-bold text-charcoal-heading text-base mb-2">3. Keyboard & Mouse Height</h4>
              <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
                Keep keyboard and mouse close enough that your elbows remain comfortably bent at 90–100 degrees near your ribcage, avoiding outstretched reaches that strain traps.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="font-bold text-charcoal-heading text-base mb-2">4. Dynamic Posture Variation</h4>
              <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
                The best posture is your <em>next posture</em>. Even an ideal chair position becomes fatiguing after 40 continuous minutes. Shift positions, stand, and walk at regular intervals.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: KEY POSTURE ZONES */}
      {activeTab === 'posture' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {[
            {
              title: 'Cervical Spine (Head & Neck)',
              issue: 'Forward Head Posture ("Tech Neck")',
              solution:
                'For every inch the head tilts forward, the effective load on the cervical spine increases significantly. Perform gentle chin retractions to align ears over shoulders.',
              exerciseRecommendation: 'Chin Tucks, Upper Trapezius Side Stretches',
            },
            {
              title: 'Thoracic & Scapular (Shoulders & Upper Back)',
              issue: 'Protracted (Rounded) Shoulders',
              solution:
                'Typing with hands forward tends to tighten pectorals and weaken scapular retractors. Actively draw shoulder blades inward toward the spine throughout the day.',
              exerciseRecommendation: 'Shoulder Blade Squeezes, Doorway Pec Stretches',
            },
            {
              title: 'Lumbar & Pelvis (Lower Back & Hips)',
              issue: 'Pelvic Slumping & Tight Hip Flexors',
              solution:
                'Sitting shortens the psoas and gluteal stabilizers. Maintain a slight anterior pelvic tilt with lumbar support and stand up for hip lunges periodically.',
              exerciseRecommendation: 'Seated Cat-Cow, Standing Hip Flexor Lunges',
            },
            {
              title: 'Carpal & Forearm (Wrists & Fingers)',
              issue: 'Repetitive Strain & Wrist Extension',
              solution:
                'Rest wrists lightly; do not bend hands backward when typing. Incorporate finger tendon glides and gentle forearm flexor stretches.',
              exerciseRecommendation: 'Finger Tendon Glides, Forearm Flexor Reset',
            },
            {
              title: 'Lower Extremity Venous Return (Calves & Ankles)',
              issue: 'Static Venous Pooling',
              solution:
                'Prolonged sitting slows blood return from the lower legs. Active calf raises and ankle circles engage the muscular pump to circulate blood back upward.',
              exerciseRecommendation: 'Standing Calf Raises & Ankle Pumps',
            },
          ].map((zone, idx) => (
            <Card key={idx} className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <h3 className="font-bold text-lg text-charcoal-heading">{zone.title}</h3>
                <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 self-start sm:self-auto">
                  Risk: {zone.issue}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed mb-4">
                {zone.solution}
              </p>
              <div className="pt-3 border-t border-surface-border text-xs text-brand-700 flex items-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Recommended library moves: {zone.exerciseRecommendation}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 3: ERGONOMICS FAQ & SAFETY ADVISORY */}
      {activeTab === 'faq' && (
        <div className="space-y-6 animate-in fade-in duration-200" id="ergonomics-faq">
          <Card className="p-6">
            <h3 className="font-bold text-base text-charcoal-heading mb-2">
              Is there one &quot;perfect&quot; posture for everyone?
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              No. Human bodies vary in spinal curvature, limb proportions, and flexibility. Research in occupational biomechanics shows that staying rigid in any single position—even one labeled &quot;correct&quot;—eventually causes muscular fatigue. Frequent posture variation and short movement breaks are far more protective than trying to remain motionless.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-base text-charcoal-heading mb-2">
              How often should I take a movement break?
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              Most workplace guidelines recommend a micro-break every 30 to 50 minutes. Even standing for 60 seconds to stretch your chest, roll your shoulders, and look out a window gives your postural muscles and visual system a vital reset.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-base text-charcoal-heading mb-2">
              What should I do if an exercise causes discomfort?
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
              Stop immediately. PostureFit activities should produce gentle, relieving sensations, never sharp pain, joint pinching, numbness, or dizziness. Consult a licensed physical therapist or healthcare provider if you have persistent neck or back pain.
            </p>
          </Card>

          {/* Prominent Medical Disclaimer Box */}
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
              <h4 className="font-bold text-sm">Educational Wellness Disclaimer</h4>
            </div>
            <p className="text-xs leading-relaxed text-amber-900">
              PostureFit is designed solely for healthy workplace wellness awareness, habit support, and gentle movement encouragement. It is not a medical device, diagnostic system, or substitute for formal medical consultation, physical therapy, or individualized orthopedic assessment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
