import type { ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";

interface ThProps extends ComponentPropsWithoutRef<"th"> {
  formElement?: boolean;
  numeric?: boolean;
}

export function Th({ className, formElement, numeric, ...props }: ThProps) {
  return (
    <th
      {...props}
      className={twMerge(
        "font-heading font-medium text-heading dark:text-heading-dark border-b border-b-primary dark:border-b-primary-dark px-6 h-10 [&>svg]:shrink-0 group text-start",
        formElement && "text-center",
        numeric && "text-end",
        className
      )}
    />
  );
}
