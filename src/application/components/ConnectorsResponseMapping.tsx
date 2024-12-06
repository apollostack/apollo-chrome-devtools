import { useState } from "react";
import IconConnectorsResult from "@apollo/icons/small/IconConnectorsResult.svg";
import IconConnectorsSource from "@apollo/icons/small/IconConnectorsSource.svg";
import IconConnectorsTransformation from "@apollo/icons/small/IconConnectorsTransformation.svg";
import IconError from "@apollo/icons/small/IconError.svg";
import type { SelectionMappingResponse } from "../../types";
import { ButtonGroup } from "./ButtonGroup";
import { Tooltip } from "./Tooltip";
import { Button } from "./Button";
import { twMerge } from "tailwind-merge";
import { ConnectorsBody } from "./ConnectorsBody";
import { Card } from "./Card";
import { ConnectorsEmptyState } from "./ConnectorsEmptyState";
import { Table } from "./Table";
import { Tbody } from "./Tbody";
import { Tr } from "./Tr";
import { Td } from "./Td";
import { Thead } from "./Thead";
import { Th } from "./Th";
import { CardBody } from "./CardBody";
import { CodeBlock } from "./CodeBlock";

interface ConnectorsResponseMappingProps {
  selection: SelectionMappingResponse;
  showErrorViewFirst?: boolean;
}

type ActiveView = "source" | "result" | "transformed" | "errors";

export function ConnectorsResponseMapping({
  selection,
  showErrorViewFirst,
}: ConnectorsResponseMappingProps) {
  const [activeView, setActiveView] = useState<ActiveView>(
    showErrorViewFirst ? "errors" : "source"
  );

  return (
    <div className="flex size-full flex-col gap-4">
      <div className="flex justify-between">
        <h2 className="text-heading dark:text-heading-dark text-lg">
          {HEADINGS_MAP[activeView]}
        </h2>
        <ButtonGroup attached>
          <Tooltip content="View original selection">
            <Button
              aria-label="View original selection"
              icon={<IconConnectorsSource className="size-4" />}
              size="sm"
              variant={activeView === "source" ? "primary" : "secondary"}
              onClick={() => setActiveView("source")}
            />
          </Tooltip>
          <Tooltip content="View runtime selection">
            <Button
              aria-label="View runtime selection"
              icon={<IconConnectorsTransformation className="size-4" />}
              size="sm"
              variant={activeView === "transformed" ? "primary" : "secondary"}
              onClick={() => setActiveView("transformed")}
            />
          </Tooltip>
          <Tooltip content="View result">
            <Button
              aria-label="View result"
              icon={<IconConnectorsResult className="size-4" />}
              size="sm"
              variant={activeView === "result" ? "primary" : "secondary"}
              onClick={() => setActiveView("result")}
            />
          </Tooltip>
          <Tooltip content="View errors">
            <Button
              size="sm"
              variant={
                activeView === "errors"
                  ? selection.errors.length
                    ? "destructive"
                    : "primary"
                  : "secondary"
              }
              onClick={() => setActiveView("errors")}
              icon={
                <IconError
                  className={twMerge(
                    "size-4",
                    activeView !== "errors" &&
                      selection.errors.length &&
                      "text-icon-error dark:text-icon-error-dark"
                  )}
                />
              }
            >
              {selection.errors.length}
            </Button>
          </Tooltip>
        </ButtonGroup>
      </div>
      {activeView === "errors" ? (
        <ErrorsView errors={selection.errors} />
      ) : activeView === "source" ? (
        <Selection source={selection.source} />
      ) : activeView === "transformed" ? (
        <Selection source={selection.transformed} />
      ) : (
        <ConnectorsBody body={{ content: selection.result, kind: "json" }} />
      )}
    </div>
  );
}

function Selection({ source }: { source: string }) {
  return <CodeBlock code={source} language="text" copyable={false} />;
}

function ErrorsView({
  errors,
}: {
  errors: SelectionMappingResponse["errors"];
}) {
  return errors.length ? (
    <Card>
      <CardBody>
        <Table size="condensed" variant="striped">
          <Thead>
            <Th>Message</Th>
            <Th>Path</Th>
            <Th numeric>Count</Th>
          </Thead>
          <Tbody>
            {errors.map((error, idx) => (
              <Tr key={idx}>
                <Td>{error.message}</Td>
                <Td>
                  <span className="font-code">{error.path}</span>
                </Td>
                <Td numeric>{error.count}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </CardBody>
    </Card>
  ) : (
    <ConnectorsEmptyState>No errors to display</ConnectorsEmptyState>
  );
}

const HEADINGS_MAP: Record<ActiveView, string> = {
  errors: "Errors",
  result: "Result",
  source: "Original selection",
  transformed: "Runtime selection",
};
