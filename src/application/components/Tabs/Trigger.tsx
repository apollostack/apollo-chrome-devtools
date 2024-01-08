import { ReactNode } from "react";
import { Trigger as TriggerBase } from "@radix-ui/react-tabs";

interface TriggerProps {
  children: ReactNode;
  value: string;
}

export function Trigger({ children, value }: TriggerProps) {
  return (
    <TriggerBase
      className="py-2 text-md text-secondary dark:text-secondary-dark data-state-active:text-primary dark:data-state-active:text-primary-dark border-b-4 border-b-transparent data-state-active:border-b-primary dark:data-state-active:border-b-primary-dark"
      value={value}
    >
      {children}
    </TriggerBase>
  );
}