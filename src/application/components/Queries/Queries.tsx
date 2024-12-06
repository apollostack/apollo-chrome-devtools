import { useMemo, useState } from "react";
import type { TypedDocumentNode } from "@apollo/client";
import { NetworkStatus, gql, useQuery } from "@apollo/client";
import { isNetworkRequestInFlight } from "@apollo/client/core/networkStatus";
import { List } from "../List";
import { ListItem } from "../ListItem";
import IconErrorSolid from "@apollo/icons/default/IconErrorSolid.svg";
import IconTime from "@apollo/icons/default/IconTime.svg";

import { SidebarLayout } from "../Layouts/SidebarLayout";
import { RunInExplorerButton } from "./RunInExplorerButton";
import type { GetQueries, GetQueriesVariables } from "../../types/gql";
import { Tabs } from "../Tabs";
import { JSONTreeViewer } from "../JSONTreeViewer";
import { QueryLayout } from "../QueryLayout";
import { CopyButton } from "../CopyButton";
import { EmptyMessage } from "../EmptyMessage";
import { isEmpty } from "../../utilities/isEmpty";
import { Spinner } from "../Spinner";
import { StatusBadge } from "../StatusBadge";
import { AlertDisclosure } from "../AlertDisclosure";
import { Tooltip } from "../Tooltip";
import { ApolloErrorAlertDisclosurePanel } from "../ApolloErrorAlertDisclosurePanel";
import { useActorEvent } from "../../hooks/useActorEvent";
import { SearchField } from "../SearchField";
import HighlightMatch from "../HighlightMatch";
import { PageSpinner } from "../PageSpinner";
import { isIgnoredError } from "../../utilities/ignoredErrors";
import { Heading } from "../Heading";
import { ExternalLink } from "../ExternalLink";
import { useMatchingConnectors } from "../../hooks/useMatchingConnectors";
import { ConnectorsTable } from "../ConnectorsTable";

enum QueryTabs {
  Variables = "Variables",
  CachedData = "CachedData",
  Options = "Options",
  Connectors = "Connectors",
}

export const GET_QUERIES: TypedDocumentNode<GetQueries, GetQueriesVariables> =
  gql`
    query GetQueries($clientId: ID!) {
      client(id: $clientId) {
        id
        queries {
          items {
            id
            name
            queryString
            variables
            cachedData
            options
            networkStatus
            pollInterval
            error {
              ...ApolloErrorAlertDisclosurePanel_error
            }
          }
        }
      }
    }

    ${ApolloErrorAlertDisclosurePanel.fragments.error}
  `;

interface QueriesProps {
  clientId: string | undefined;
  explorerIFrame: HTMLIFrameElement | null;
}

const STABLE_EMPTY_QUERIES: Array<
  NonNullable<GetQueries["client"]>["queries"]["items"][number]
> = [];

