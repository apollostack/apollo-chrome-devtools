import { clsx } from "clsx";
import IconObservatory from "../assets/observatory.svg";
import { cloneElement, type ReactElement, type ReactNode } from "react";

interface EmptyMessageProps {
  icon?: ReactElement<{ className?: string }>;
  className?: string;
  title?: string;
  children?: ReactNode;
}

export function EmptyMessage({
  icon = <IconObservatory />,
  className,
  title,
  children,
}: EmptyMessageProps) {
  return (
    <div
      className={clsx(
        className,
        "max-w-md text-center flex flex-col items-center gap-2"
      )}
    >
      {cloneElement(icon, { className: clsx("w-48", icon.props.className) })}
      <h1 className="text-2xl font-semibold font-body text-heading dark:text-heading-dark">
        {title || "👋 Welcome to Apollo Client Devtools"}
      </h1>
      <div className="text-left">
        {children ||
          "Start interacting with your interface to see data reflected in this space"}
      </div>
    </div>
  );
}
