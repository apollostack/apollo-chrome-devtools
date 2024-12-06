import type { ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";

type DlProps = ComponentPropsWithoutRef<"dl">;

export function DefinitionList({ className, ...props }: DlProps) {
  return <dl {...props} className={twMerge("flex flex-col", className)} />;
}
