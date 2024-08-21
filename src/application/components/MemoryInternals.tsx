import type { TypedDocumentNode } from "@apollo/client";
import { gql, useQuery } from "@apollo/client";
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
  });

  if (error) {
    throw error;
  }

  return (
    <FullWidthLayout>
      {loading ? (
        <PageSpinner />
      ) : (
        <pre>{JSON.stringify(data?.client, null, 2)}</pre>
      )}
    </FullWidthLayout>
  );
}
