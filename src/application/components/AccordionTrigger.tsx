import { Header, Trigger } from "@radix-ui/react-accordion";
import type { AccordionTriggerProps as BaseAccordionTriggerProps } from "@radix-ui/react-accordion";
import { twMerge } from "tailwind-merge";

type AccordionTriggerProps = Omit<BaseAccordionTriggerProps, "asChild">;

export function AccordionTrigger({
  className,
  ...props
}: AccordionTriggerProps) {
  return (
    <Header
      className={twMerge(
        "border border-primary dark:border-primary-dark rounded overflow-hidden data-state-open:rounded-b-none group/accordion-header",
        className
      )}
    >
      <Trigger
        {...props}
        className={twMerge(
          "w-full flex items-center cursor-pointer py-3 px-4 hover:bg-secondary dark:hover:bg-secondary-dark transition-colors duration-200 gap-2",
          className
        )}
      />
    </Header>
  );
}
