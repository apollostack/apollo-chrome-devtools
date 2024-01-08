import { List as ListBase } from "@radix-ui/react-tabs";
import { ReactNode } from "react";

interface ListProps {
  children: ReactNode;
}

export function List({ children }: ListProps) {
  return (
    <ListBase className="flex items-center gap-6 border-b border-b-neutral dark:border-b-neutral-dark">
      {children}
    </ListBase>
  );
}