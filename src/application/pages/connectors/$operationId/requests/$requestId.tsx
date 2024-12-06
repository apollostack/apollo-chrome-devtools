import { useParams } from "react-router-dom";
import { useRequest } from "../../$operationId";
import { useMemo } from "react";
import { Tabs } from "../../../../components/Tabs";
import IconStatusDot from "@apollo/icons/default/IconStatusDot.svg";
import { ConnectorsRequestOverview } from "../../../../components/ConnectorsRequestOverview";
import { ConnectorsResponseOverview } from "../../../../components/ConnectorsResponseOverview";
import { ConnectorsBody } from "../../../../components/ConnectorsBody";
import { ConnectorsEmptyState } from "../../../../components/ConnectorsEmptyState";
import { ConnectorsResponseMapping } from "../../../../components/ConnectorsResponseMapping";

export function Route() {
  const params = useParams();
  const request = useRequest();

  const data = useMemo(
    () =>
      request.debuggingResult.data.find(
        ({ id }) => String(id) === params.requestId
      )!,
    [request, params.requestId]
  );

  const response = data.response;
  const selection = data.response?.body.selection;
  const selectionErrorCount = selection?.errors.length ?? 0;

  return (
    <Tabs defaultValue="request" className="flex-1 overflow-hidden">
      <Tabs.List>
        <Tabs.Trigger value="request">Request overview</Tabs.Trigger>
        {!!data.request?.body && (
          <Tabs.Trigger value="requestBody">Request body</Tabs.Trigger>
        )}
        <Tabs.Trigger value="response">Response overview</Tabs.Trigger>
        <Tabs.Trigger value="responseBody">Response body</Tabs.Trigger>
        <Tabs.Trigger value="mapping" className="flex items-center gap-2">
          Mapping
          {selectionErrorCount > 0 && (
            <IconStatusDot className="size-4 text-icon-error dark:text-icon-error-dark" />
          )}
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="request" className="py-4 overflow-auto">
        {data.request ? (
          <ConnectorsRequestOverview request={data.request} />
        ) : (
          <ConnectorsEmptyState>
            No request details to show
          </ConnectorsEmptyState>
        )}
      </Tabs.Content>
      <Tabs.Content value="requestBody" className="py-4 overflow-auto">
        {data.request?.body && <ConnectorsBody body={data.request.body} />}
      </Tabs.Content>
      <Tabs.Content value="response" className="py-4 overflow-auto">
        {data.response ? (
          <ConnectorsResponseOverview response={data.response} />
        ) : (
          <ConnectorsEmptyState>
            No response details to show
          </ConnectorsEmptyState>
        )}
      </Tabs.Content>
      <Tabs.Content value="responseBody" className="py-4 overflow-auto">
        {response?.body ? (
          <ConnectorsBody body={response.body} />
        ) : (
          <ConnectorsEmptyState>No response body to show</ConnectorsEmptyState>
        )}
      </Tabs.Content>
      <Tabs.Content value="mapping" className="py-4 overflow-auto">
        {selection ? (
          <ConnectorsResponseMapping selection={selection} />
        ) : (
          <ConnectorsEmptyState>
            No selection mapping to show
          </ConnectorsEmptyState>
        )}
      </Tabs.Content>
    </Tabs>
  );
}
