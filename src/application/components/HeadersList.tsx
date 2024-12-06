import { DefinitionList } from "./DefinitionList";
import { DefinitionListItem } from "./DefinitionListItem";

interface HeadersListProps {
  headers: Array<[string, string]>;
}

export function HeadersList({ headers }: HeadersListProps) {
  return (
    <DefinitionList>
      {headers.map(([name, value], idx) => (
        <DefinitionListItem
          key={idx}
          term={name}
          className="[&>dt]:whitespace-nowrap"
        >
          {value}
        </DefinitionListItem>
      ))}
    </DefinitionList>
  );
}
