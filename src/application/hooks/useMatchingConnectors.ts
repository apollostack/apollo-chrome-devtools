import { useReactiveVar } from "@apollo/client";
import { canonicalStringify } from "@apollo/client/utilities";
import { connectorsRequestsVar } from "../vars";

interface Options {
  query: string | null | undefined;
  variables: Record<string, unknown> | null | undefined;
}

export function useMatchingConnectors({ query, variables }: Options) {
  return useReactiveVar(connectorsRequestsVar).filter((data) => {
    return (
      data.query === query &&
      canonicalStringify(data.variables) === canonicalStringify(variables)
    );
  });
}
