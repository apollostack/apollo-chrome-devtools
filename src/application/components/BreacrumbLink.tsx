import type { ReactNode } from "react";
import { Link, type To } from "react-router-dom";

interface BreadcrumbLinkProps {
  children?: ReactNode;
  to: To;
}

export function BreadcrumbLink({ children, to }: BreadcrumbLinkProps) {
  return (
    <Link
      to={to}
      className="active:font-semibold focus-visible:ring-focused dark:focus-visible:ring-focused-dark hover:text-secondary dark:hover:text-secondary-dark transition-colors no-underline hover:underline"
    >
      {children}
    </Link>
  );
}