export const Queries = ({ clientId, explorerIFrame }: QueriesProps) => {
  const [selected, setSelected] = useState("1");
  const [searchTerm, setSearchTerm] = useState("");

  const { loading, error, data, startPolling, stopPolling } = useQuery(
    GET_QUERIES,
    {
      variables: { clientId: clientId as string },
      skip: clientId == null,
      pollInterval: 500,
    }
  );

  if (error && !isIgnoredError(error)) {
    throw error;
  }

  const queries = data?.client?.queries.items ?? STABLE_EMPTY_QUERIES;
  const selectedQuery = queries.find((query) => query.id === selected);
  const [currentTab, setCurrentTab] = useState<QueryTabs>(QueryTabs.Variables);
  const copyButtonText = JSON.stringify(
    currentTab === QueryTabs.Variables
      ? selectedQuery?.variables ?? {}
      : selectedQuery?.cachedData ?? {}
  );

  const pollInterval = selectedQuery?.pollInterval;

  useActorEvent("panelHidden", () => stopPolling());
  useActorEvent("panelShown", () => startPolling(500));

  if (!selectedQuery && queries.length > 0) {
    setSelected(queries[0].id);
  }

  const filteredQueries = useMemo(() => {
    if (!searchTerm) {
      return queries;
    }

    const regex = new RegExp(searchTerm, "i");

    return queries.filter((query) => query.name && regex.test(query.name));
  }, [searchTerm, queries]);

  const lastConnectorsRequest = useMatchingConnectors({
    query: selectedQuery?.queryString,
    variables: selectedQuery?.variables,
  }).at(-1);

  return (
    <SidebarLayout>
      <SidebarLayout.Sidebar>
        <SearchField
          className="mb-4"
          placeholder="Search queries"
          onChange={setSearchTerm}
          value={searchTerm}
        />
        <List className="h-full">
          {filteredQueries.map(({ name, id, networkStatus, pollInterval }) => {
            return (
              <ListItem
                key={`${name}-${id}`}
                onClick={() => setSelected(id)}
                selected={selected === id}
                className="font-code"
              >
                <div className="w-full flex items-center justify-between gap-2">
                  <span className="flex-1 overflow-hidden text-ellipsis">
                    {searchTerm && name ? (
                      <HighlightMatch searchTerm={searchTerm} value={name} />
                    ) : (
                      name
                    )}
                  </span>
                  <QueryStatusIcon
                    networkStatus={networkStatus}
                    pollInterval={pollInterval}
                  />
                </div>
              </ListItem>
            );
          })}
        </List>
      </SidebarLayout.Sidebar>
      {loading ? (
        <SidebarLayout.Main>
          <PageSpinner />
        </SidebarLayout.Main>
      ) : (
        <QueryLayout>
          {selectedQuery ? (
            <>
              <QueryLayout.Header>
                <QueryLayout.Title className="flex gap-6 items-center">
                  {selectedQuery.name}
                  {isNetworkRequestInFlight(selectedQuery.networkStatus) &&
                  selectedQuery.networkStatus !== NetworkStatus.poll ? (
                    <>
                      <StatusBadge
                        color="blue"
                        variant="rounded"
                        icon={<Spinner size="xs" />}
                      >
                        {getNetworkStatusLabel(selectedQuery.networkStatus)}
                      </StatusBadge>
                    </>
                  ) : typeof pollInterval === "number" ? (
                    <StatusBadge
                      color={pollInterval === 0 ? "red" : "green"}
                      variant="rounded"
                      icon={
                        selectedQuery.networkStatus === NetworkStatus.poll ? (
                          <Spinner size="xs" />
                        ) : undefined
                      }
                    >
                      {pollInterval === 0 ? (
                        "Stopped polling"
                      ) : (
                        <span>
                          Polling{" "}
                          <span className="text-sm">
                            ({selectedQuery.pollInterval} ms)
                          </span>
                        </span>
                      )}
                    </StatusBadge>
                  ) : null}
                </QueryLayout.Title>
                <RunInExplorerButton
                  operation={selectedQuery.queryString}
                  variables={selectedQuery.variables ?? undefined}
                  embeddedExplorerIFrame={explorerIFrame}
                />
              </QueryLayout.Header>
              <QueryLayout.Content>
                {selectedQuery.error && (
                  <AlertDisclosure className="mb-2" variant="error">
                    <AlertDisclosure.Button>
                      Query completed with errors
                    </AlertDisclosure.Button>
                    <ApolloErrorAlertDisclosurePanel
                      error={selectedQuery.error}
                    />
                  </AlertDisclosure>
                )}
                <QueryLayout.QueryString code={selectedQuery.queryString} />
              </QueryLayout.Content>
            </>
          ) : (
            <EmptyMessage className="m-auto mt-20" />
          )}
          <QueryLayout.Tabs
            value={currentTab}
            onChange={(value) => setCurrentTab(value)}
          >
            <Tabs.List>
              <Tabs.Trigger value={QueryTabs.Variables}>Variables</Tabs.Trigger>
              <Tabs.Trigger value={QueryTabs.CachedData}>
                Cached Data
              </Tabs.Trigger>
              <Tabs.Trigger value={QueryTabs.Options}>Options</Tabs.Trigger>
              <Tabs.Trigger value={QueryTabs.Connectors}>
                Connectors
              </Tabs.Trigger>
              {currentTab !== QueryTabs.Connectors && (
                <CopyButton
                  className="ml-auto relative right-[6px]"
                  size="sm"
                  text={copyButtonText}
                />
              )}
            </Tabs.List>
            <QueryLayout.TabContent value={QueryTabs.Variables}>
              <JSONTreeViewer
                hideRoot={!isEmpty(selectedQuery?.variables)}
                className="[&>li]:!pt-0"
                data={selectedQuery?.variables ?? {}}
              />
            </QueryLayout.TabContent>
            <QueryLayout.TabContent value={QueryTabs.CachedData}>
              <JSONTreeViewer
                hideRoot={!isEmpty(selectedQuery?.cachedData)}
                className="[&>li]:!pt-0"
                data={selectedQuery?.cachedData ?? {}}
              />
            </QueryLayout.TabContent>
            <QueryLayout.TabContent value={QueryTabs.Options}>
              <JSONTreeViewer
                hideRoot={!isEmpty(selectedQuery?.options)}
                className="[&>li]:!pt-0"
                data={selectedQuery?.options ?? {}}
              />
            </QueryLayout.TabContent>
            <QueryLayout.TabContent value={QueryTabs.Connectors}>
              <Heading as="h2" className="mb-4">
                Requests
              </Heading>
              {lastConnectorsRequest ? (
                <ConnectorsTable
                  size="condensed"
                  data={lastConnectorsRequest.debuggingResult.data}
                  resultId={lastConnectorsRequest.id}
                  columns={["method", "status", "url"]}
                />
              ) : (
                <p className="text-placeholder dark:text-placeholder-dark text-sm">
                  No connectors requests for this query. Learn more about Apollo
                  connectors in the{" "}
                  <ExternalLink
                    href="https://www.apollographql.com/docs/graphos/schema-design/connectors"
                    size="sm"
                  >
                    docs
                  </ExternalLink>
                  .
                </p>
              )}
            </QueryLayout.TabContent>
          </QueryLayout.Tabs>
        </QueryLayout>
      )}
    </SidebarLayout>
  );
};

