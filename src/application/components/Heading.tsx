import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import type { ComponentPropsWithoutRef } from "react";

type NativeHeadingProps = ComponentPropsWithoutRef<"h1">;
type ThemeProps =
  | {
      variant?: "heading";
      size?: "3xl" | "2xl" | "xl" | "lg";
    }
  | {
      variant: "title";
      size?: never;
    }
  | {
      variant: "subtitle";
      size?: never;
    };

type HeadingProps = ThemeProps &
  NativeHeadingProps & {
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  };

const heading = cva(
  ["font-heading", "text-heading", "dark:text-heading-dark"],
  {
    variants: {
      variant: {
        heading: ["font-medium"],
        title: ["text-md", "font-medium"],
        subtitle: [],
      },
      size: {
        lg: ["text-lg"],
        xl: ["text-xl"],
        "2xl": ["text-2xl"],
        "3xl": ["text-3xl"],
      },
    },
  }
);

export function Heading({
  as: Element = "h2",
  className,
  size = "lg",
  variant = "heading",
  ...props
}: HeadingProps) {
  return (
    <Element
      {...props}
      className={twMerge(heading({ variant, size }), className)}
    />
  );
}
