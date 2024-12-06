import type { ComponentPropsWithoutRef } from "react";

type TbodyProps = ComponentPropsWithoutRef<"tbody">;

export function Tbody(props: TbodyProps) {
  return <tbody {...props} />;
}
