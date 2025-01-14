import { Root, Content, Portal, Trigger } from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";

interface TooltipProps {
  asChild?: boolean;
  content: ReactNode;
  children?: ReactNode;
  delayDuration?: number;
  side?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({
  content,
  children,
  delayDuration,
  side = "bottom",
}: TooltipProps) {
  return (
    <Root delayDuration={delayDuration}>
      <Trigger asChild>{children}</Trigger>
      <Portal>
        <Content
          sideOffset={4}
          className="shadow-popovers border rounded bg-black dark:bg-black-dark border-black dark:border-black-dark py-1 px-2 text-white dark:text-white-dark text-sm font-body max-w-72"
          side={side}
        >
          {content}
        </Content>
      </Portal>
    </Root>
  );
}
