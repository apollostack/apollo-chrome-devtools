import { cloneElement, type ReactElement, type ReactNode } from "react";
import IconStatusDot from "@apollo/icons/default/IconStatusDot.svg";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { OmitNull } from "../types/utils";
import { twMerge } from "tailwind-merge";

export interface StatusBadgeProps extends IconVariants, ContainerVariants {
  icon?: ReactElement<{ className: string }>;
  className?: string;
  children?: ReactNode;
}

type IconVariants = Required<OmitNull<VariantProps<typeof iconStyles>>>;
type ContainerVariants = Required<OmitNull<VariantProps<typeof container>>>;

const container = cva(
  [
    "inline-flex",
    "items-center",
    "font-body",
    "font-normal",
    "text-md",
    "gap-2",
  ],
  {
    variants: {
      variant: {
        rounded: [
          "py-1",
          "px-3",
          "rounded-[100px]",
          "border",
          "border-primary",
          "bg-primary",
          "dark:border-primary-dark",
          "dark:bg-primary-dark",
        ],
        hidden: [],
      },
    },
  }
);

const iconStyles = cva(["size-4"], {
  variants: {
    color: {
      blue: ["text-icon-info", "text-icon-info-dark"],
      gray: ["text-icon-secondary", "dark:text-icon-secondary-dark"],
      green: ["text-icon-success", "dark:text-icon-success-dark"],
      navy: ["text-icon-disabled", "dark:text-icon-disabled-dark"],
      purple: ["text-icon-beta", "dark:text-icon-beta-dark"],
      red: ["text-icon-error", "dark:text-icon-error-dark"],
      yellow: ["text-icon-change", "dark:text-icon-change-dark"],
    },
  },
});

export function StatusBadge({
  className,
  children,
  color,
  variant,
  icon = <IconStatusDot />,
}: StatusBadgeProps) {
  return (
    <span className={twMerge(container({ variant }), className)}>
      {cloneElement(icon, {
        className: twMerge(iconStyles({ color }), icon.props.className),
      })}
      {children}
    </span>
  );
}
