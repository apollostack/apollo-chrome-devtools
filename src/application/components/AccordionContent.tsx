import { Content } from "@radix-ui/react-accordion";
import type { AccordionContentProps as BaseAccordionContentProps } from "@radix-ui/react-accordion";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";

type AccordionContentProps = Omit<BaseAccordionContentProps, "asChild">;

export function AccordionContent({
  className,
  ...props
}: AccordionContentProps) {
  return (
    <Content {...props} asChild>
      <AnimatedContent {...(props as AnimatedContentProps)} />
    </Content>
  );
}

type AnimatedContentProps = ComponentPropsWithoutRef<typeof motion.div>;

const EASINGS = {
  ease: [0.25, 0.1, 0.25, 1],
};

const AnimatedContent = forwardRef<HTMLDivElement, AnimatedContentProps>(
  ({ className, ...props }, ref) => {
    const show = (props as Record<string, unknown>)["data-state"] === "open";

    return (
      <AnimatePresence initial={false}>
        {show && (
          <motion.div
            {...props}
            ref={ref}
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: { duration: 0.3, ease: EASINGS.ease },
                opacity: { duration: 0.4, ease: EASINGS.ease },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { duration: 0.2, ease: EASINGS.ease },
                opacity: { duration: 0.3, ease: EASINGS.ease },
              },
              transitionEnd: { display: "none" },
            }}
            style={{ display: "block" }}
            className="rounded-b border border-primary dark:border-primary-dark border-t-0 overflow-hidden"
          >
            <div
              className={twMerge(
                "p-4 bg-primary dark:bg-primary-dark overflow-auto",
                className
              )}
            >
              {props.children as ReactNode}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }
);
