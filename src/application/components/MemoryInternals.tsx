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
import { useEffect, useMemo, useState } from "react";
import { ButtonGroup } from "./ButtonGroup";
import { Button } from "./Button";
import { Tooltip } from "./Tooltip";
import { JSONTreeViewer } from "./JSONTreeViewer";
import throttle from "lodash.throttle";

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

type Caches = NonNullable<
  NonNullable<MemoryInternalsQuery["client"]>["memoryInternals"]
>["caches"];

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

const SAMPLE_RATE_MS = 5000;
const samples: Array<{ timestamp: Date; caches: Caches }> = [];

const cacheComponents: Record<
  InternalCache,
  { key: InternalCache; render: (caches: Caches) => JSX.Element }
> = {
  print: {
    key: "print",
    render: (caches) => <CacheSize cacheSize={caches.print} />,
  },
  parser: {
    key: "parser",
    render: (caches) => <CacheSize cacheSize={caches.parser} />,
  },
  canonicalStringify: {
    key: "canonicalStringify",
    render: (caches) => <CacheSize cacheSize={caches.canonicalStringify} />,
  },
  links: { key: "links", render: () => <TODOCacheSize /> },
  ["queryManager.getDocumentInfo"]: {
    key: "queryManager.getDocumentInfo",
    render: () => <TODOCacheSize />,
  },
  ["queryManager.documentTransforms"]: {
    key: "queryManager.documentTransforms",
    render: () => <TODOCacheSize />,
  },
  ["fragmentRegistry.lookup"]: {
    key: "fragmentRegistry.lookup",
    render: () => <TODOCacheSize />,
  },
  ["fragmentRegistry.findFragmentSpreads"]: {
    key: "fragmentRegistry.findFragmentSpreads",
    render: () => <TODOCacheSize />,
  },
  ["fragmentRegistry.transform"]: {
    key: "fragmentRegistry.transform",
    render: () => <TODOCacheSize />,
  },
  ["cache.fragmentQueryDocuments"]: {
    key: "cache.fragmentQueryDocuments",
    render: () => <TODOCacheSize />,
  },
  ["addTypenameDocumentTransform"]: {
    key: "addTypenameDocumentTransform",
    render: () => <TODOCacheSize />,
  },
  ["inMemoryCache.executeSelectionSet"]: {
    key: "inMemoryCache.executeSelectionSet",
    render: () => <TODOCacheSize />,
  },
  ["inMemoryCache.executeSubSelectedArray"]: {
    key: "inMemoryCache.executeSubSelectedArray",
    render: () => <TODOCacheSize />,
  },
  ["inMemoryCache.maybeBroadcastWatch"]: {
    key: "inMemoryCache.maybeBroadcastWatch",
    render: () => <TODOCacheSize />,
  },
};

type ValueOf<T> = { [K in keyof T]: T[K] }[keyof T];

export function MemoryInternals({ clientId }: MemoryInternalsProps) {
  const [selectedCache, setSelectedCache] = useState<
    ValueOf<typeof cacheComponents>
  >(cacheComponents.print);
  const [selectedView, setSelectedView] = useState<"raw" | "chart">("chart");

  const { data, networkStatus, error } = useQuery(MEMORY_INTERNALS_QUERY, {
    variables: { clientId: clientId as string },
    skip: !clientId,
    pollInterval: 500,
  });

  if (error) {
    throw error;
  }

  const memoryInternals = data?.client?.memoryInternals;
  const caches = memoryInternals?.caches;

  if (networkStatus === NetworkStatus.loading) {
    return (
      <EmptyLayout>
        <PageSpinner />
      </EmptyLayout>
    );
  }

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

  return (
    <FullWidthLayout className="p-4 gap-4">
      <div className="flex gap-2 justify-between items-start">
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
              value={selectedCache.key}
              onValueChange={(value) =>
                setSelectedCache(cacheComponents[value as InternalCache])
              }
            >
              {Object.values(cacheComponents).map(({ key }) => (
                <SelectOption label={key} key={key} />
              ))}
            </Select>
            {selectedCache.render(caches)}
          </>
        ) : selectedView === "raw" ? (
          <JSONTreeViewer hideRoot data={memoryInternals.raw} />
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
