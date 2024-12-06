import { useReactiveVar } from "@apollo/client";
import { EmptyMessage } from "../../components/EmptyMessage";
import { SidebarLayout } from "../../components/Layouts/SidebarLayout";
import { connectorsRequestsVar } from "../../vars";
import { Navigate } from "react-router-dom";
import { ExternalLink } from "../../components/ExternalLink";

export function Route() {
  const connectorsRequests = useReactiveVar(connectorsRequestsVar);

  if (connectorsRequests.length > 0) {
    return <Navigate to={String(connectorsRequests[0].id)} />;
  }

  return (
    <SidebarLayout.Main className="!overflow-auto flex flex-col p-4 gap-4">
      <EmptyMessage className="m-auto mt-20" title="No connectors requests">
        Queries and mutations that include connectors requests will show up
        here. See the{" "}
        <ExternalLink href="https://www.apollographql.com/docs/graphos/schema-design/connectors">
          Apollo connectors docs
        </ExternalLink>{" "}
        for more information on using connectors.
      </EmptyMessage>
    </SidebarLayout.Main>
  );
}
