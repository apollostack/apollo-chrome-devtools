import { List as ListBase } from "@radix-ui/react-tabs";
import { ReactNode } from "react";
import { clsx } from "clsx";

interface ListProps {
  className?: string;
  children: ReactNode;
}

export function List({ className, children }: ListProps) {
  return (
    <ListBase
      className={clsx(
        className,
        "flex items-center gap-6 border-b border-b-primary dark:border-b-primary-dark"
      )}
    >
      {children}
    </ListBase>
  );
}
