import type { TypedDocumentNode } from "@apollo/client";
import { gql, NetworkStatus, useQuery } from "@apollo/client";
import IconOutlink from "@apollo/icons/default/IconOutlink.svg";

import { FullWidthLayout } from "./Layouts/FullWidthLayout";
import { PageSpinner } from "./PageSpinner";
import type {
  CacheSize,
  MemoryInternalsQuery,
  MemoryInternalsQueryVariables,
} from "../types/gql";
import { Select } from "./Select";
import type { ReactElement, ReactNode } from "react";
import { useState } from "react";
import { Alert } from "./Alert";
import { selectsField } from "../../utils/graphql";
import { QueryManager } from "@apollo/client/core/QueryManager";

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
        caches {
          print {
            ...CacheSizeFields
          }
          parser {
            ...CacheSizeFields
          }
          canonicalStringify {
            ...CacheSizeFields
          }
          links {
            ... on PersistedQueryLinkCacheSizes {
              persistedQueryHashes {
                ...CacheSizeFields
              }
            }
            ... on RemoveTypenameFromVariablesLinkCacheSizes {
              getVariableDefinitions {
                ...CacheSizeFields
              }
            }
          }
          queryManager {
            getDocumentInfo {
              ...CacheSizeFields
            }
            documentTransforms {
              cache {
                ...CacheSizeFields
              }
            }
          }
          fragmentRegistry {
            lookup {
              ...CacheSizeFields
            }
            findFragmentSpreads {
              ...CacheSizeFields
            }
            transform {
              ...CacheSizeFields
            }
          }
          cache {
            fragmentQueryDocuments {
              ...CacheSizeFields
            }
          }
          addTypenameDocumentTransform {
            cache {
              ...CacheSizeFields
            }
          }
          inMemoryCache {
            maybeBroadcastWatch {
              ...CacheSizeFields
            }
            executeSelectionSet {
              ...CacheSizeFields
            }
            executeSubSelectedArray {
              ...CacheSizeFields
            }
          }
        }
      }
    }
  }

  fragment CacheSizeFields on CacheSize {
    size
    limit
  }
`;

export function MemoryInternals({ clientId }: MemoryInternalsProps) {
  const [selectedCache, setSelectedCache] = useState("print");
  const { data, networkStatus, error } = useQuery(MEMORY_INTERNALS_QUERY, {
    variables: { clientId: clientId as string },
    skip: !clientId,
    pollInterval: 500,
  });

  if (error) {
    throw error;
  }

  if (networkStatus === NetworkStatus.loading) {
    return (
      <Layout>
        <PageSpinner />
      </Layout>
    );
  }

  const memoryInternals = data?.client?.memoryInternals;
  const caches = memoryInternals?.caches;

  if (!caches) {
    return (
      <Layout>
        <p className="text-secondary dark:text-secondary-dark">
          Could not get memory internals for the client. This may be a result of
          running your application in production mode as access to memory
          internals is disabled in production builds.
        </p>
      </Layout>
    );
  }

  const cacheComponents: Record<string, ReactElement> = {
    print: <CacheSize cacheSize={caches.print} />,
    parser: <CacheSize cacheSize={caches.parser} />,
    canonicalStringify: <CacheSize cacheSize={caches.canonicalStringify} />,
    links: <TODOCacheSize />,
    ["queryManager.getDocumentInfo"]: <TODOCacheSize />,
    ["queryManager.documentTransforms"]: <TODOCacheSize />,
    ["fragmentRegistry.lookup"]: <TODOCacheSize />,
    ["fragmentRegistry.findFragmentSpreads"]: <TODOCacheSize />,
    ["fragmentRegistry.transform"]: <TODOCacheSize />,
    ["cache.fragmentQueryDocuments"]: <TODOCacheSize />,
    ["addTypenameDocumentTransform"]: <TODOCacheSize />,
    ["inMemoryCache.executeSelectionSet"]: <TODOCacheSize />,
    ["inMemoryCache.executeSubSelectedArray"]: <TODOCacheSize />,
    ["inMemoryCache.maybeBroadcastWatch"]: <TODOCacheSize />,
  };

  return (
    <Layout>
      <div className="flex flex-col gap-4 items-start">
        <Select
          defaultValue="print"
          value={selectedCache}
          onValueChange={setSelectedCache}
        >
          {Object.keys(cacheComponents).map((key) => (
            <SelectOption label={key} key={key} />
          ))}
        </Select>
        {cacheComponents[selectedCache]}
      </div>
    </Layout>
  );
}

function SelectOption({ label }: { label: string }) {
  return (
    <Select.Option value={label}>
      <span className="font-code">{label}</span>
    </Select.Option>
  );
}

function Layout({ children }: { children: ReactNode }) {
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
        {children}
      </FullWidthLayout.Main>
    </FullWidthLayout>
  );
}

function CacheSize({ cacheSize }: { cacheSize: CacheSize | null }) {
  if (!cacheSize) {
    return <p className="text-secondary">No cache found</p>;
  }

  return (
    <>
      <p>Limit: {cacheSize.limit}</p>
      <p>Size: {cacheSize.size}</p>
    </>
  );
}

function TODOCacheSize() {
  return "TODO: Implement me";
}
