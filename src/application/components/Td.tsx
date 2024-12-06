import type { ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";
import { cva } from "class-variance-authority";
import { useTable } from "./TableContext";

interface TdProps extends ComponentPropsWithoutRef<"td"> {
  formElement?: boolean;
  numeric?: boolean;
}

const td = cva(
  [
    "text-primary",
    "dark:text-primary-dark",
    "border-b",
    "border-b-primary",
    "dark:border-b-primary-dark",
    "px-6",
    "py-2",
    "group-[]/card-body:group-last/tr:border-b-0",
  ],
  {
    variants: {
      size: {
        condensed: ["h-10"],
        default: ["h-14"],
      },
      variant: {
        plain: [],
        striped: [
          "group-odd/tr:bg-secondary",
          "dark:group-odd/tr:bg-secondary-dark",
        ],
      },
    },
  }
);

export function Td({ className, formElement, numeric, ...props }: TdProps) {
  const { interactive, size, variant } = useTable();

  return (
    <td
      {...props}
      className={twMerge(
        td({ size, variant }),
        interactive &&
          "cursor-pointer group-hover/tr:bg-tableHover dark:group-hover/tr:bg-tableHover-dark empty:before:[content:'–']",
        formElement && "text-center",
        numeric && "text-end",
        className
      )}
    />
  );
}
