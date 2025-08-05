import { useEffect, useRef, useCallback } from "react";

const INACTIVITY_LIMIT_MS = 15*60 * 1000; // 20 seconds

const WARNING_1_MS = 10*60 * 1000; // Warning at 15 seconds elapsed (5 seconds left)
const WARNING_2_MS = 5*60 * 1000; // Warning at 12 seconds elapsed (8 seconds left)
const FINAL_COUNTDOWN_SEC = 10; // 10 seconds countdown

interface InactivityCallbacks {
  onWarning1?: () => void;
  onWarning2?: () => void;
  onFinalCountdownTick?: (secondsRemaining: number) => void;
  onInactive: () => void;
  onReset?: () => void;
}


export function useInactivityTimer({
  onWarning1,
  onWarning2,
  onFinalCountdownTick,
  onInactive,
  onReset,
}: InactivityCallbacks) {
  const timer = useRef<NodeJS.Timeout | null>(null);
  const warning1Timer = useRef<NodeJS.Timeout | null>(null);
  const warning2Timer = useRef<NodeJS.Timeout | null>(null);
  const finalCountdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const finalCountdownInterval = useRef<NodeJS.Timeout | null>(null);
  const targetTime = useRef<number>(Date.now() + INACTIVITY_LIMIT_MS);

  const clearAllTimers = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (warning1Timer.current) {
      clearTimeout(warning1Timer.current);
      warning1Timer.current = null;
    }
    if (warning2Timer.current) {
      clearTimeout(warning2Timer.current);
      warning2Timer.current = null;
    }
    if (finalCountdownTimeout.current) {
      clearTimeout(finalCountdownTimeout.current);
      finalCountdownTimeout.current = null;
    }
    if (finalCountdownInterval.current) {
      clearInterval(finalCountdownInterval.current);
      finalCountdownInterval.current = null;
    }
  };

  const resetTimer = useCallback(() => {
    clearAllTimers();

    const now = Date.now();
    targetTime.current = now + INACTIVITY_LIMIT_MS;

    // Log current local time and reset info
    console.log(`Inactivity timer reset at: ${new Date().toLocaleTimeString()}`);

    if (onReset) onReset();

    // Warning 1 timer
    warning1Timer.current = setTimeout(() => {
      console.log(`Warning 1 triggered at: ${new Date().toLocaleTimeString()}`);
      if (onWarning1) onWarning1();
    }, INACTIVITY_LIMIT_MS - WARNING_1_MS);

    // Warning 2 timer
    warning2Timer.current = setTimeout(() => {
      console.log(`Warning 2 triggered at: ${new Date().toLocaleTimeString()}`);
      if (onWarning2) onWarning2();
    }, INACTIVITY_LIMIT_MS - WARNING_2_MS);

    // Logout timer - delayed by 1 second compared to countdown end to avoid race conditions
    timer.current = setTimeout(() => {
      console.log(`Logout triggered at: ${new Date().toLocaleTimeString()}`);
      clearAllTimers();
      onInactive();
    }, INACTIVITY_LIMIT_MS + 1000);

    // Final countdown timer
    finalCountdownTimeout.current = setTimeout(() => {
      let secondsRemaining = FINAL_COUNTDOWN_SEC;

      if (finalCountdownInterval.current) {
        clearInterval(finalCountdownInterval.current);
      }

      finalCountdownInterval.current = setInterval(() => {
        if (secondsRemaining === 0) {
          if (finalCountdownInterval.current) {
            clearInterval(finalCountdownInterval.current);
            finalCountdownInterval.current = null;
          }
          return;
        }
        console.log(`Final countdown tick: ${secondsRemaining} second(s) remaining at ${new Date().toLocaleTimeString()}`);
        if (onFinalCountdownTick) onFinalCountdownTick(secondsRemaining);
        secondsRemaining -= 1;
      }, 1000);
    }, INACTIVITY_LIMIT_MS - FINAL_COUNTDOWN_SEC * 1000);
  }, [onWarning1, onWarning2, onFinalCountdownTick, onInactive, onReset]);

  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearAllTimers();
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [resetTimer]);

  return { resetTimer };
}
