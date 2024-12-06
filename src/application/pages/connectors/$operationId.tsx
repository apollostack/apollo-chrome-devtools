import { Panel, PanelResizeHandle } from "react-resizable-panels";
import { Alert } from "../../components/Alert";
import { SidebarLayout } from "../../components/Layouts/SidebarLayout";
import { connectorsRequestsVar } from "../../vars";
import type { LoaderFunctionArgs } from "react-router-dom";
import {
  Outlet,
  redirect,
  useLoaderData,
  useMatch,
  useNavigate,
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
import { useActorEvent } from "../../hooks/useActorEvent";

export function loader({ params }: LoaderFunctionArgs) {
  const request = connectorsRequestsVar().find(
    (request) => String(request.id) === params.operationId
  );

  if (!request) {
    return redirect("/connectors");
  }

  return { request };
}

export function Route() {
  const { request } = useLoaderData() as Exclude<
    ReturnType<typeof loader>,
    Response
  >;
  const match = useMatch("/connectors/:operationId/requests/:requestId");
  const navigate = useNavigate();

  const selectedRequest = match
    ? request.debuggingResult.data.find(
        (data) => String(data.id) === match.params.requestId
      )
    : null;

  const selectedURL = selectedRequest?.request?.url
    ? new URL(selectedRequest.request.url)
    : null;

  useActorEvent("pageNavigated", () => {
    navigate("/connectors");
  });

  return (
    <>
      <SidebarLayout.Main className="!overflow-auto flex flex-col p-4 gap-4">
        <div className="flex flex-col gap-2">
          <Heading as="h1" size="2xl" className="font-code">
            {request.operationName}
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
        </div>
        {request ? (
          <Outlet context={request} />
        ) : (
          <Alert variant="error">Connectors request not found</Alert>
        )}
      </SidebarLayout.Main>
      <PanelResizeHandle className="border-r border-primary dark:border-primary-dark" />
      <Panel
        id="details"
        defaultSize={25}
        minSize={25}
        className="h-full p-4 overflow-hidden"
      >
        <div className="h-full flex flex-col gap-6 overflow-y-auto">
          <div className="flex flex-col gap-2">
            <h2 className="text-heading dark:text-heading-dark font-medium text-lg">
              Query
            </h2>
            <CodeBlock language="graphql" code={request.query} />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="text-heading dark:text-heading-dark font-medium text-lg">
              Variables
            </h2>
            <JSONTreeViewer
              hideRoot={!isEmpty(request.variables)}
              className="[&>li]:!pt-0"
              data={request.variables ?? {}}
            />
          </div>
        </div>
      </Panel>
    </>
  );
}

export function useRequest() {
  return useOutletContext<ConnectorsDebuggingResultPayloadWithId>();
}
