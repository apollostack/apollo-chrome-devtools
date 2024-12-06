import type { ConnectorsDebuggingResponse } from "../../types";
import { Accordion } from "./Accordion";
import { AccordionContent } from "./AccordionContent";
import { AccordionIcon } from "./AccordionIcon";
import { AccordionItem } from "./AccordionItem";
import { AccordionTitle } from "./AccordionTitle";
import { AccordionTrigger } from "./AccordionTrigger";
import { DefinitionList } from "./DefinitionList";
import { DefinitionListItem } from "./DefinitionListItem";
import { HeadersList } from "./HeadersList";
import { HTTPStatusBadge } from "./HTTPStatusBadge";

interface ConnectorsResponseOverviewProps {
  response: ConnectorsDebuggingResponse;
}

export function ConnectorsResponseOverview({
  response,
}: ConnectorsResponseOverviewProps) {
  console.log(response.headers);
  return (
    <Accordion type="multiple" defaultValue={["general"]}>
      <AccordionItem value="general">
        <AccordionTrigger>
          <AccordionIcon />
          <AccordionTitle>General</AccordionTitle>
        </AccordionTrigger>
        <AccordionContent>
          <DefinitionList>
            <DefinitionListItem term="Status code">
              <HTTPStatusBadge status={response.status} variant="full" />
            </DefinitionListItem>
          </DefinitionList>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="headers">
        <AccordionTrigger>
          <AccordionIcon />
          <AccordionTitle>
            Response headers ({response.headers.length})
          </AccordionTitle>
        </AccordionTrigger>
        <AccordionContent>
          {response.headers.length > 0 ? (
            <HeadersList headers={response.headers} />
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
