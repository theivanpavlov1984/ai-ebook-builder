"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";

/*
 * Motion helpers for the landing page's live demos. Every demo runs only while it is on screen, and only
 * when the visitor hasn't asked their system for less motion – otherwise it shows its finished frame.
 * Without IntersectionObserver or matchMedia (tests, very old browsers) nothing animates.
 */

const REDUCE = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onChange: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const query = window.matchMedia(REDUCE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** True when the visitor prefers reduced motion – or when the browser can't tell us. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReduced,
    () => (window.matchMedia ? window.matchMedia(REDUCE).matches : true),
    () => true,
  );
}

/** Whether the element is on screen. `once` keeps it true after the first time (for reveal-once effects). */
export function useInView<T extends Element>({
  once = false,
  rootMargin = "0px",
  threshold = 0.2,
}: { once?: boolean; rootMargin?: string; threshold?: number } = {}): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.disconnect();
      },
      { rootMargin, threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once, rootMargin, threshold]);

  return [ref, inView];
}

/**
 * Milliseconds of play time, advancing only while `running`. Pausing keeps the position, so a demo
 * scrolled away and back continues where it was instead of restarting.
 */
export function usePlayClock(running: boolean, tick = 50): number {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      setElapsed((e) => e + (now - last));
      last = now;
    }, tick);
    return () => clearInterval(id);
  }, [running, tick]);
  return elapsed;
}

/** A demo plays when it is on screen and motion is welcome; otherwise it shows its last frame. */
export function useDemo<T extends Element>(): { ref: RefObject<T | null>; playing: boolean; t: number } {
  const reduced = usePrefersReducedMotion();
  const [ref, inView] = useInView<T>({ threshold: 0.25 });
  const playing = inView && !reduced;
  return { ref, playing, t: usePlayClock(playing) };
}

/**
 * How far the page has scrolled through a tall element, from 0 (its top reaches the top of the screen) to 1
 * (its bottom reaches the bottom). Drives a sticky "scroll story"; updates at most once a frame.
 */
export function useScrollProgress(ref: RefObject<Element | null>): number {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      setProgress(range > 0 ? Math.min(1, Math.max(0, -rect.top / range)) : 0);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [ref]);
  return progress;
}
