import { clsx } from "clsx";
import { Icon, IconProps } from "../Icon";

interface RunIconProps {
  className?: string;
  size?: IconProps["size"];
}

export function RunIcon({ className, size }: RunIconProps) {
  return (
    <Icon
      size={size}
      viewBox="0 0 15 18"
      className={clsx(className, "fill-none")}
    >
      <path
        d="M1.906 1.53702C1.81491 1.48301 1.71114 1.45407 1.60524 1.45315C1.49934 1.45222 1.39508 1.47934 1.30306 1.53175C1.21104 1.58417 1.13452 1.66 1.0813 1.75155C1.02807 1.84311 1.00002 1.94712 1 2.05302V15.947C1.00002 16.0529 1.02807 16.1569 1.0813 16.2485C1.13452 16.34 1.21104 16.4159 1.30306 16.4683C1.39508 16.5207 1.49934 16.5478 1.60524 16.5469C1.71114 16.546 1.81491 16.517 1.906 16.463L13.629 9.51602C13.7185 9.46289 13.7927 9.38739 13.8442 9.29692C13.8957 9.20645 13.9228 9.10413 13.9228 9.00002C13.9228 8.89591 13.8957 8.79359 13.8442 8.70312C13.7927 8.61265 13.7185 8.53715 13.629 8.48402L1.906 1.53702Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  );
}
