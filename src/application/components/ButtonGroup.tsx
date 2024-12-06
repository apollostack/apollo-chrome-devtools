import type { ReactNode } from "react";
import clsx from "clsx";

interface ButtonGroupProps {
  attached?: boolean;
  className?: string;
  children: ReactNode;
}

export function ButtonGroup({
  attached,
  className,
  children,
}: ButtonGroupProps) {
  return (
    <div
      data-attached={attached}
      className={clsx(
        "flex items-center group/button-group",
        !attached && "gap-2",
        className
      )}
    >
      {children}
    </div>
  );
}
