"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import TerminalFrame from "@/components/cta/TerminalFrame";
import { sleep } from "@/components/motion/sleep";
import Button from "@/components/ui/Button";
import { allServices } from "@/content/services/catalog";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { useBriefStore } from "@/stores/brief.store";

/** The brief's own service choices, plus a way out for visitors who do not know yet. */
const NOT_SURE = "Not sure yet";
const NEEDS = [...allServices.map((service) => service.name), NOT_SURE];
const slugFor = (name: string) => allServices.find((service) => service.name === name)?.slug;

const CHAR_MS = 22;
const PAUSE_MS = 250;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** True for an address the terminal accepts: something@something.something, no spaces. */
export const isEmail = (value: string) => EMAIL.test(value.trim());

type Tone = "plain" | "muted" | "ok" | "err";
type Item =
  | { kind: "line"; id: number; text: string; tone: Tone; prompt: boolean; typed: number }
  | { kind: "needs" | "email"; id: number };
/** An item before it has an id: the union with id removed from each member. */
type NewItem = Item extends infer Member
  ? Member extends Item
    ? Omit<Member, "id">
    : never
  : never;

type TerminalCtaProps = {
  /** How soon we reply; left out of the copy while unknown. */
  responseTime?: string;
};

/** Line colours on the terminal's dark editor surface, in both themes. */
const LINE_TONE: Record<Tone, string> = {
  plain: "text-[#d6deeb]",
  muted: "text-[#8b9ab0]",
  ok: "text-[#3ee08a]",
  err: "text-[#ff8a80]",
};

/**
 * The start of a brief, as a terminal: what you need (several chips) and where
 * to reply (an email). It sends nothing itself. Continue saves both answers to
 * the project brief's draft and opens /start, where the brief is finished and
 * the email confirmed like any other lead. Each line types out at 22 ms a
 * character with a blinking caret, starting once the terminal is 35 percent in
 * view. Chips are real buttons with aria-pressed; the live region announces each
 * line once it is complete. Under reduced motion lines appear at once.
 */
