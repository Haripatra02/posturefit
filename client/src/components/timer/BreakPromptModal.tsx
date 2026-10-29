import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { useTimer } from '../../context/TimerContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export const BreakPromptModal: React.FC = () => {
  const { isBreakModalOpen, setIsBreakModalOpen, startBreak, finishBreak, skipBreak } = useTimer();
  const navigate = useNavigate();

  const handleStart5MinChallenge = () => {
    setIsBreakModalOpen(false);
    navigate('/challenge');
  };

  const handleStartFreeBreak = () => {
    startBreak(5);
  };

  const handleFinishImmediately = async () => {
    await finishBreak();
  };

  return (
    <Modal
      isOpen={isBreakModalOpen}
      onClose={() => setIsBreakModalOpen(false)}
      maxWidth="md"
    >
      <div className="text-center pt-2 pb-1">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
          <Coffee className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-charcoal-heading">
          Time for a Movement Break! 🌿
        </h2>
        <p className="text-sm text-charcoal-muted mt-2 max-w-sm mx-auto">
          Your focus session is complete. Stand up, roll your shoulders, stretch your spine, or rest your eyes.
        </p>

        {/* Action Cards */}
        <div className="grid grid-cols-1 gap-3 mt-6 text-left">
          <button
            onClick={handleStart5MinChallenge}
            className="flex items-center justify-between p-4 rounded-2xl border-2 border-brand-500 bg-brand-50/50 hover:bg-brand-50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <div>
                <p className="font-bold text-brand-950 text-sm">Guided 5-Minute Challenge</p>
                <p className="text-xs text-brand-700">5 curated stretches with audio cues & +60 pts</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-brand-600 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={handleStartFreeBreak}
            className="flex items-center justify-between p-4 rounded-2xl border border-surface-border bg-white hover:border-brand-300 hover:bg-surface-subtle transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-charcoal-heading text-sm">5-Minute Free Rest Break</p>
                <p className="text-xs text-charcoal-muted">Start a timer while you walk or grab water</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-charcoal-muted group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-surface-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={skipBreak}
            className="text-xs text-charcoal-muted"
          >
            Skip Break for Now
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleFinishImmediately}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Log Break (+10 pts)
          </Button>
        </div>
      </div>
    </Modal>
  );
};
