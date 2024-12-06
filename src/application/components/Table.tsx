import { useMemo, type ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";
import { TableProvider } from "./TableContext";

type NativeTableProps = ComponentPropsWithoutRef<"table">;

interface TableProps extends NativeTableProps {
  interactive?: boolean;
  variant?: "plain" | "striped";
  size?: "default" | "condensed";
}

export function Table({
  interactive = false,
  variant = "plain",
  size = "default",
  className,
  ...props
}: TableProps) {
  const contextValue = useMemo(
    () => ({ interactive, size, variant }),
    [interactive, size, variant]
  );

  return (
    <TableProvider value={contextValue}>
      <table
        {...props}
        className={twMerge(
          "bg-primary dark:bg-primary-dark rounded-lg border-separate border-spacing-0 lining-nums tabular-nums w-full",
          className
        )}
      />
    </TableProvider>
  );
}
