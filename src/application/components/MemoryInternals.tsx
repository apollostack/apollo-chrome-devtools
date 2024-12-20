import type { TypedDocumentNode } from "@apollo/client";
import { gql, NetworkStatus, useQuery } from "@apollo/client";
import IconOutlink from "@apollo/icons/default/IconOutlink.svg";
import IconOperations from "@apollo/icons/default/IconOperations.svg";
import IconObserve from "@apollo/icons/default/IconObserve.svg";

import { FullWidthLayout } from "./Layouts/FullWidthLayout";
import { PageSpinner } from "./PageSpinner";
import type {
  MemoryInternalsQuery,
  MemoryInternalsQueryVariables,
} from "../types/gql";
import type { ReactNode } from "react";
import { useState } from "react";
import { ButtonGroup } from "./ButtonGroup";
import { Button } from "./Button";
import { Tooltip } from "./Tooltip";
import { JSONTreeViewer } from "./JSONTreeViewer";
import { CacheSize } from "./CacheSize";
import { lt } from "semver";
import { ExternalLink } from "./ExternalLink";
import { PageError } from "./PageError";

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
      version
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
  const version = data?.client?.version;

  if (networkStatus === NetworkStatus.loading) {
    return (
      <EmptyLayout>
        <PageSpinner />
      </EmptyLayout>
    );
  }

  if (version && lt(version, "3.9.0")) {
    return (
      <EmptyLayout>
        <PageError className="mt-8">
          <PageError.Content>
            <PageError.Title>Memory management not available</PageError.Title>
            <PageError.Body>
              <p>
                Memory management is available in Apollo Client{" "}
                <ExternalLink
                  href="https://github.com/apollographql/apollo-client/releases/tag/v3.9.0"
                  className="font-medium inline-flex items-center gap-2"
                >
                  3.9.0
                  <IconOutlink className="size-4" />
                </ExternalLink>{" "}
                or greater. Please upgrade your Apollo Client version to use
                this feature.
              </p>
            </PageError.Body>
          </PageError.Content>
        </PageError>
      </EmptyLayout>
    );
  }

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
    <FullWidthLayout className="p-4 gap-6">
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
          <div className="grid grid-cols-1 md:flex md:flex-wrap gap-4">
            <CacheSize cacheSize={caches.cache.fragmentQueryDocuments} />
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
            <CacheSize cacheSize={caches.queryManager.getDocumentInfo} />

            <CacheSize cacheSize={caches.canonicalStringify} />
            <CacheSize cacheSize={caches.parser} />
            <CacheSize cacheSize={caches.print} />
            {caches.queryManager.documentTransforms?.map(({ cache }, index) => (
              <CacheSize key={index} cacheSize={cache} />
            ))}
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
          <ExternalLink
            href="https://www.apollographql.com/docs/react/caching/memory-management/"
            className="font-medium underline inline-flex items-center gap-2"
          >
            docs
            <IconOutlink className="size-4" />
          </ExternalLink>
          .
        </p>
      </header>
      <FullWidthLayout.Main className="flex flex-col gap-4 overflow-hidden">
        {children}
      </FullWidthLayout.Main>
    </FullWidthLayout>
  );
}
