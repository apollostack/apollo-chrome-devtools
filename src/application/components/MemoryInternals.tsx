import type { TypedDocumentNode } from "@apollo/client";
import { gql, useQuery } from "@apollo/client";
import IconOutlink from "@apollo/icons/default/IconOutlink.svg";

import { FullWidthLayout } from "./Layouts/FullWidthLayout";
import { PageSpinner } from "./PageSpinner";
import type {
  MemoryInternalsQuery,
  MemoryInternalsQueryVariables,
} from "../types/gql";

interface MemoryInternalsProps {
  clientId: string | undefined;
}

const MEMORY_INTERNALS_QUERY: TypedDocumentNode<
  MemoryInternalsQuery,
  MemoryInternalsQueryVariables
> = gql`
  query MemoryInternalsQuery($clientId: ID!) {
    client(id: $clientId) {
      id
      memoryInternals {
        limits
        sizes
      }
    }
  }
`;

export function MemoryInternals({ clientId }: MemoryInternalsProps) {
  const { data, loading, error } = useQuery(MEMORY_INTERNALS_QUERY, {
    variables: { clientId: clientId as string },
    skip: !clientId,
    pollInterval: 500,
  });

  if (error) {
    throw error;
  }

  return (
    <FullWidthLayout className="p-4 gap-4">
      <header>
        <h1 className="font-medium text-2xl text-heading dark:text-heading-dark">
          Memory
        </h1>
        <p className="text-secondary dark:text-secondary-dark">
          Learn how Apollo Client manages memory and how to set custom cache
          size limits in the{" "}
          <a
            href="https://www.apollographql.com/docs/react/caching/memory-management/"
            className="font-medium underline inline-flex items-center gap-2"
            target="_blank"
            rel="noopener noreferer noreferrer"
          >
            docs
            <IconOutlink className="size-4" />
          </a>
          .
        </p>
      </header>
      <FullWidthLayout.Main className="overflow-auto">
        {loading ? (
          <PageSpinner />
        ) : (
          <pre>{JSON.stringify(data?.client, null, 2)}</pre>
        )}
      </FullWidthLayout.Main>
    </FullWidthLayout>
  );
}
