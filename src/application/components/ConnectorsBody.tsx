import type { ConnectorsDebuggingBody } from "../../types";
import { JSONTreeViewer } from "./JSONTreeViewer";

interface ConnectorsBodyProps {
  body: ConnectorsDebuggingBody;
}

export function ConnectorsBody({ body }: ConnectorsBodyProps) {
  return body.kind === "json" ? (
    <JSONTreeViewer
      hideRoot={!Array.isArray(body.content)}
      className="[&>li]:!pt-0"
      data={body.content}
      shouldExpandNodeInitially={() => true}
    />
  ) : (
    String(body.content)
  );
}
