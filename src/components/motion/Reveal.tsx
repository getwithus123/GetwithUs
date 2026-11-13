/* eslint-disable react-hooks/refs -- elementRef is only read in effects, never during render; the pattern is intentional */
"use client";

import { createElement, useEffect, useRef, useState } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type RevealTag = "h2" | "ol" | "ul";
type RevealProps = HTMLAttributes<HTMLElement> & { as: RevealTag };
type EnterState = "pending" | "shown" | "static" | "waiting";

/**
 * A block that rises in once when it scrolls into view. It renders visible
 * ("pending") on the server, so content shows without JavaScript and nothing on
 * screen at load is ever hidden; only blocks still below the fold after mount
 * are set to "waiting" (hidden, globals.css) until they enter.
 */
export default function Reveal({ as, children, className, ...props }: RevealProps) {
  const elementRef = useRef<HTMLElement>(null);
  const [enterState, setEnterState] = useState<EnterState>("pending");

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const id = setTimeout(() => setEnterState("static"), 0);
      return () => clearTimeout(id);
    }

    if (element.getBoundingClientRect().top < window.innerHeight) {
      const id = setTimeout(() => setEnterState("static"), 0);
      return () => clearTimeout(id);
    }

    setEnterState("waiting");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setEnterState("shown");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return createElement(
    as,
    {
      ...props,
      ref: elementRef,
      className: cn("reveal", className),
      "data-enter": enterState,
    },
    children,
  );
}
