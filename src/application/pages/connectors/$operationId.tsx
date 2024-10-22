import { Panel, PanelResizeHandle } from "react-resizable-panels";
import { Alert } from "../../components/Alert";
import { SidebarLayout } from "../../components/Layouts/SidebarLayout";
import { connectorsRequestsVar } from "../../vars";
import type { LoaderFunctionArgs } from "react-router-dom";
import {
  Outlet,
  useLoaderData,
  useMatch,
  useOutletContext,
} from "react-router-dom";
import { CodeBlock } from "../../components/CodeBlock";
import { JSONTreeViewer } from "../../components/JSONTreeViewer";
import { isEmpty } from "../../utilities/isEmpty";
import type { ConnectorsDebuggingResultPayloadWithId } from "../../../types";
import { Breadcrumb } from "../../components/Breadcrumb";
import { BreadcrumbItem } from "../../components/BreadcrumbItem";
import { Heading } from "../../components/Heading";
import { BreadcrumbLink } from "../../components/BreacrumbLink";

export function loader({ params }: LoaderFunctionArgs) {
  const request = connectorsRequestsVar().find(
    (request) => String(request.id) === params.operationId
  );

  return { request };
}

export function Route() {
  const { request } = useLoaderData() as ReturnType<typeof loader>;
  const match = useMatch("/connectors/:operationId/requests/:requestId");

  if (!request) {
    return (
      <SidebarLayout.Main className="!overflow-auto flex flex-col p-4 gap-4">
        <Heading as="h1" size="2xl">
          Connectors
        </Heading>
        <Breadcrumb>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink to="#">All requests</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        <Alert variant="error">Connectors request not found</Alert>
      </SidebarLayout.Main>
    );
  }

  const selectedRequest = match
    ? request.debuggingResult.data.find(
        (data) => String(data.id) === match.params.requestId
      )
    : null;

  const selectedURL = selectedRequest?.request?.url
    ? new URL(selectedRequest.request.url)
    : null;

  return (
    <>
      <SidebarLayout.Main className="!overflow-auto flex flex-col p-4 gap-4">
        <Heading as="h1" size="2xl">
          Connectors
        </Heading>
        <Breadcrumb>
          <BreadcrumbItem isCurrentPage={!match}>
            <BreadcrumbLink to={`/connectors/${request.id}`}>
              All requests
            </BreadcrumbLink>
          </BreadcrumbItem>
          {selectedURL && (
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink to="#">{selectedURL?.pathname}</BreadcrumbLink>
            </BreadcrumbItem>
          )}
        </Breadcrumb>
        <Outlet context={request} />
      </SidebarLayout.Main>
      <PanelResizeHandle className="border-r border-primary dark:border-primary-dark" />
      <Panel
        id="details"
        defaultSize={25}
        minSize={25}
        className="h-full p-4 flex flex-col gap-2"
      >
        <h2 className="text-heading dark:text-heading-dark font-medium text-lg">
          Query
        </h2>
        <CodeBlock language="graphql" code={request.query} />
        <h2 className="text-heading dark:text-heading-dark font-medium text-lg">
          Variables
        </h2>
        <JSONTreeViewer
          hideRoot={!isEmpty(request.variables)}
          className="[&>li]:!pt-0"
          data={request.variables ?? {}}
        />
      </Panel>
    </>
  );
}

export function useRequest() {
  return useOutletContext<ConnectorsDebuggingResultPayloadWithId>();
}