export default function TerminalCta({ responseTime }: TerminalCtaProps) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const run = useRef<AbortController | null>(null);
  const nextId = useRef(0);
  const reduce = useReducedMotion();
  const fine = useMediaQuery("(pointer: fine)");
  const [items, setItems] = useState<Item[]>([]);
  const [needs, setNeeds] = useState<string[]>([]);
  const [stage, setStage] = useState<"idle" | "needs" | "email" | "done">("idle");
  const [email, setEmail] = useState("");
  /** The email question is asked once per run, however fast the chips are clicked. */
  const askedEmail = useRef(false);

  const append = useCallback((item: NewItem) => {
    const id = nextId.current++;
    setItems((list) => [...list, { ...item, id } as Item]);
    return id;
  }, []);

  const type = useCallback(
    async (text: string, tone: Tone, prompt: boolean) => {
      const signal = run.current?.signal;
      if (!signal) return;
      const id = append({ kind: "line", text, tone, prompt, typed: reduce ? text.length : 0 });
      if (reduce) return;
      for (let typed = 1; typed <= text.length; typed++) {
        await sleep(CHAR_MS, signal);
        setItems((list) =>
          list.map((item) => (item.id === id && item.kind === "line" ? { ...item, typed } : item)),
        );
      }
    },
    [append, reduce],
  );

  const start = useCallback(async () => {
    run.current?.abort();
    const controller = new AbortController();
    run.current = controller;
    askedEmail.current = false;
    setItems([]);
    setNeeds([]);
    setEmail("");
    setStage("idle");
    try {
      await type(
        responseTime
          ? `# two questions to start your brief. We reply within ${responseTime}.`
          : "# two questions to start your brief",
        "muted",
        false,
      );
      await type("what do you need?", "plain", true);
      append({ kind: "needs" });
      setStage("needs");
    } catch {
      // Restarted or unmounted.
    }
  }, [append, responseTime, type]);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        void start();
      },
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      run.current?.abort();
    };
  }, [start]);

  const askEmail = async () => {
    const signal = run.current?.signal;
    if (!signal || askedEmail.current) return;
    askedEmail.current = true;
    try {
      if (!reduce) await sleep(PAUSE_MS, signal);
      await type("where should we reply?", "plain", true);
      append({ kind: "email" });
      setStage("email");
      if (fine) window.requestAnimationFrame(() => input.current?.focus({ preventScroll: true }));
    } catch {
      // Restarted or unmounted.
    }
  };

  const toggleNeed = (label: string) => {
    const adding = !needs.includes(label);
    setNeeds((list) => (adding ? [...list, label] : list.filter((value) => value !== label)));
    if (adding) void askEmail();
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const signal = run.current?.signal;
    if (!signal || stage !== "email") return;
    setItems((list) => list.filter((item) => !(item.kind === "line" && item.tone === "err")));
    const address = email.trim();
    try {
      if (!isEmail(address)) {
        await type("✗ enter an email address like name@company.com", "err", false);
        return;
      }
      setStage("done");
      setItems((list) => list.filter((item) => item.kind !== "email"));
      // The brief keeps its draft in sessionStorage: load any saved draft first,
      // then add these answers and open the step after the one they complete.
      const services = needs
        .map(slugFor)
        .filter((slug): slug is NonNullable<typeof slug> => !!slug);
      await useBriefStore.persist.rehydrate();
      const brief = useBriefStore.getState();
      brief.update({ services, contact: { email: address } });
      brief.goTo(services.length ? 2 : 1);
      await type(`✓ saved: ${needs.join(", ")}`, "ok", false);
      await type("opening the project brief…", "muted", false);
      if (!reduce) await sleep(400, signal);
      track("terminal_brief_handoff", { services });
      router.push("/start");
    } catch {
      // Restarted or unmounted.
    }
  };

  const typingId = [...items]
    .reverse()
    .find((item) => item.kind === "line" && item.typed < item.text.length)?.id;
  const chipsLocked = stage === "done";

  return (
    <TerminalFrame ref={root}>
      {items.map((item) => {
        if (item.kind === "line") {
          const done = item.typed >= item.text.length;
          return (
            <p
              key={item.id}
              className={cn("chat-in mb-3 whitespace-pre-wrap", LINE_TONE[item.tone])}
            >
              <span aria-hidden="true">
                {item.prompt ? <span className="text-[#22d3ee]">&gt; </span> : null}
                {item.text.slice(0, item.typed)}
                {item.id === typingId ? <span className="code-caret ml-0.5" /> : null}
              </span>
              {done ? <span className="sr-only">{item.text}</span> : null}
            </p>
          );
        }
        if (item.kind === "needs") {
          return (
            <div
              key={item.id}
              role="group"
              aria-label="What do you need?"
              className="chat-in mt-1 mb-[26px] flex flex-wrap gap-2.5"
            >
              {NEEDS.map((label) => {
                const pressed = needs.includes(label);
                return (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={pressed}
                    disabled={chipsLocked}
                    onClick={() => toggleNeed(label)}
                    className={cn(
                      "rounded-full border px-3.5 py-2 text-sm transition-[color,background-color,border-color,transform] duration-200 active:scale-[0.96] disabled:cursor-not-allowed",
                      pressed
                        ? "border-[#22d3ee] bg-[#22d3ee] text-[#06222a]"
                        : "border-white/20 text-[#c3cdd8] hover:border-white/40 hover:text-white",
                    )}
                  >
                    {pressed ? "✓ " : null}
                    {label}
                  </button>
                );
              })}
            </div>
          );
        }
        return (
          <form
            key={item.id}
            noValidate
            onSubmit={submit}
            className="chat-in mt-1 flex flex-wrap items-center gap-2.5"
          >
            <span aria-hidden="true" className="text-[#22d3ee]">
              $
            </span>
            <input
              ref={input}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="name@company.com"
              aria-label="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 min-w-[200px] flex-1 border-0 border-b border-white/25 bg-transparent px-1 font-mono text-[0.9375rem] text-white placeholder:text-[#8b9ab0] focus:border-[#22d3ee]"
            />
            <Button type="submit">Continue to the brief</Button>
          </form>
        );
      })}
    </TerminalFrame>
  );
}
