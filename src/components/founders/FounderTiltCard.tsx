"use client";

/**
 * FounderTiltCard
 *
 * A vertical portrait card with:
 *   - CSS 3D tilt on fine-pointer hover (up to 8 degrees per axis)
 *   - A radial sheen that follows the pointer
 *   - A per-founder CSS-only 3D wireframe motif (cube / gyroscope / plates)
 *   - Entrance: rises 46px and rotates in from rotateX(26deg) via IntersectionObserver
 *   - Layers at different translateZ depths for parallax depth
 *   - All motion disabled under prefers-reduced-motion
 *   - Touch devices: no tilt, slow motif rotation only
 *
 * Performance contract: only transform and opacity are animated. No layout
 * thrashing. rAF is used for the pointer tracking loop; the loop only runs
 * while the pointer is inside the card.
 */

import Image from "next/image";
import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { GlobeIcon, InstagramIcon, LinkedInIcon } from "@/components/icons/BrandIcons";
import type { TeamMember } from "@/content/types";

// ---------------------------------------------------------------------------
// CSS motif sub-components (pure CSS 3D, aria-hidden)
// ---------------------------------------------------------------------------

/** Wireframe cube - six faces, teal stroke, very light teal fill. */
function MotifCube() {
  return (
    <div className="motif-cube" aria-hidden="true">
      <span className="face face-front" />
      <span className="face face-back" />
      <span className="face face-left" />
      <span className="face face-right" />
      <span className="face face-top" />
      <span className="face face-bottom" />
    </div>
  );
}

/** Three gyroscope rings with a centre dot. */
function MotifGyroscope() {
  return (
    <div className="motif-gyroscope" aria-hidden="true">
      <span className="ring-x ring" />
      <span className="ring-y ring" />
      <span className="ring-z ring" />
      <span className="gyro-dot" />
    </div>
  );
}

/** Three translucent plates stacked on a tilted axis. */
function MotifPlates() {
  return (
    <div className="motif-plates" aria-hidden="true">
      <span className="plate plate-1" />
      <span className="plate plate-2" />
      <span className="plate plate-3" />
    </div>
  );
}

const MOTIFS: ReactNode[] = [
  <MotifCube key="cube" />,
  <MotifGyroscope key="gyro" />,
  <MotifPlates key="plates" />,
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const TILT_MAX = 8; // degrees

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function FounderTiltCard({ member, index }: { member: TeamMember; index: number }) {
  const cardRef = useRef<HTMLLIElement>(null);
  const rafRef = useRef<number | null>(null);
  const entered = useRef(false);

  const motif = MOTIFS[index % MOTIFS.length];
  const hasLinks = Boolean(
    member.links?.linkedin || member.links?.portfolio || member.links?.instagram,
  );

  // ---- entrance animation via IntersectionObserver ----
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Reduced motion: reveal immediately
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      card.style.setProperty("--card-opacity", "1");
      card.style.setProperty("--card-translateY", "0px");
      card.style.setProperty("--card-rotateX", "0deg");
      return;
    }

    // Set initial hidden state
    card.style.setProperty("--card-opacity", "0");
    card.style.setProperty("--card-translateY", "46px");
    card.style.setProperty("--card-rotateX", "26deg");

    const delay = index * 120; // stagger

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || entered.current) return;
        entered.current = true;
        observer.disconnect();
        setTimeout(() => {
          card.style.setProperty("--card-opacity", "1");
          card.style.setProperty("--card-translateY", "0px");
          card.style.setProperty("--card-rotateX", "0deg");
        }, delay);
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, [index]);

  // ---- pointer tilt (fine pointer only) ----
  const onPointerEnter = useCallback((e: React.PointerEvent<HTMLLIElement>) => {
    if (e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Tilt values are updated on each pointermove; nothing to do on enter.
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLLIElement>) => {
    if (e.pointerType !== "mouse") return;
    const card = cardRef.current;
    if (!card) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      // normalise to [-1, 1]
      const nx = (e.clientX - cx) / (rect.width / 2);
      const ny = (e.clientY - cy) / (rect.height / 2);

      const rotY = nx * TILT_MAX;
      const rotX = -ny * TILT_MAX;
      // Sheen position: 0-100%
      const shX = ((nx + 1) / 2) * 100;
      const shY = ((ny + 1) / 2) * 100;

      card.style.setProperty("--tilt-x", `${rotX}deg`);
      card.style.setProperty("--tilt-y", `${rotY}deg`);
      card.style.setProperty("--sheen-x", `${shX}%`);
      card.style.setProperty("--sheen-y", `${shY}%`);
      card.style.setProperty("--sheen-opacity", "1");
    });
  }, []);

  const onPointerLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--sheen-opacity", "0");
    });
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <li
      ref={cardRef}
      className="founder-card"
      style={
        {
          "--card-opacity": "1",
          "--card-translateY": "0px",
          "--card-rotateX": "0deg",
          "--tilt-x": "0deg",
          "--tilt-y": "0deg",
          "--sheen-x": "50%",
          "--sheen-y": "50%",
          "--sheen-opacity": "0",
        } as CSSProperties
      }
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {/* The tilt rig - perspective wrapper */}
      <div className="founder-card-inner">
        {/* Portrait panel */}
        <div className="founder-portrait">
          {/* "Co-founder" pill */}
          <span className="founder-pill" style={{ "--z": "60px" } as CSSProperties}>
            Co-founder
          </span>

          {/* Radial sheen */}
          <div className="founder-sheen" aria-hidden="true" />

          {/* 3D motif */}
          <div
            className={
              member.photo
                ? "founder-motif founder-motif--corner"
                : "founder-motif founder-motif--centre"
            }
            style={{ "--z": "50px" } as CSSProperties}
            aria-hidden="true"
          >
            {motif}
          </div>

          {/* Photo or initials */}
          {member.photo ? (
            <Image
              src={member.photo}
              alt={`Portrait of ${member.name}`}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <span
              className="founder-initials"
              style={{ "--z": "90px" } as CSSProperties}
              aria-hidden="true"
            >
              {initials(member.name)}
            </span>
          )}
        </div>

        {/* Info block */}
        <div className="founder-info" style={{ "--z": "34px" } as CSSProperties}>
          <h3 className="type-h4 text-ink">{member.name}</h3>
          <p className="mt-0.5 text-sm font-semibold text-muted">{member.role}</p>
          {member.focus?.trim() ? <p className="mt-1 text-sm text-body">{member.focus}</p> : null}
          {(member.shortBio ?? member.bio)?.trim() ? (
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-body">
              {member.shortBio ?? member.bio}
            </p>
          ) : null}

          {/* Pill links */}
          {hasLinks ? (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
              {member.links?.linkedin ? (
                <a
                  href={member.links.linkedin}
                  aria-label={`${member.name} on LinkedIn`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="founder-link-pill"
                >
                  <LinkedInIcon className="size-[1.0625rem] shrink-0" />
                  LinkedIn
                </a>
              ) : null}
              {member.links?.portfolio ? (
                <a
                  href={member.links.portfolio}
                  aria-label={`${member.name} portfolio`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="founder-link-pill"
                >
                  <GlobeIcon className="size-[1.0625rem] shrink-0" />
                  Portfolio
                </a>
              ) : null}
              {member.links?.instagram ? (
                <a
                  href={member.links.instagram}
                  aria-label={`${member.name} on Instagram`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="founder-link-pill"
                >
                  <InstagramIcon className="size-[1.0625rem] shrink-0" />
                  Instagram
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </li>
  );
}
