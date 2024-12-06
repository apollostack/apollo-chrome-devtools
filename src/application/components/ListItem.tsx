import type { ReactNode, ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";

interface ListItemProps {
  className?: string;
  children?: ReactNode;
  selected?: boolean;
  onClick?: ComponentPropsWithoutRef<"li">["onClick"];
}

export function ListItem({
  className,
  children,
  selected,
  onClick,
}: ListItemProps) {
  return (
    <li
      tabIndex={0}
      className={twMerge(
        "text-sm text-primary dark:text-primary-dark",
        "transition-colors duration-200",
        "border-2 border-transparent flex items-center rounded-md cursor-pointer py-2 px-4",
        "focus-visible:outline-none",
        "focus-visible:border-focused focus-visible:dark:border-focused-dark",
        selected
          ? "font-semibold bg-neutral dark:bg-neutral-dark"
          : "hover:bg-button-secondaryHover hover:dark:bg-button-secondaryHover-dark",
        className
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.currentTarget.click();
        }
      }}
    >
      <div className="overflow-hidden whitespace-nowrap text-ellipsis w-full">
        {children}
      </div>
    </li>
  );
}
