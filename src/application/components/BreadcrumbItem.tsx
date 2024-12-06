import type { ReactElement } from "react";
import { Children, type ComponentPropsWithoutRef } from "react";
import IconChevronRight from "@apollo/icons/default/IconChevronRight.svg";
import { twMerge } from "tailwind-merge";

interface BreadcrumbItemProps extends ComponentPropsWithoutRef<"li"> {
  isCurrentPage?: boolean;
}

export function BreadcrumbItem({
  isCurrentPage,
  children,
  className,
  ...props
}: BreadcrumbItemProps) {
  const link = Children.only(children);

  if (!link) {
    throw new Error(
      "Must pass an <BreadcrumbLink /> as only child of BreadcrumbItem"
    );
  }

  const linkProps = (link as ReactElement).props;

  return (
    <li
      {...props}
      className={twMerge(
        "flex items-center text-md font-normal text-primary dark:text-primary-dark",
        className
      )}
    >
      {isCurrentPage ? (
        <span className="font-semibold">{linkProps?.children}</span>
      ) : (
        link
      )}
      {!isCurrentPage && (
        <IconChevronRight
          role="presentation"
          className="block size-4 mx-2 text-icon-secondary dark:text-icon-secondary-dark"
        />
      )}
    </li>
  );
}
