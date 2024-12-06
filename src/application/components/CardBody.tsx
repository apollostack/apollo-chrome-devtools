import { cva } from "class-variance-authority";
import { useCard } from "./CardContext";
import type { ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";

type CardBodyProps = ComponentPropsWithoutRef<"div">;

const cardBody = cva(
  [
    "flex",
    "flex-col",
    "gap-4",
    "py-4",
    "last:pb-6",
    "first:py-6",
    "has-[>table]:px-0",
    "has-[>table]:overflow-y-auto",
    "has-[>table:first-child]:pt-0",
    "has-[>table:last-child]:pb-0",
    "group/card-body",
  ],
  {
    variants: {
      variant: {
        filled: [],
        outline: ["px-6"],
        unstyled: [],
      },
    },
  }
);

export function CardBody({ className, ...props }: CardBodyProps) {
  const { variant } = useCard();

  return (
    <div
      {...props}
      data-card-element="body"
      className={twMerge(cardBody({ variant }), className)}
    />
  );
}
