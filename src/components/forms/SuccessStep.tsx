"use client";

import { CircleCheck } from "lucide-react";
import { useEffect, useRef } from "react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { formCopy } from "@/content/forms";
import { PRIVATE_CLASS } from "@/lib/analytics";
import { cn } from "@/lib/cn";

/** The end of a form: what happens next, and a way back to the home page. */
export default function SuccessStep({ message }: { message: string }) {
  const heading = useRef<HTMLHeadingElement>(null);

  // Move focus here so screen readers announce the confirmation.
  useEffect(() => heading.current?.focus(), []);

  return (
    <div className="grid gap-5">
      <div className="flex items-start gap-3">
        <Icon icon={CircleCheck} size={24} className="mt-0.5 text-ok" />
        {/* PRIVATE_CLASS: the contact form's message repeats the visitor's email. */}
        <h2
          ref={heading}
          tabIndex={-1}
          className={cn(PRIVATE_CLASS, "max-w-[48ch] type-h4 outline-none")}
        >
          {message}
        </h2>
      </div>
      <div>
        <Button href="/" variant="secondary">
          {formCopy.success.backHome}
        </Button>
      </div>
    </div>
  );
}
