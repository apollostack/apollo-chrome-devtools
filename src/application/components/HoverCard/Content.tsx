import type { ReactNode } from "react";
import * as HoverCard from "@radix-ui/react-hover-card";
import { twMerge } from "tailwind-merge";

interface ContentProps {
  className?: string;
  children?: ReactNode;
}

export function Content({ className, children }: ContentProps) {
  return (
    <HoverCard.Portal>
      <HoverCard.Content
        collisionPadding={20}
        sideOffset={2}
        className={twMerge(
          "bg-primary dark:bg-primary-dark border border-primary dark:border-primary-dark rounded-lg px-4 py-3 shadow-popovers text-sm max-w-md overflow-auto max-h-[var(--radix-popper-available-height)] isolate z-50",
          className
        )}
      >
        {children}
        <HoverCard.Arrow asChild>
          <div
            className={twMerge(
              "w-[12px] h-[12px] relative -top-px",
              "before:absolute before:border-y-[12px] before:border-x-[12px] before:border-transparent",
              "before:border-t-primary before:dark:border-t-primary-dark",
              "after:absolute after:border-y-[10px] after:border-x-[10px] after:border-transparent",
              "after:border-t-arrow-primary after:dark:border-t-arrow-primary-dark after:left-0.5"
            )}
          />
        </HoverCard.Arrow>
      </HoverCard.Content>
    </HoverCard.Portal>
  );
}
