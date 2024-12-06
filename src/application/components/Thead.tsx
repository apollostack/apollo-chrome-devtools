import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface TheadProps extends ComponentPropsWithoutRef<"thead"> {
  children: ReactNode;
}

export function Thead({ className, ...props }: TheadProps) {
  return (
    <thead {...props} className={twMerge("sticky top-0 z-10", className)} />
  );
}
