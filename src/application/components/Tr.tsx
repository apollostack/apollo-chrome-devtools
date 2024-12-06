import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";

type TrProps = ComponentPropsWithoutRef<"tr">;

export const Tr = forwardRef<HTMLTableRowElement, TrProps>(
  ({ className, ...props }, ref) => {
    return (
      <tr
        {...props}
        ref={ref}
        className={twMerge(
          "focus-visible:outline-0 focus-visible:bg-tableHover dark:focus-visible:bg-tableHover-dark group/tr",
          className
        )}
      />
    );
  }
);
