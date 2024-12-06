import { Root } from "@radix-ui/react-accordion";
import type {
  AccordionSingleProps,
  AccordionMultipleProps,
} from "@radix-ui/react-accordion";
import { twMerge } from "tailwind-merge";

type AccordionProps = AccordionSingleProps | AccordionMultipleProps;

export function Accordion({ className, ...props }: AccordionProps) {
  return (
    <Root {...props} className={twMerge("flex flex-col gap-4", className)} />
  );
}
