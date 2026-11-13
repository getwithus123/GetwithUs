"use client";

import { Bell, Check, CircleCheck } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { sleep } from "@/components/motion/sleep";
import { useDemoLoop } from "@/components/motion/useDemoLoop";
import { EXAMPLE_DATA_LABEL, appDemo } from "@/content/demos";
import { cn } from "@/lib/cn";

type View = { screen: number; slot: boolean; push: boolean; release: number };

const FULL: View = { screen: 2, slot: true, push: true, release: appDemo.statuses.length };
const START: View = { screen: 0, slot: false, push: false, release: 0 };

function SignIn() {
  return (
    <div className="grid gap-3">
      <span className="h-3 w-24 rounded bg-ink" />
      <span className="mt-2 h-10 rounded-[10px] border border-line-2" />
      <span className="h-10 rounded-[10px] border border-line-2" />
      <span className="mt-2 grid h-10 place-items-center rounded-full bg-accent text-sm font-bold text-accent-ink">
        {appDemo.screens[0]}
      </span>
    </div>
  );
}

function Booking({ slot }: { slot: boolean }) {
  return (
    <div className="grid gap-3">
      <span className="text-sm font-bold text-ink">{appDemo.screens[1]}</span>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <span
            key={item}
            className={cn(
              "h-9 rounded-[8px] border transition-colors duration-300",
              item === 4 && slot ? "border-accent bg-accent" : "border-line-2 bg-bg-soft",
            )}
          />
        ))}
      </div>
      <span className="mt-1 h-2.5 w-[70%] rounded bg-line" />
      <span className="h-2.5 w-[50%] rounded bg-line" />
    </div>
  );
}

function Paid() {
  return (
    <div className="grid justify-items-center gap-3 pt-9 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-[color-mix(in_srgb,var(--ok)_14%,transparent)] text-ok">
        <CircleCheck size={36} strokeWidth={1.8} />
      </span>
      <span className="font-bold text-ink">{appDemo.screens[2]}</span>
      <span className="h-2.5 w-28 rounded bg-line" />
    </div>
  );
}

/**
 * The app development demo: a phone slides through sign-in, booking, and
 * payment, a push notification drops in, then the release chips with the
 * Apple and Google Play marks tick through "Submitted", "In review", and
 * "Live". Labels only, no dates or numbers. Renders finished first, then
 * replays while on screen.
 */
export default function AppFlowDemo({ marks }: { marks: readonly ReactNode[] }) {
  const frame = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>(FULL);
  const set = (patch: Partial<View>) => setView((current) => ({ ...current, ...patch }));

  const { reduce } = useDemoLoop(frame, async (signal) => {
    await sleep(400, signal);
    setView(START);
    await sleep(1700, signal);
    set({ screen: 1 });
    await sleep(900, signal);
    set({ slot: true });
    await sleep(1000, signal);
    set({ screen: 2 });
    await sleep(1300, signal);
    set({ push: true });
    await sleep(1500, signal);
    for (let step = 1; step <= appDemo.statuses.length; step++) {
      set({ release: step });
      await sleep(step === appDemo.statuses.length ? 4200 : 1100, signal);
    }
  });

  const current = reduce ? FULL : view;
  const screens = [
    <SignIn key="in" />,
    <Booking key="book" slot={current.slot} />,
    <Paid key="paid" />,
  ];

  return (
    <figure className="m-0">
      <figcaption className="sr-only">{appDemo.summary}</figcaption>
      <div
        ref={frame}
        aria-hidden="true"
        className="grid items-center gap-10 md:grid-cols-[auto_minmax(0,1fr)]"
      >
        {/* Always a dark device, like the code panels: bg-ink turns near white in the dark theme. */}
        <div className="relative mx-auto h-[460px] w-[230px] rounded-[38px] bg-ed-bg p-3 shadow-lift ring-1 ring-white/10">
          <div className="relative h-full overflow-hidden rounded-[28px] bg-card">
            <div
              className={cn(
                // Compact enough to sit above the payment screen's check mark on the 230 px phone.
                "absolute inset-x-3 top-3 z-10 flex items-start gap-2.5 rounded-[14px] border border-line bg-card p-2.5 shadow-lift transition-all duration-500 ease-out",
                current.push ? "translate-y-0 opacity-100" : "-translate-y-24 opacity-0",
              )}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-accent text-accent-ink">
                <Bell size={15} strokeWidth={2} />
              </span>
              <span className="min-w-0">
                <span className="block text-xs leading-snug font-bold whitespace-nowrap text-ink">
                  {appDemo.push.title}
                </span>
                <span className="block text-xs leading-snug text-body">{appDemo.push.body}</span>
              </span>
            </div>
            <div
              className="flex h-full transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
              style={{ transform: `translateX(-${current.screen * 100}%)` }}
            >
              {screens.map((screen, index) => (
                <div key={index} className="h-full w-full shrink-0 px-5 pt-16">
                  {screen}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-4">
          <p className="font-bold text-ink">Release</p>
          {appDemo.stores.map((store, index) => (
            <div
              key={store}
              className="flex flex-wrap items-center gap-3 rounded-card border border-line bg-card p-4 shadow-soft"
            >
              <span className="grid size-11 place-items-center rounded-[12px] bg-bg-soft">
                {marks[index]}
              </span>
              <span className="mr-auto font-semibold text-ink">{store}</span>
              <span className="flex flex-wrap gap-2">
                {appDemo.statuses.map((status, step) => {
                  const reached = step < current.release;
                  const live = reached && step === appDemo.statuses.length - 1;
                  return (
                    <span
                      key={status}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold transition-colors duration-300",
                        live
                          ? "border-ok bg-ok text-bg"
                          : reached
                            ? "border-accent bg-accent-soft text-ink"
                            : "border-line text-muted",
                      )}
                    >
                      {reached ? <Check size={12} strokeWidth={3} /> : null}
                      {status}
                    </span>
                  );
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
      <p className="example-label mt-4">{EXAMPLE_DATA_LABEL}</p>
    </figure>
  );
}
