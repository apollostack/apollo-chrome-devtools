import { Item } from "@radix-ui/react-accordion";
import type { AccordionItemProps as BaseAccordionItemProps } from "@radix-ui/react-accordion";

type AccordionItemProps = Omit<BaseAccordionItemProps, "asChild">;

export function AccordionItem(props: AccordionItemProps) {
  return <Item {...props} />;
}
