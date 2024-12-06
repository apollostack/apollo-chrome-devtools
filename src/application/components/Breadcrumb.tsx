import type { ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";

interface BreadcrumbProps extends ComponentPropsWithoutRef<"nav"> {}

export function Breadcrumb({ className, children, ...props }: BreadcrumbProps) {
  return (
    <nav {...props} className={twMerge(className)}>
      <ol className="flex items-center">{children}</ol>
    </nav>
  );
}
