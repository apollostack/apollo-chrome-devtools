import { createContext, useContext } from "react";

export interface TableContextValue {
  interactive: boolean;
  variant: "plain" | "striped";
  size: "default" | "condensed";
}

const TableContext = createContext<TableContextValue>({
  interactive: false,
  variant: "plain",
  size: "default",
});

export const TableProvider = TableContext.Provider;

export function useTable() {
  return useContext(TableContext);
}
