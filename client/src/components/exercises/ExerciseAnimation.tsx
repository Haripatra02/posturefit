import React, { useState } from 'react';
import { Play, Pause, Activity, Sparkles } from 'lucide-react';
import { Exercise } from '../../types';

interface ExerciseAnimationProps {
  exercise: Exercise;
  isPlaying?: boolean;
}

export const ExerciseAnimation: React.FC<ExerciseAnimationProps> = ({
  exercise,
  isPlaying = true,
}) => {
  const [animating, setAnimating] = useState(isPlaying);

  // Determine movement type from title or category
  const titleLower = exercise.title.toLowerCase();

  const renderAnimationContent = () => {
    // 1. Chin Tucks (Cervical Retraction)
    if (titleLower.includes('chin tuck') || titleLower.includes('cervical')) {
      return (
        <div className="relative w-full h-56 flex items-center justify-center">
          <svg viewBox="0 0 300 200" className="w-full h-full max-w-xs">
            <style>
              {`
                @keyframes chinTuckHead {
                  0%, 100% { transform: translateX(0px); }
                  50% { transform: translateX(-16px); }
                }
                @keyframes chinTuckArrow {
                  0%, 100% { opacity: 0.2; transform: translateX(0px); }
                  50% { opacity: 1; transform: translateX(-12px); }
                }
                .head-retract {
                  animation: ${animating ? 'chinTuckHead 4s ease-in-out infinite' : 'none'};
                  transform-origin: 160px 100px;
                }
                .arrow-pulse {
                  animation: ${animating ? 'chinTuckArrow 4s ease-in-out infinite' : 'none'};
                }
              `}
            </style>
            {/* Chair & Torso Anchor */}
            <path d="M100 180 L160 180" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
            <path d="M130 180 L130 110" stroke="#0f766e" strokeWidth="8" strokeLinecap="round" />
            {/* Neutral alignment guide line */}
            <line x1="130" y1="40" x2="130" y2="180" stroke="#0d9488" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
            
            {/* Motion Arrow */}
            <g className="arrow-pulse">
              <path d="M185 70 L155 70 M165 64 L155 70 L165 76" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <text x="195" y="73" fill="#0d9488" fontSize="10" fontWeight="700">Slide Back</text>
            </g>

            {/* Neck & Head Group with animation */}
            <g className="head-retract">
              {/* Cervical spine curve */}
              <path d="M130 110 C138 95, 138 80, 134 68" stroke="#14b8a6" strokeWidth="6" strokeLinecap="round" fill="none" />
              {/* Head profile */}
              <circle cx="140" cy="55" r="20" fill="#0f766e" />
              {/* Eye level sight line */}
              <line x1="155" y1="52" x2="220" y2="52" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="2 2" />
              {/* Nose & chin markers */}
              <path d="M158 55 L164 58 L157 63" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" fill="none" />
            </g>
          </svg>
        </div>
      );
    }

    // 2. Shoulder Blade Squeezes / Scapular Retraction
    if (titleLower.includes('shoulder blade') || titleLower.includes('scapular') || titleLower.includes('pec stretch')) {
      return (
        <div className="relative w-full h-56 flex items-center justify-center">
          <svg viewBox="0 0 300 200" className="w-full h-full max-w-xs">
            <style>
              {`
                @keyframes scapularSqueezeLeft {
                  0%, 100% { transform: translateX(0px) rotate(0deg); }
                  50% { transform: translateX(12px) rotate(-6deg); }
                }
                @keyframes scapularSqueezeRight {
                  0%, 100% { transform: translateX(0px) rotate(0deg); }
                  50% { transform: translateX(-12px) rotate(6deg); }
                }
                .left-scapula {
                  animation: ${animating ? 'scapularSqueezeLeft 3.5s ease-in-out infinite' : 'none'};
                  transform-origin: 110px 100px;
                }
                .right-scapula {
                  animation: ${animating ? 'scapularSqueezeRight 3.5s ease-in-out infinite' : 'none'};
                  transform-origin: 190px 100px;
                }
              `}
            </style>
            {/* Center Spine */}
            <line x1="150" y1="50" x2="150" y2="170" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            {/* Head from back view */}
            <circle cx="150" cy="40" r="18" fill="#0f766e" />
            
            {/* Left Shoulder & Scapula */}
            <g className="left-scapula">
              <path d="M150 68 L100 80 L90 140" stroke="#0f766e" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              {/* Scapula blade */}
              <path d="M125 90 L115 125 L135 118 Z" fill="#14b8a6" opacity="0.8" />
              <path d="M100 110 L125 110 M118 105 L125 110 L118 115" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" fill="none" />
            </g>

            {/* Right Shoulder & Scapula */}
            <g className="right-scapula">
              <path d="M150 68 L200 80 L210 140" stroke="#0f766e" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              {/* Scapula blade */}
              <path d="M175 90 L185 125 L165 118 Z" fill="#14b8a6" opacity="0.8" />
              <path d="M200 110 L175 110 M182 105 L175 110 L182 115" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" fill="none" />
            </g>
          </svg>
        </div>
      );
    }

    // 3. Seated Cat-Cow / Spinal Flow
    if (titleLower.includes('cat-cow') || titleLower.includes('spinal') || exercise.category === 'seated_mobility') {
      return (
        <div className="relative w-full h-56 flex items-center justify-center">
          <svg viewBox="0 0 300 200" className="w-full h-full max-w-xs">
            <style>
              {`
                @keyframes catCowSpine {
                  0%, 100% {
                    d: path("M150 60 Q170 100 150 150");
                  }
                  50% {
                    d: path("M150 60 Q120 100 150 150");
                  }
                }
                @keyframes catCowHead {
                  0%, 100% { transform: rotate(10deg); }
                  50% { transform: rotate(-15deg); }
                }
                .dynamic-spine {
                  animation: ${animating ? 'catCowSpine 5s ease-in-out infinite' : 'none'};
                }
                .dynamic-head {
                  animation: ${animating ? 'catCowHead 5s ease-in-out infinite' : 'none'};
                  transform-origin: 150px 60px;
                }
              `}
            </style>
            {/* Chair Base */}
            <rect x="110" y="150" width="80" height="8" rx="2" fill="#64748b" />
            {/* Thighs */}
            <path d="M150 150 L200 150 L200 185" stroke="#0f766e" strokeWidth="6" strokeLinecap="round" fill="none" />
            
            {/* Animated Spine Curve */}
            <path className="dynamic-spine" d="M150 60 Q170 100 150 150" stroke="#14b8a6" strokeWidth="8" strokeLinecap="round" fill="none" />

            {/* Head */}
            <g className="dynamic-head">
              <circle cx="150" cy="45" r="16" fill="#0f766e" />
            </g>
          </svg>
        </div>
      );
    }

    // 4. Wrist & Hand Stretches / Tendon Glides
    if (exercise.category === 'wrist_hand' || titleLower.includes('wrist') || titleLower.includes('finger')) {
      return (
        <div className="relative w-full h-56 flex items-center justify-center">
          <svg viewBox="0 0 300 200" className="w-full h-full max-w-xs">
            <style>
              {`
                @keyframes handFlexExtend {
                  0%, 100% { transform: rotate(-25deg); }
                  50% { transform: rotate(30deg); }
                }
                .animated-wrist {
                  animation: ${animating ? 'handFlexExtend 4s ease-in-out infinite' : 'none'};
                  transform-origin: 160px 100px;
                }
              `}
            </style>
            {/* Forearm */}
            <path d="M50 100 L160 100" stroke="#0f766e" strokeWidth="12" strokeLinecap="round" />
            <text x="60" y="85" fill="#64748b" fontSize="9" fontWeight="600">Forearm Fixed</text>

            {/* Wrist Pivot Point */}
            <circle cx="160" cy="100" r="6" fill="#0d9488" />

            {/* Animated Hand & Fingers */}
            <g className="animated-wrist">
              <path d="M160 100 L210 100" stroke="#14b8a6" strokeWidth="10" strokeLinecap="round" />
              {/* Fingers spread */}
              <path d="M210 95 L240 90" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />
              <path d="M210 98 L245 98" stroke="#0f766e" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M210 102 L242 105" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />
              <path d="M210 106 L235 112" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          </svg>
        </div>
      );
    }

    // 5. Standing Calf Raises / Leg Movement
    if (exercise.category === 'leg_ankle' || titleLower.includes('calf') || titleLower.includes('ankle')) {
      return (
        <div className="relative w-full h-56 flex items-center justify-center">
          <svg viewBox="0 0 300 200" className="w-full h-full max-w-xs">
            <style>
              {`
                @keyframes heelRaise {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-18px); }
                }
                .animated-person-rise {
                  animation: ${animating ? 'heelRaise 3s ease-in-out infinite' : 'none'};
                }
              `}
            </style>
            {/* Ground Line */}
            <line x1="60" y1="180" x2="240" y2="180" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="4 4" />

            {/* Desk / Chair Support Bar */}
            <rect x="70" y="90" width="8" height="90" fill="#94a3b8" />
            <rect x="65" y="86" width="30" height="6" rx="2" fill="#64748b" />
            <text x="65" y="78" fill="#94a3b8" fontSize="9">Desk Support</text>

            {/* Rising Person */}
            <g className="animated-person-rise">
              {/* Head */}
              <circle cx="160" cy="50" r="15" fill="#0f766e" />
              {/* Torso */}
              <line x1="160" y1="65" x2="160" y2="120" stroke="#0f766e" strokeWidth="8" strokeLinecap="round" />
              {/* Arm holding support */}
              <path d="M160 80 L120 88 L85 88" stroke="#14b8a6" strokeWidth="4" strokeLinecap="round" fill="none" />
              {/* Legs */}
              <line x1="160" y1="120" x2="155" y2="175" stroke="#0f766e" strokeWidth="6" strokeLinecap="round" />
              <line x1="160" y1="120" x2="168" y2="175" stroke="#0f766e" strokeWidth="6" strokeLinecap="round" />
              {/* Feet pivoting on balls of feet */}
              <circle cx="153" cy="178" r="3" fill="#0d9488" />
              <circle cx="170" cy="178" r="3" fill="#0d9488" />
            </g>
          </svg>
        </div>
      );
    }

    // Default / Standing Desk Squats
    return (
      <div className="relative w-full h-56 flex items-center justify-center">
        <svg viewBox="0 0 300 200" className="w-full h-full max-w-xs">
          <style>
            {`
              @keyframes squatMotion {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(22px); }
              }
              .animated-squat {
                animation: ${animating ? 'squatMotion 4s ease-in-out infinite' : 'none'};
              }
            `}
          </style>
          {/* Chair representation */}
          <rect x="90" y="140" width="40" height="6" rx="2" fill="#64748b" />
          <line x1="100" y1="146" x2="100" y2="185" stroke="#94a3b8" strokeWidth="4" />
          <line x1="120" y1="146" x2="120" y2="185" stroke="#94a3b8" strokeWidth="4" />

          {/* Squatting Person */}
          <g className="animated-squat">
            <circle cx="150" cy="60" r="15" fill="#0f766e" />
            <line x1="150" y1="75" x2="150" y2="125" stroke="#0f766e" strokeWidth="8" strokeLinecap="round" />
            <path d="M150 90 L180 90" stroke="#14b8a6" strokeWidth="4" strokeLinecap="round" />
            <path d="M150 125 L165 155 L165 185" stroke="#0f766e" strokeWidth="6" strokeLinecap="round" fill="none" />
          </g>
        </svg>
      </div>
    );
  };

  return (
    <div className="bg-brand-50/50 rounded-2xl p-4 border border-brand-100 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Top Animation Status Pill */}
      <div className="w-full flex items-center justify-between text-xs text-charcoal-muted mb-1 px-1">
        <span className="flex items-center gap-1.5 font-semibold text-brand-700">
          <Activity className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
          Visual Movement Guide
        </span>

        <button
          onClick={() => setAnimating(!animating)}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-brand-100 text-brand-800 transition-colors font-medium text-[11px]"
        >
          {animating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
          {animating ? 'Pause Motion' : 'Play Motion'}
        </button>
      </div>

      {/* Center Animated Canvas */}
      {renderAnimationContent()}

      {/* Guided Rhythm Caption */}
      <div className="mt-1 flex items-center gap-2 text-xs text-brand-800 font-medium">
        <Sparkles className="w-3.5 h-3.5 text-accent-amber" />
        <span>Rhythm: Smooth controlled tempo • Do not force range of motion</span>
      </div>
    </div>
  );
};
