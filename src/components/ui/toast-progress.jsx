import { useEffect, useRef } from "react";

// Thin, calm countdown bar rendered along the bottom edge of a toast.
//
// Starts full-width and shrinks linearly to zero over `durationMs`. Pauses
// while `paused` is true (hover on desktop) and resumes from the same remaining
// time. Calls `onExpire()` once when it reaches zero so the toast can dismiss
// and fade out. No pulsing, no color animation, no large motion — just a
// smooth linear shrink and a subtle fade at the end (handled by the toast's
// exit animation).
export default function ToastProgress({ durationMs, paused, onExpire }) {
  const barRef = useRef(null);
  const remainingRef = useRef(durationMs);
  const lastRef = useRef(null);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  // Keep the latest onExpire without re-triggering the animation effect.
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (paused) {
      // Freeze: stop the clock so the bar holds its position while hovered.
      lastRef.current = null;
      return;
    }
    let raf;
    const step = (now) => {
      const last = lastRef.current ?? now;
      const delta = now - last;
      lastRef.current = now;
      remainingRef.current = Math.max(0, remainingRef.current - delta);
      if (barRef.current) {
        const pct = (remainingRef.current / durationMs) * 100;
        barRef.current.style.width = `${pct}%`;
      }
      if (remainingRef.current <= 0) {
        if (!expiredRef.current) {
          expiredRef.current = true;
          onExpireRef.current();
        }
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [paused, durationMs]);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-foreground/5">
      <div
        ref={barRef}
        data-toast-progress="bar"
        className="h-full w-full bg-foreground/20"
        style={{ willChange: "width" }}
      />
    </div>
  );
}