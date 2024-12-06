import { StatusBadge, type StatusBadgeProps } from "./StatusBadge";

interface HTTPStatusBadgeProps {
  status?: number;
  variant: "terse" | "full";
}

export function HTTPStatusBadge({ status, variant }: HTTPStatusBadgeProps) {
  if (status == null) {
    return (
      <StatusBadge color="gray" variant="hidden">
        Unknown
      </StatusBadge>
    );
  }

  let color: StatusBadgeProps["color"] = "gray";

  if (status >= 400) {
    color = "red";
  } else if (status >= 300) {
    color = "purple";
  } else if (status >= 100) {
    color = "green";
  }

  return (
    <StatusBadge color={color} variant="hidden">
      {status}
      {variant === "full" && ` ${STATUS_CODE_LABELS.get(status)}`}
    </StatusBadge>
  );
}

// https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
export const STATUS_CODE_LABELS = new Map([
  [100, "Continue"],
  [101, "Switching protocols"],
  [102, "Processing"],
  [103, "Early hints"],
  [200, "Ok"],
  [201, "Created"],
  [202, "Accepted"],
  [203, "Non-authoritative information"],
  [204, "No content"],
  [205, "Reset content"],
  [206, "Partial content"],
  [207, "Multi-status"],
  [208, "Already reported"],
  [226, "IM used"],
  [300, "Multiple choices"],
  [301, "Moved permanently"],
  [302, 'Found (previously "moved temporarily")'],
  [303, "See other"],
  [304, "Not modified"],
  [305, "Use proxy"],
  [306, "Switch proxy"],
  [307, "Temporary redirect"],
  [308, "Permanent redirect"],
  [400, "Bad request"],
  [401, "Unauthorized"],
  [402, "Payment required"],
  [403, "Forbidden"],
  [404, "Not found"],
  [405, "Method not allowed"],
  [406, "Not acceptable"],
  [407, "Proxy authentication required"],
  [408, "Request timeout"],
  [409, "Conflict"],
  [410, "Gone"],
  [411, "Length required"],
  [412, "Precondition failed"],
  [413, "Payload too large"],
  [414, "URI too long"],
  [415, "Unsupported media type"],
  [416, "Range not satisfiable"],
  [417, "Expectation failed"],
  [418, "I'm a teapot"],
  [421, "Misdirected request"],
  [422, "Unprocessable content"],
  [423, "Locked"],
  [424, "Failed dependency"],
  [425, "Too early"],
  [426, "Upgrade required"],
  [428, "Precondition required"],
  [429, "Too many requests"],
  [431, "Request header fields too large"],
  [451, "Unavailable for legal reasons"],
  [500, "Internal server error"],
  [501, "Not implemented"],
  [502, "Bad gateway"],
  [503, "Service unavailable"],
  [504, "Gateway timeout"],
  [505, "HTTP version not supported"],
  [506, "Variant also negotiates"],
  [507, "insufficient storage"],
  [508, "Loop detected"],
  [510, "Not extended"],
  [511, "Network authentication required"],
]);
