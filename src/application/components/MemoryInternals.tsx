import type { TypedDocumentNode } from "@apollo/client";
import { gql, NetworkStatus, useQuery } from "@apollo/client";
import IconOutlink from "@apollo/icons/default/IconOutlink.svg";
import IconOutlinkSm from "@apollo/icons/small/IconOutlink.svg";
import IconOperations from "@apollo/icons/default/IconOperations.svg";
import IconObserve from "@apollo/icons/default/IconObserve.svg";
import IconInfo from "@apollo/icons/default/IconInfo.svg";
import IconPause from "@apollo/icons/default/IconPause.svg";

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
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { colors } from "@apollo/brand";
import { StatusBadge } from "./StatusBadge";
import { useInterval } from "../hooks/useInterval";
import { Spinner } from "./Spinner";

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

const SAMPLE_RATE_MS = 1000;

interface Sample {
  timestamp: number;
  caches: Caches;
}

const cacheComponents: Record<
  InternalCache,
  { render: (samples: Sample[]) => JSX.Element; description?: ReactElement }
> = {
  print: {
    render: (samples) => (
      <CacheSize
        samples={samples.map((sample) => ({
          timestamp: sample.timestamp,
          cacheSize: sample.caches.print,
        }))}
      />
    ),
    description: (
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
  },
  parser: {
    render: () => <TODOCacheSize />,
  },
  canonicalStringify: {
    render: () => <TODOCacheSize />,
  },
  links: { render: () => <TODOCacheSize /> },
  ["queryManager.getDocumentInfo"]: {
    render: () => <TODOCacheSize />,
  },
  ["queryManager.documentTransforms"]: {
    render: () => <TODOCacheSize />,
  },
  ["fragmentRegistry.lookup"]: {
    render: () => <TODOCacheSize />,
  },
  ["fragmentRegistry.findFragmentSpreads"]: {
    render: () => <TODOCacheSize />,
  },
  ["fragmentRegistry.transform"]: {
    render: () => <TODOCacheSize />,
  },
  ["cache.fragmentQueryDocuments"]: {
    render: () => <TODOCacheSize />,
  },
  ["addTypenameDocumentTransform"]: {
    render: () => <TODOCacheSize />,
  },
  ["inMemoryCache.executeSelectionSet"]: {
    render: () => <TODOCacheSize />,
  },
  ["inMemoryCache.executeSubSelectedArray"]: {
    render: () => <TODOCacheSize />,
  },
  ["inMemoryCache.maybeBroadcastWatch"]: {
    render: () => <TODOCacheSize />,
  },
};

export function MemoryInternals({ clientId }: MemoryInternalsProps) {
  const [selectedCache, setSelectedCache] = useState<InternalCache>("print");
  const [selectedView, setSelectedView] = useState<"raw" | "chart">("chart");
  const selectedCacheComponent = cacheComponents[selectedCache];
  const [samples, setSamples] = useState<Sample[]>([]);

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

  useInterval(() => {
    if (caches) {
      setSamples((prev) => [...prev, { timestamp: Date.now(), caches }]);
    }
  }, SAMPLE_RATE_MS);

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
          <>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
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
                {selectedCacheComponent.description && (
                  <Tooltip
                    content={
                      <div className="flex flex-col gap-2">
                        {selectedCacheComponent.description}
                      </div>
                    }
                  >
                    <span>
                      <IconInfo className="text-icon-primary dark:text-icon-primary-dark size-4" />
                    </span>
                  </Tooltip>
                )}
              </div>
              <div className="flex gap-6 items-center">
                <StatusBadge color="red" variant="hidden">
                  Recording
                </StatusBadge>
                <Button
                  size="md"
                  variant="secondary"
                  icon={<IconPause />}
                  className="focus:ring-0"
                >
                  Pause
                </Button>
              </div>
            </div>
            {selectedCacheComponent.render(samples)}
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

function CacheSize({
  samples,
}: {
  samples: Array<{ timestamp: number; cacheSize: CacheSize | null }>;
}) {
  const baseTimestamp = samples[0]?.timestamp ?? 0;
  const limit = samples[0]?.cacheSize?.limit ?? 0;

  // Don't redraw every second but instead wait until we have the next batch of
  // samples.
  const throttledLength = Math.floor(samples.length / 5) * 5;

  if (samples.length < 5) {
    return (
      <div className="text-xl size-full flex items-center justify-center">
        <Spinner size="sm" className="mr-2" /> Gathering samples
      </div>
    );
  }

  return (
    <ResponsiveContainer height="100%" width="100%">
      <LineChart
        data={samples.slice(0, throttledLength).map((sample) => ({
          ms: sample.timestamp - baseTimestamp,
          size: sample.cacheSize?.size,
          limit: sample.cacheSize?.limit,
        }))}
      >
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={colors.tokens.flowchart.d.dark}
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor={colors.tokens.flowchart.d.dark}
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="ms"
          stroke={colors.tokens.border.primary.dark}
          label="Time (ms)"
        />
        <YAxis stroke={colors.tokens.border.primary.dark} min={100} />
        <CartesianGrid
          stroke={colors.tokens.border.primary.dark}
          strokeDasharray="3 3"
        />
        <Line
          type="monotone"
          dataKey="size"
          stroke={colors.tokens.border.info.dark}
        />
        {limit > 0 && (
          <ReferenceLine
            y={limit}
            strokeDashoffset="3 3"
            stroke={colors.tokens.border.error.dark}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

function TODOCacheSize() {
  return "TODO: Implement me";
}
