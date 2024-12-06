import { useRequest } from "../$operationId";
import { ConnectorsTable } from "../../../components/ConnectorsTable";

export function Route() {
  const request = useRequest();

  return (
    <ConnectorsTable
      data={request.debuggingResult.data}
      resultId={request.id}
      columns={["id", "url", "status", "method", "errors"]}
    />
  );
}
