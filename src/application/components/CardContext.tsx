import { createContext, useContext } from "react";

interface CardContextValue {
  variant: "filled" | "outline" | "unstyled";
}

const CardContext = createContext<CardContextValue>({
  variant: "outline",
});

export const CardProvider = CardContext.Provider;

export function useCard() {
  return useContext(CardContext);
}
