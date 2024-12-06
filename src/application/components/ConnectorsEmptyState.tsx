import type { ReactNode } from "react";
import IconGalaxy from "../assets/icon-galaxy.svg";

interface ConnectorsEmptyStateProps {
  children?: ReactNode;
}

export function ConnectorsEmptyState({ children }: ConnectorsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-start gap-4 my-12">
      <IconGalaxy />
      <p>{children}</p>
    </div>
  );
}
