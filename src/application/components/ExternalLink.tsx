import IconOutlink from "@apollo/icons/default/IconOutlink.svg";
import { cva } from "class-variance-authority";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface ExternalLinkProps {
  children?: ReactNode;
  href: string;
  className?: string;
  size?: "sm" | "md";
}

const icon = cva(["text-icon-primary", "dark:text-icon-primary-dark"], {
  variants: {
    size: {
      sm: "size-3",
      md: "size-4",
    },
  },
});

export function ExternalLink({
  children,
  className,
  size = "md",
  ...props
}: ExternalLinkProps) {
  return (
    <a
      {...props}
      target="_blank"
      rel="noreferrer"
      className={twMerge(
        "underline underline-offset-4 font-semibold inline-flex gap-1 items-center",
        className
      )}
    >
      {children}
      <IconOutlink className={icon({ size })} />
    </a>
  );
}
