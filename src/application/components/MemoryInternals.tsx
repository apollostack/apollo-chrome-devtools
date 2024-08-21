import type { TypedDocumentNode } from "@apollo/client";
import { gql, NetworkStatus, useQuery } from "@apollo/client";
import IconOutlink from "@apollo/icons/default/IconOutlink.svg";
import IconOperations from "@apollo/icons/default/IconOperations.svg";
import IconObserve from "@apollo/icons/default/IconObserve.svg";

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
import { ButtonGroup } from "./ButtonGroup";
import { Button } from "./Button";
import { Tooltip } from "./Tooltip";
import { JSONTreeViewer } from "./JSONTreeViewer";
import { client } from "..";

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
        raw
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

type InternalCache =
  | "print"
  | "parser"
  | "canonicalStringify"
  | "links"
  | "queryManager.getDocumentInfo"
  | "queryManager.documentTransforms"
  | "fragmentRegistry.lookup"
  | "fragmentRegistry.findFragmentSpreads"
  | "fragmentRegistry.transform"
  | "cache.fragmentQueryDocuments"
  | "addTypenameDocumentTransform"
  | "inMemoryCache.executeSelectionSet"
  | "inMemoryCache.executeSubSelectedArray"
  | "inMemoryCache.maybeBroadcastWatch";

export function MemoryInternals({ clientId }: MemoryInternalsProps) {
  const [selectedCache, setSelectedCache] = useState<InternalCache>("print");
  const [selectedView, setSelectedView] = useState<"raw" | "chart">("chart");
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
      <EmptyLayout>
        <PageSpinner />
      </EmptyLayout>
    );
  }

  const memoryInternals = data?.client?.memoryInternals;
  const caches = memoryInternals?.caches;

  // TODO: Show a message for clients older < 3.9
  if (!caches) {
    return (
      <EmptyLayout>
        <p className="text-secondary dark:text-secondary-dark">
          Could not get memory internals for the client. This may be a result of
          running your application in production mode as access to memory
          internals is disabled in production builds.
        </p>
      </EmptyLayout>
    );
  }

  const cacheComponents: Record<InternalCache, ReactElement> = {
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
    <FullWidthLayout className="p-4 gap-4">
      <div className="flex gap-2 justify-between">
        <header className="flex flex-col gap-2">
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

        <ButtonGroup>
          <Tooltip content="View historical">
            <Button
              icon={<IconObserve className="size-4" />}
              size="md"
              variant={selectedView === "chart" ? "primary" : "secondary"}
              onClick={() => setSelectedView("chart")}
            />
          </Tooltip>
          <Tooltip content="View raw">
            <Button
              icon={<IconOperations className="size-4" />}
              size="md"
              variant={selectedView === "raw" ? "primary" : "secondary"}
              onClick={() => setSelectedView("raw")}
            />
          </Tooltip>
        </ButtonGroup>
      </div>
      <FullWidthLayout.Main className="flex flex-col gap-4 overflow-auto items-start">
        {selectedView === "chart" ? (
          <>
            <Select
              defaultValue="print"
              value={selectedCache}
              onValueChange={(value) =>
                setSelectedCache(value as InternalCache)
              }
            >
              {Object.keys(cacheComponents).map((key) => (
                <SelectOption label={key} key={key} />
              ))}
            </Select>
            {cacheComponents[selectedCache]}
          </>
        ) : selectedView === "raw" ? (
          <JSONTreeViewer data={memoryInternals.raw} />
        ) : null}
      </FullWidthLayout.Main>
    </FullWidthLayout>
  );
}

function SelectOption({ label }: { label: string }) {
  return (
    <Select.Option value={label}>
      <span className="font-code">{label}</span>
    </Select.Option>
  );
}

function EmptyLayout({ children }: { children: ReactNode }) {
  return (
    <FullWidthLayout className="p-4 gap-4">
      <header className="flex flex-col gap-2">
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
      <FullWidthLayout.Main className="flex flex-col gap-4 overflow-hidden">
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
