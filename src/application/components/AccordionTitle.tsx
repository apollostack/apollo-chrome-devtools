import type { ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";

type AccordionTitleProps = ComponentPropsWithoutRef<"h2">;

export function AccordionTitle({ className, ...props }: AccordionTitleProps) {
  return (
    <span
      {...props}
      className={twMerge(
        "font-medium text-heading dark:text-heading-dark text-md",
        className
      )}
    />
  );
}
