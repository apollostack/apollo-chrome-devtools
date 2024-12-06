import { Root, Content, Portal, Trigger } from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";

interface TooltipProps {
  asChild?: boolean;
  align?: "start" | "center" | "end";
  content: ReactNode;
  children?: ReactNode;
  delayDuration?: number;
  disableHoverableContent?: boolean;
  side?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({
  align,
  content,
  children,
  delayDuration,
  disableHoverableContent,
  side = "bottom",
}: TooltipProps) {
  return (
    <Root
      delayDuration={delayDuration}
      disableHoverableContent={disableHoverableContent}
    >
      <Trigger asChild>{children}</Trigger>
      <Portal>
        <Content
          align={align}
          sideOffset={4}
          className="shadow-popovers border rounded bg-black dark:bg-black-dark border-black dark:border-black-dark py-1 px-2 text-white dark:text-white-dark text-sm font-body z-50"
          side={side}
        >
          {content}
        </Content>
      </Portal>
    </Root>
  );
}
