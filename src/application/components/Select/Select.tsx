import type { ReactNode } from "react";
import IconChevronDown from "@apollo/icons/default/IconChevronDown.svg";
import IconChevronUp from "@apollo/icons/default/IconChevronUp.svg";
import * as SelectBase from "@radix-ui/react-select";
import { twMerge } from "tailwind-merge";
import { Option } from "./Option";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { OmitNull } from "../../types/utils";

interface SelectProps extends SelectBase.SelectTriggerProps {
  align?: "start" | "center" | "end";
  children?: ReactNode;
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  name?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  size?: Variants["size"];
  value?: string;
}

type Variants = OmitNull<Required<VariantProps<typeof select>>>;

const select = cva(
  [
    "group flex justify-between gap-4 items-center bg-input dark:bg-input-dark border border-primary dark:border-primary-dark",
    "hover:border-hover dark:hover:border-hover-dark transition-colors ease-out",
    "focus:border-focused dark:focus:border-focused-dark focus-visible:outline-none",
    "disabled:bg-disabled dark:disabled:bg-disabled-dark disabled:border-disabled dark:disabled:border-disabled-dark disabled:text-disabled dark:disabled:text-disabled-dark",
  ],
  {
    variants: {
      size: {
        sm: ["py-1", "px-3", "rounded", "h-8", "text-sm"],
        md: ["py-2", "px-3", "rounded-lg", "h-10"],
        lg: ["p-3", "rounded-lg", "h-12"],
      },
    },
  }
);

const scrollIndicator = cva(
  [
    "absolute",
    "flex",
    "items-center",
    "justify-center",
    "cursor-default",
    "py-2",
    "bg-primary",
    "dark:bg-primary-dark",
    "z-10",
    "left-px",
    "right-px",
  ],
  {
    variants: {
      position: {
        top: ["top-px", "rounded-t-lg"],
        bottom: ["bottom-px", "rounded-b-lg"],
      },
    },
  }
);

export const Select = ({
  align,
  children,
  className,
  defaultValue,
  disabled,
  name,
  onValueChange,
  placeholder,
  size = "md",
  value,
}: SelectProps) => {
  return (
    <SelectBase.Root
      name={name}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
    >
      <SelectBase.Trigger
        disabled={disabled}
        className={twMerge(select({ size }), className)}
      >
        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
          <SelectBase.Value placeholder={placeholder ?? "Select..."} />
        </span>
        <SelectBase.Icon className="group-data-state-open:rotate-180 transition-transform">
          <IconChevronDown className="w-4" />
        </SelectBase.Icon>
      </SelectBase.Trigger>
      <SelectBase.Portal>
        <SelectBase.Content
          align={align}
          sideOffset={6}
          position="popper"
          className="border border-primary bg-primary dark:bg-primary-dark dark:border-primary-dark shadow-dropdown overflow-hidden rounded-lg min-w-80 max-h-[--radix-select-content-available-height]"
        >
          <SelectBase.ScrollUpButton
            className={scrollIndicator({ position: "top" })}
          >
            <IconChevronUp className="w-4" />
          </SelectBase.ScrollUpButton>
          <SelectBase.Viewport className="px-4 py-4">
            {children}
          </SelectBase.Viewport>
          <SelectBase.ScrollDownButton
            className={scrollIndicator({ position: "bottom" })}
          >
            <IconChevronDown className="w-4" />
          </SelectBase.ScrollDownButton>
        </SelectBase.Content>
      </SelectBase.Portal>
    </SelectBase.Root>
  );
};

Select.Option = Option;