interface QueryStatusIconProps {
  networkStatus: NetworkStatus;
  pollInterval?: number | null;
}

const NETWORK_STATUS_LABELS: Record<NetworkStatus, string> = {
  [NetworkStatus.loading]: "Loading",
  [NetworkStatus.setVariables]: "Changing variables",
  [NetworkStatus.fetchMore]: "Loading next",
  [NetworkStatus.refetch]: "Refetching",
  [NetworkStatus.poll]: "Polling",
  [NetworkStatus.error]: "Error",
  [NetworkStatus.ready]: "Ready",
} as const;

function getNetworkStatusLabel(networkStatus: NetworkStatus) {
  return NETWORK_STATUS_LABELS[networkStatus];
}

const QueryStatusIcon = ({
  networkStatus,
  pollInterval,
}: QueryStatusIconProps) => {
  if (isNetworkRequestInFlight(networkStatus)) {
    return <Spinner size="xs" className="shrink-0" />;
  }

  if (networkStatus === NetworkStatus.error) {
    return (
      <IconErrorSolid className="size-4 text-icon-error dark:text-icon-error-dark shrink-0" />
    );
  }

  if (networkStatus === NetworkStatus.ready && pollInterval) {
    return (
      <Tooltip content={`Polling (${pollInterval} ms)`}>
        <span>
          <IconTime className="size-4 shrink-0" />
        </span>
      </Tooltip>
    );
  }

  return null;
};
