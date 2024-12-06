import type { ReactNode } from "react";
import { Trigger as TriggerBase } from "@radix-ui/react-tabs";
import { twMerge } from "tailwind-merge";

interface TriggerProps {
  children: ReactNode;
  className?: string;
  value: string;
}

export function Trigger({ children, className, value }: TriggerProps) {
  return (
    <TriggerBase
      className={twMerge(
        "py-2 text-md text-secondary dark:text-secondary-dark data-state-active:font-semibold data-state-active:text-primary dark:data-state-active:text-primary-dark border-y-4 border-y-transparent data-state-active:border-b-neutral dark:data-state-active:border-b-neutral-dark whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focused focus-visible:dark:ring-focused-dark",
        className
      )}
      value={value}
    >
      {children}
    </TriggerBase>
  );
}
