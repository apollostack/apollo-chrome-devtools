import { useMemo, useState } from "react";
import type { TypedDocumentNode } from "@apollo/client";
import { gql, useQuery } from "@apollo/client";
import { List } from "../List";
import { ListItem } from "../ListItem";
import IconErrorSolid from "@apollo/icons/default/IconErrorSolid.svg";

import { SidebarLayout } from "../Layouts/SidebarLayout";
import { RunInExplorerButton } from "../Queries/RunInExplorerButton";
import type { GetMutations, GetMutationsVariables } from "../../types/gql";
import { JSONTreeViewer } from "../JSONTreeViewer";
import { Tabs } from "../Tabs";
import { QueryLayout } from "../QueryLayout";
import { CopyButton } from "../CopyButton";
import { EmptyMessage } from "../EmptyMessage";
import { isEmpty } from "../../utilities/isEmpty";
import { Spinner } from "../Spinner";
import { StatusBadge } from "../StatusBadge";
import { AlertDisclosure } from "../AlertDisclosure";
import { SerializedErrorAlertDisclosureItem } from "../SerializedErrorAlertDisclosureItem";
import { ApolloErrorAlertDisclosurePanel } from "../ApolloErrorAlertDisclosurePanel";
import { useActorEvent } from "../../hooks/useActorEvent";
import { SearchField } from "../SearchField";
import HighlightMatch from "../HighlightMatch";
import { PageSpinner } from "../PageSpinner";
import { isIgnoredError } from "../../utilities/ignoredErrors";
import { useMatchingConnectors } from "../../hooks/useMatchingConnectors";
import { Heading } from "../Heading";
import { ConnectorsTable } from "../ConnectorsTable";
import { ExternalLink } from "../ExternalLink";

const GET_MUTATIONS: TypedDocumentNode<GetMutations, GetMutationsVariables> =
  gql`
    query GetMutations($id: ID!) {
      client(id: $id) {
        id
        mutations {
          total
          items {
            id
            name
            mutationString
            variables
            loading
            error {
              ... on SerializedError {
                ...SerializedErrorAlertDisclosureItem_error
              }
              ... on SerializedApolloError {
                ...ApolloErrorAlertDisclosurePanel_error
              }
            }
          }
        }
      }
    }

    ${ApolloErrorAlertDisclosurePanel.fragments.error}
    ${SerializedErrorAlertDisclosureItem.fragments.error}
  `;

interface MutationsProps {
  clientId: string | undefined;
  explorerIFrame: HTMLIFrameElement | null;
}

const STABLE_EMPTY_MUTATIONS: Array<
  NonNullable<GetMutations["client"]>["mutations"]["items"][number]
> = [];

export const Mutations = ({ clientId, explorerIFrame }: MutationsProps) => {
  const [selected, setSelected] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, error, loading, startPolling, stopPolling } = useQuery(
    GET_MUTATIONS,
    {
      variables: { id: clientId as string },
      skip: clientId == null,
      pollInterval: 500,
    }
  );

  if (error && !isIgnoredError(error)) {
    throw error;
  }

  useActorEvent("panelHidden", () => stopPolling());
  useActorEvent("panelShown", () => startPolling(500));

  const mutations = data?.client?.mutations?.items ?? STABLE_EMPTY_MUTATIONS;
  const selectedMutation = mutations.find(
    (mutation) => Number(mutation.id) === selected
  );

  if (!selectedMutation && mutations.length > 0) {
    setSelected(0);
  }

  const filteredMutations = useMemo(() => {
    if (!searchTerm) {
      return mutations;
    }
    const regex = new RegExp(searchTerm, "i");

    return mutations.filter(({ name }) => name && regex.test(name));
  }, [searchTerm, mutations]);

  const lastConnectorsRequest = useMatchingConnectors({
    query: selectedMutation?.mutationString,
    variables: selectedMutation?.variables,
  }).at(-1);

  return (
    <SidebarLayout>
      <SidebarLayout.Sidebar>
        <SearchField
          className="mb-4"
          placeholder="Search mutations"
          onChange={setSearchTerm}
          value={searchTerm}
        />
        <List className="h-full">
          {filteredMutations.map(({ name, id, loading, error }) => {
            return (
              <ListItem
                key={`${name}-${id}`}
                className="font-code"
                onClick={() => setSelected(Number(id))}
                selected={selected === Number(id)}
              >
                <div className="w-full flex items-center justify-between gap-2">
                  <span className="flex-1 overflow-hidden text-ellipsis">
                    {searchTerm && name ? (
                      <HighlightMatch searchTerm={searchTerm} value={name} />
                    ) : (
                      name
                    )}
                  </span>
                  {loading ? (
                    <Spinner size="xs" className="shrink-0" />
                  ) : error ? (
                    <IconErrorSolid className="size-4 text-icon-error dark:text-icon-error-dark" />
                  ) : null}
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
          {selectedMutation ? (
            <>
              <QueryLayout.Header>
                <QueryLayout.Title className="flex gap-6 items-center">
                  {selectedMutation.name}
                  {selectedMutation.loading ? (
                    <StatusBadge
                      color="blue"
                      variant="rounded"
                      icon={<Spinner size="xs" />}
                    >
                      Loading
                    </StatusBadge>
                  ) : null}
                </QueryLayout.Title>
                <RunInExplorerButton
                  operation={selectedMutation.mutationString}
                  variables={selectedMutation.variables ?? undefined}
                  embeddedExplorerIFrame={explorerIFrame}
                />
              </QueryLayout.Header>
              <QueryLayout.Content>
                {selectedMutation.error && (
                  <AlertDisclosure className="mb-2" variant="error">
                    <AlertDisclosure.Button>
                      Mutation completed with errors
                    </AlertDisclosure.Button>
                    {selectedMutation.error.__typename ===
                    "SerializedApolloError" ? (
                      <ApolloErrorAlertDisclosurePanel
                        error={selectedMutation.error}
                      />
                    ) : (
                      <AlertDisclosure.Panel>
                        <ul>
                          <SerializedErrorAlertDisclosureItem
                            error={selectedMutation.error}
                          />
                        </ul>
                      </AlertDisclosure.Panel>
                    )}
                  </AlertDisclosure>
                )}
                <QueryLayout.QueryString
                  code={selectedMutation.mutationString}
                />
              </QueryLayout.Content>
            </>
          ) : (
            <EmptyMessage className="m-auto mt-20" />
          )}
          <QueryLayout.Tabs defaultValue="variables">
            <Tabs.List>
              <Tabs.Trigger value="variables">Variables</Tabs.Trigger>
              <Tabs.Trigger value="connectors">Connectors</Tabs.Trigger>
              <CopyButton
                text={JSON.stringify(selectedMutation?.variables ?? {})}
                size="sm"
                className="ml-auto relative right-[6px]"
              />
            </Tabs.List>
            <QueryLayout.TabContent value="variables">
              <JSONTreeViewer
                hideRoot={!isEmpty(selectedMutation?.variables)}
                className="[&>li]:!pt-0"
                data={selectedMutation?.variables ?? {}}
              />
            </QueryLayout.TabContent>
            <QueryLayout.TabContent value="connectors">
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
                  No connectors requests for this mutation. Learn more about
                  Apollo connectors in the{" "}
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
