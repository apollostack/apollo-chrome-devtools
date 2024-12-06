import type { ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";

interface DefinitionListItemProps extends ComponentPropsWithoutRef<"div"> {
  term: string;
}

export function DefinitionListItem({
  children,
  className,
  term,
  ...props
}: DefinitionListItemProps) {
  return (
    <div {...props} className={twMerge("flex gap-3 py-2", className)}>
      <dt className="font-semibold">{term}:</dt>
      <dd>{children}</dd>
    </div>
  );
}
