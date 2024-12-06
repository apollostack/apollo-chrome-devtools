import IconInfo from "@apollo/icons/default/IconInfo.svg";
import type { ConnectorsDebuggingDataWithId } from "../../types";
import { Card } from "./Card";
import { CardBody } from "./CardBody";
import { Table } from "./Table";
import { Th } from "./Th";
import { Thead } from "./Thead";
import { Tooltip } from "./Tooltip";
import { Tr } from "./Tr";
import { Tbody } from "./Tbody";
import { Td } from "./Td";
import { HTTPStatusBadge } from "./HTTPStatusBadge";
import { useNavigate } from "react-router-dom";
import { Fragment } from "react";

interface ConnectorsTableProps {
  data: ConnectorsDebuggingDataWithId[];
  resultId: number;
  columns: ColumnName[];
  size?: "default" | "condensed";
}

type ColumnName = "id" | "url" | "status" | "method" | "errors";

export function ConnectorsTable({
  data,
  resultId,
  columns,
  size,
}: ConnectorsTableProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardBody>
        <Table interactive variant="striped" size={size}>
          <Thead>
            <Tr>
              {columns.map((col) => {
                return (
                  <Fragment key={col}>
                    {col === "id" && <Th>ID</Th>}
                    {col === "url" && <Th>URL</Th>}
                    {col === "status" && <Th>Status</Th>}
                    {col === "method" && <Th>Method</Th>}
                    {col === "errors" && (
                      <Th numeric>
                        <div className="flex gap-2 items-center justify-end">
                          Errors{" "}
                          <Tooltip content="Total mapping errors">
                            <span>
                              <IconInfo className="size-3" />
                            </span>
                          </Tooltip>
                        </div>
                      </Th>
                    )}
                  </Fragment>
                );
              })}
            </Tr>
          </Thead>
          <Tbody>
            {data.map(({ id, request, response }) => {
              return (
                <Tr
                  key={id}
                  onClick={() =>
                    navigate(`/connectors/${resultId}/requests/${id}`)
                  }
                >
                  {columns.map((col) => {
                    return (
                      <Fragment key={col}>
                        {col === "id" && <Td>{id}</Td>}
                        {col === "url" && (
                          <Td className="whitespace-nowrap">{request?.url}</Td>
                        )}
                        {col === "status" && (
                          <Td>
                            <HTTPStatusBadge
                              status={response?.status}
                              variant="terse"
                            />
                          </Td>
                        )}
                        {col === "method" && <Td>{request?.method}</Td>}
                        {col === "errors" && (
                          <Td numeric>
                            {response?.body?.selection?.errors?.length ?? 0}
                          </Td>
                        )}
                      </Fragment>
                    );
                  })}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  );
}
