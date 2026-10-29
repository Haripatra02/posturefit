import { useState, useEffect, useCallback, useRef } from 'react';
import { Exercise } from '../types';

export function useVoiceAssistant() {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const [speechRate, setSpeechRate] = useState<number>(0.95); // Natural, clear cadence
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    }
  }, []);

  const getBestVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    // Prioritize natural English voices
    const preferred = voices.find(
      (v) =>
        (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David') || v.name.includes('Aria'))) ||
        v.lang === 'en-US' ||
        v.lang === 'en-GB'
    );
    return preferred || voices.find((v) => v.lang.startsWith('en')) || voices[0] || null;
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!isSupported || !isVoiceEnabled || typeof window === 'undefined') return;

      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechRate;
      utterance.pitch = 1.0;

      const voice = getBestVoice();
      if (voice) utterance.voice = voice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, isVoiceEnabled, speechRate, getBestVoice]
  );

  const speakExerciseOverview = useCallback(
    (exercise: Exercise) => {
      const categoryName = exercise.category.replace('_', ' ');
      const text = `Now starting ${exercise.title}. This posture exercise targets your ${categoryName}. ${exercise.description}. Follow the animated movement on screen.`;
      speak(text);
    },
    [speak]
  );

  const speakStep = useCallback(
    (stepNumber: number, stepText: string) => {
      const text = `Step ${stepNumber}. ${stepText}`;
      speak(text);
    },
    [speak]
  );

  const speakWhatAreWeDoing = useCallback(
    (exercise: Exercise, remainingSeconds?: number) => {
      const timeText = remainingSeconds !== undefined ? `with ${remainingSeconds} seconds remaining.` : '';
      const text = `We are doing ${exercise.title} ${timeText} Remember to breathe gently and maintain a tall, balanced spine.`;
      speak(text);
    },
    [speak]
  );

  return {
    isSupported,
    isSpeaking,
    isVoiceEnabled,
    setIsVoiceEnabled,
    speechRate,
    setSpeechRate,
    speak,
    speakExerciseOverview,
    speakStep,
    speakWhatAreWeDoing,
    stopSpeaking,
  };
}
