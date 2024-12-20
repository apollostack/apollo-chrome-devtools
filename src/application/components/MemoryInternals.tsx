import type { TypedDocumentNode } from "@apollo/client";
import { gql, NetworkStatus, useQuery } from "@apollo/client";
import IconOutlink from "@apollo/icons/default/IconOutlink.svg";
import IconOutlinkSm from "@apollo/icons/small/IconOutlink.svg";
import IconOperations from "@apollo/icons/default/IconOperations.svg";
import IconObserve from "@apollo/icons/default/IconObserve.svg";
import IconInfo from "@apollo/icons/default/IconInfo.svg";

import { FullWidthLayout } from "./Layouts/FullWidthLayout";
import { PageSpinner } from "./PageSpinner";
import type {
  CacheSize,
  MemoryInternalsQuery,
  MemoryInternalsQueryVariables,
} from "../types/gql";
import type { ReactNode } from "react";
import { useState } from "react";
import { ButtonGroup } from "./ButtonGroup";
import { Button } from "./Button";
import { Tooltip } from "./Tooltip";
import { JSONTreeViewer } from "./JSONTreeViewer";
import type { CacheSizes } from "@apollo/client/utilities";
import clsx from "clsx";

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
    key
    size
    limit
  }
`;

type Caches = NonNullable<
  NonNullable<MemoryInternalsQuery["client"]>["memoryInternals"]
>["caches"];

const descriptions: Record<keyof CacheSizes, ReactNode> = {
  print: (
    <>
      <p>
        Cache size for the{" "}
        <a
          href="https://github.com/apollographql/apollo-client/blob/main/src/utilities/graphql/print.ts"
          target="_blank"
          rel="noopener noreferer noreferrer"
          className="inline-flex items-center underline font-medium gap-1"
        >
          print <IconOutlinkSm className="size-3" />
        </a>{" "}
        function.
      </p>
      <p>
        It is called with transformed <code>DocumentNode</code>s.
      </p>
      <p>
        This method is called to transform a GraphQL query AST parsed by{" "}
        <code>gql</code> back into a GraphQL string.
      </p>
    </>
  ),
  parser: "",
  canonicalStringify: "",
  "PersistedQueryLink.persistedQueryHashes": "",
  "removeTypenameFromVariables.getVariableDefinitions": "",
  "queryManager.getDocumentInfo": "",
  "documentTransform.cache": "",
  "fragmentRegistry.lookup": "",
  "fragmentRegistry.findFragmentSpreads": "",
  "fragmentRegistry.transform": "",
  "cache.fragmentQueryDocuments": "",
  "inMemoryCache.executeSelectionSet": "",
  "inMemoryCache.executeSubSelectedArray": "",
  "inMemoryCache.maybeBroadcastWatch": "",
};

export function MemoryInternals({ clientId }: MemoryInternalsProps) {
  const [selectedView, setSelectedView] = useState<"raw" | "chart">("chart");

  const { data, networkStatus, error } = useQuery(MEMORY_INTERNALS_QUERY, {
    variables: { clientId: clientId as string },
    skip: !clientId,
    pollInterval: 1000,
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
      <FullWidthLayout.Main className="flex flex-col gap-4 overflow-auto">
        {selectedView === "chart" ? (
          <div className="flex flex-wrap gap-2">
            <CacheSize cacheSize={caches.cache.fragmentQueryDocuments} />
            {caches.queryManager.documentTransforms?.map(({ cache }, index) => (
              <CacheSize key={index} cacheSize={cache} />
            ))}
            <CacheSize
              cacheSize={caches.fragmentRegistry.findFragmentSpreads}
            />
            <CacheSize cacheSize={caches.fragmentRegistry.lookup} />
            <CacheSize cacheSize={caches.fragmentRegistry.transform} />
            <CacheSize cacheSize={caches.inMemoryCache.executeSelectionSet} />
            <CacheSize
              cacheSize={caches.inMemoryCache.executeSubSelectedArray}
            />
            <CacheSize cacheSize={caches.inMemoryCache.maybeBroadcastWatch} />
            {caches.links.map((link, index) => (
              <CacheSize
                key={index}
                cacheSize={
                  link.__typename === "PersistedQueryLinkCacheSizes"
                    ? link.persistedQueryHashes
                    : link.getVariableDefinitions
                }
              />
            ))}
            <CacheSize cacheSize={caches.queryManager.getDocumentInfo} />

            <CacheSize cacheSize={caches.canonicalStringify} />
            <CacheSize cacheSize={caches.parser} />
            <CacheSize cacheSize={caches.print} />
          </div>
        ) : selectedView === "raw" ? (
          <JSONTreeViewer
            hideRoot
            data={memoryInternals.raw}
            shouldExpandNodeInitially={() => true}
          />
        ) : null}
      </FullWidthLayout.Main>
    </FullWidthLayout>
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

function CacheSize({ cacheSize }: { cacheSize: CacheSize }) {
  if (cacheSize.size === null || cacheSize.limit === null) {
    return null;
  }

  const description = descriptions[cacheSize.key as keyof CacheSizes];
  const percentUsed = (cacheSize.size / cacheSize.limit) * 100;

  return (
    <div className="border border-primary dark:border-primary-dark rounded p-3 flex flex-col gap-4">
      <h2 className="text-heading dark:text-heading-dark text-sm font-code flex gap-2 items-center">
        {cacheSize.key}
        {description && (
          <Tooltip
            content={<div className="flex flex-col gap-2">{description}</div>}
          >
            <span>
              <IconInfo className="text-icon-primary dark:text-icon-primary-dark size-4" />
            </span>
          </Tooltip>
        )}
      </h2>
      <div className="flex gap-2 items-center">
        <div className="flex flex-col gap-1">
          <span className="uppercase text-secondary dark:text-secondary-dark">
            Size
          </span>
          <span className="font-code">{cacheSize.size}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="uppercase text-secondary dark:text-secondary-dark">
            Limit
          </span>
          <span className="font-code">{cacheSize.limit}</span>
        </div>
        <div
          className={clsx("text-3xl", {
            "text-error dark:text-error-dark": percentUsed >= 90,
            "text-warning dark:text-warning-dark":
              percentUsed >= 70 && percentUsed < 90,
            "text-success dark:text-success-dark-dark": percentUsed < 70,
          })}
        >
          {percentUsed.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}
