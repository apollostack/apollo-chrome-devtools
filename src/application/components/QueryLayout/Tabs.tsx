import type { ReactNode } from "react";
import { Tabs as TabsBase } from "../Tabs";

interface TabsProps<TValue extends string> {
  children: ReactNode;
  defaultValue?: TValue;
  value?: TValue;
  onChange?: (value: TValue) => void;
}

export function Tabs<TValue extends string = string>({
  children,
  defaultValue,
  value,
  onChange,
}: TabsProps<TValue>) {
  return (
    <TabsBase
      className="[grid-area:tabs] lg:overflow-hidden lg:-my-2 xl:border-l xl:border-l-primary xl:dark:border-l-primary-dark xl:pl-6 xl:-my-4 xl:py-2"
      defaultValue={defaultValue}
      value={value}
      onChange={onChange}
    >
      {children}
    </TabsBase>
  );
}
