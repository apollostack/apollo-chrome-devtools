import { makeVar } from "@apollo/client";
import type { ConnectorsDebuggingResultPayloadWithId } from "../types";

export const connectorsRequestsVar = makeVar<
  ConnectorsDebuggingResultPayloadWithId[]
>([]);
