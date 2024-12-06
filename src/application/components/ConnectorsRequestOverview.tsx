import type { ConnectorsDebuggingRequest } from "../../types";
import { Accordion } from "./Accordion";
import { AccordionContent } from "./AccordionContent";
import { AccordionIcon } from "./AccordionIcon";
import { AccordionItem } from "./AccordionItem";
import { AccordionTitle } from "./AccordionTitle";
import { AccordionTrigger } from "./AccordionTrigger";
import { DefinitionList } from "./DefinitionList";
import { DefinitionListItem } from "./DefinitionListItem";
import { HeadersList } from "./HeadersList";

interface ConnectorsRequestOverviewProps {
  request: ConnectorsDebuggingRequest;
}

export function ConnectorsRequestOverview({
  request,
}: ConnectorsRequestOverviewProps) {
  const { headers } = request;

  return (
    <Accordion type="multiple" defaultValue={["general"]}>
      <AccordionItem value="general">
        <AccordionTrigger>
          <AccordionIcon />
          <AccordionTitle>General</AccordionTitle>
        </AccordionTrigger>
        <AccordionContent>
          <DefinitionList>
            <DefinitionListItem term="URL">{request.url}</DefinitionListItem>
            <DefinitionListItem term="Request method">
              {request.method}
            </DefinitionListItem>
          </DefinitionList>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="headers">
        <AccordionTrigger>
          <AccordionIcon />
          <AccordionTitle>Request headers ({headers.length})</AccordionTitle>
        </AccordionTrigger>
        <AccordionContent>
          {headers.length > 0 ? (
            <HeadersList headers={headers} />
          ) : (
            <div className="italic text-neutral dark:text-neutral-dark text-sm">
              No headers
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
