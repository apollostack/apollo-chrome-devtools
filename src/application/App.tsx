import { Suspense, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { TypedDocumentNode } from "@apollo/client";
import { gql, useQuery } from "@apollo/client";
import { useMachine } from "@xstate/react";
import { ErrorBoundary } from "react-error-boundary";

import { Queries } from "./components/Queries/Queries";
import { Mutations } from "./components/Mutations/Mutations";
import { Explorer } from "./components/Explorer/Explorer";
import { Cache } from "./components/Cache/Cache";
import type {
  AppQuery,
  AppQueryVariables,
  ClientQuery,
  ClientQueryVariables,
} from "./types/gql";
import { Tabs } from "./components/Tabs";
import { Button } from "./components/Button";
import IconSettings from "@apollo/icons/default/IconSettings.svg";
import IconGitHubSolid from "@apollo/icons/small/IconGitHubSolid.svg";
import { SettingsModal } from "./components/Layouts/SettingsModal";
import Logo from "@apollo/icons/logos/LogoSymbol.svg";
import { BannerAlert } from "./components/BannerAlert";
import { devtoolsMachine } from "./machines/devtoolsMachine";
import { ClientNotFoundModal } from "./components/ClientNotFoundModal";
import { ButtonGroup } from "./components/ButtonGroup";
import {
  GitHubIssueLink,
  LABELS,
  SECTIONS,
} from "./components/GitHubIssueLink";
import { Tooltip } from "./components/Tooltip";
import { Badge } from "./components/Badge";
import { GitHubReleaseHoverCard } from "./components/GitHubReleaseHoverCard";
import { isSnapshotRelease, parseSnapshotRelease } from "./utilities/github";
import { Select } from "./components/Select";
import { Divider } from "./components/Divider";
import { useActorEvent } from "./hooks/useActorEvent";
import { removeClient } from ".";
import { PageError } from "./components/PageError";
import { SidebarLayout } from "./components/Layouts/SidebarLayout";
import { Outlet, useMatches, useNavigate } from "react-router-dom";
import { PageSpinner } from "./components/PageSpinner";

const APP_QUERY: TypedDocumentNode<AppQuery, AppQueryVariables> = gql`
  query AppQuery {
    clients {
      id
      name
    }
  }
`;

const CLIENT_QUERY: TypedDocumentNode<ClientQuery, ClientQueryVariables> = gql`
  query ClientQuery($id: ID!) {
    client(id: $id) {
      id
      version
      queries {
        total
      }
      mutations {
        total
      }
    }
  }
`;

const ISSUE_BODY = `
${SECTIONS.defaultDescription}
${SECTIONS.reproduction}
${SECTIONS.apolloClientVersion}
${SECTIONS.devtoolsVersion}
`;

const stableEmptyClients: Required<AppQuery["clients"]> = [];
const noop = () => {};

export const App = () => {
  const [snapshot, send] = useMachine(
    devtoolsMachine.provide({
      actions: {
        resetStore: () => {
          apolloClient.clearStore().catch(noop);
        },
      },
    })
  );
  const {
    data,
    client: apolloClient,
    refetch,
  } = useQuery(APP_QUERY, { errorPolicy: "all" });

  useActorEvent("registerClient", () => {
    send({ type: "connect" });
    // Unfortunately after we clear the store above, the query ends up "stuck"
    // holding onto the old list of clients even if we manually write a cache
    // update to properly resolve the list. Instead we refetch the list again to
    // force the query to reload to ensure its in sync with the latest values.
    refetch();
  });

  useActorEvent("clientTerminated", (message) => {
    // Disconnect if we are terminating the last client. We assume that 1 client
    // means we are terminating the selected client
    if (clients.length === 1) {
      send({ type: "disconnect" });
    }

    removeClient(message.clientId);
  });

  useActorEvent("pageNavigated", () => {
    send({ type: "disconnect" });
  });

  const navigate = useNavigate();
  const matches = useMatches();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(
    data?.clients[0]?.id
  );
  const [embeddedExplorerIFrame, setEmbeddedExplorerIFrame] =
    useState<HTMLIFrameElement | null>(null);

  const {
    data: clientData,
    startPolling,
    stopPolling,
  } = useQuery(CLIENT_QUERY, {
    variables: { id: selectedClientId as string },
    skip: !selectedClientId,
    pollInterval: 500,
  });

  const client = clientData?.client;
  const clients = data?.clients ?? stableEmptyClients;
  const clientIds = clients.map((c) => c.id);

  useActorEvent("panelHidden", () => stopPolling());
  useActorEvent("panelShown", () => startPolling(500));

  if (
    (selectedClientId && !clientIds.includes(selectedClientId)) ||
    (!selectedClientId && clientIds.length > 0)
  ) {
    setSelectedClientId(clientIds[0]);
  }

  useEffect(() => {
    if (clients.length) {
      send({ type: "connect" });
    }
  }, [send, clients.length]);

  // The 0 index is always the root route and the selected tab is index 1.
  const tab = matches[1];

  return (
    <>
      <SettingsModal open={settingsOpen} onOpen={setSettingsOpen} />
      <ClientNotFoundModal
        open={snapshot.context.modalOpen}
        onClose={() => send({ type: "closeModal" })}
        onRetry={() => send({ type: "retry" })}
      />
      <BannerAlert />
      <Tabs
        value={tab?.pathname ?? "/queries"}
        onChange={navigate}
        className="flex flex-col h-screen bg-primary dark:bg-primary-dark"
      >
        <div className="flex items-center border-b border-b-primary dark:border-b-primary-dark gap-4 px-4">
          <a
            href="https://go.apollo.dev/c/docs"
            target="_blank"
            title="Apollo Client developer documentation"
            className="block"
            rel="noreferrer"
          >
            <Logo
              role="img"
              width="24"
              height="24"
              fill="currentColor"
              className="text-icon-primary dark:text-icon-primary-dark"
            />
          </a>
          <Divider orientation="vertical" />
          <Tabs.List className="-mb-px">
            <Tabs.Trigger value="/queries">
              Queries ({client?.queries.total ?? 0})
            </Tabs.Trigger>
            <Tabs.Trigger value="/mutations">
              Mutations ({client?.mutations.total ?? 0})
            </Tabs.Trigger>
            <Tabs.Trigger value="/cache">Cache</Tabs.Trigger>
            <Tabs.Trigger value="/connectors">Connectors</Tabs.Trigger>
            <Tabs.Trigger value="/explorer">Explorer</Tabs.Trigger>
          </Tabs.List>
          <div className="ml-auto flex-1 justify-end flex items-center gap-2 h-full">
            {client?.version && (
              <GitHubReleaseHoverCard version={client.version}>
                <a
                  className="no-underline"
                  href={
                    isSnapshotRelease(client.version)
                      ? `https://github.com/apollographql/apollo-client/pull/${parseSnapshotRelease(client.version).prNumber}`
                      : `https://github.com/apollographql/apollo-client/releases/tag/v${client.version}`
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  <Badge variant="info" className="cursor-pointer">
                    Apollo Client <span className="lowercase">v</span>
                    {client.version}
                  </Badge>
                </a>
              </GitHubReleaseHoverCard>
            )}
            {clients.length > 1 && (
              <Select
                size="sm"
                className="w-60 ml-2"
                value={selectedClientId}
                onValueChange={setSelectedClientId}
              >
                {clients.map((client) => (
                  <Select.Option key={client.id} value={client.id}>
                    {client.name ?? `Apollo client ${client.id}`}
                  </Select.Option>
                ))}
              </Select>
            )}
            <Divider orientation="vertical" className="mx-2" />
            <ButtonGroup>
              <Tooltip content="Report an issue">
                <Button
                  aria-label="Report an issue"
                  variant="hidden"
                  size="sm"
                  icon={<IconGitHubSolid />}
                  asChild
                >
                  <GitHubIssueLink labels={[LABELS.bug]} body={ISSUE_BODY} />
                </Button>
              </Tooltip>

              <Tooltip content="Settings">
                <Button
                  aria-label="Settings"
                  size="sm"
                  variant="hidden"
                  onClick={() => setSettingsOpen(true)}
                  icon={<IconSettings />}
                />
              </Tooltip>
            </ButtonGroup>
          </div>
        </div>
        {/**
         * We need to keep the iframe inside of the `Explorer` loaded at all times
         * so that we don't reload the iframe when we come to this tab
         */}
        <Tabs.Content
          className="flex flex-col flex-1"
          value="/explorer"
          forceMount
        >
          <Explorer
            clientId={selectedClientId}
            isVisible={tab?.pathname === "/explorer"}
            embeddedExplorerProps={{
              embeddedExplorerIFrame,
              setEmbeddedExplorerIFrame,
            }}
          />
        </Tabs.Content>
        <Tabs.Content className="flex-1 overflow-hidden" value="/queries">
          <TabErrorBoundary remarks="Error on Queries tab:">
            <Queries
              clientId={selectedClientId}
              explorerIFrame={embeddedExplorerIFrame}
            />
          </TabErrorBoundary>
        </Tabs.Content>
        <Tabs.Content className="flex-1 overflow-hidden" value="/mutations">
          <TabErrorBoundary remarks="Error on Mutations tab:">
            <Mutations
              clientId={selectedClientId}
              explorerIFrame={embeddedExplorerIFrame}
            />
          </TabErrorBoundary>
        </Tabs.Content>
        <Tabs.Content className="flex-1 overflow-hidden" value="/connectors">
          <TabErrorBoundary remarks="Error on Connectors tab:">
            <Suspense fallback={<PageSpinner />}>
              <Outlet />
            </Suspense>
          </TabErrorBoundary>
        </Tabs.Content>
        <Tabs.Content className="flex-1 overflow-hidden" value="/cache">
          <TabErrorBoundary remarks="Error on Cache tab:">
            <Cache clientId={selectedClientId} />
          </TabErrorBoundary>
        </Tabs.Content>
      </Tabs>
    </>
  );
};

interface TabErrorBoundaryProps {
  children?: ReactNode;
  remarks?: string;
}

function TabErrorBoundary({ children, remarks }: TabErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => {
        return (
          <SidebarLayout>
            <SidebarLayout.Main className="!overflow-y-auto">
              <PageError>
                <PageError.Content>
                  <PageError.Title>
                    We&apos;ve run into an unexpected error
                  </PageError.Title>
                  <PageError.Body>
                    Please try closing and reopening the browser devtools and
                    refreshing the page. If the issue persists, please{" "}
                    <PageError.GitHubLink error={error} remarks={remarks}>
                      open an issue
                    </PageError.GitHubLink>{" "}
                    to help us diagnose the error.
                  </PageError.Body>
                </PageError.Content>
                <PageError.Details error={error} />
              </PageError>
            </SidebarLayout.Main>
          </SidebarLayout>
        );
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
