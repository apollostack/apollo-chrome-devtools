import { clsx } from "clsx";

interface EmptyMessageProps {
  className?: string;
}

export function EmptyMessage({ className }: EmptyMessageProps) {
  return (
    <div className={clsx(className, "w-[344px] text-center")}>
      <h1 className="text-md font-semibold font-body text-heading dark:text-heading-dark">
        👋 Welcome to Apollo Client Devtools
      </h1>
      <div className="[grid-area:content]">
        Start interacting with your interface to see data reflected in this
        space
      </div>
    </div>
  );
}