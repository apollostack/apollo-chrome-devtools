import type { TypedDocumentNode } from "@apollo/client";
import { gql, useQuery } from "@apollo/client";
import IconOutlink from "@apollo/icons/default/IconOutlink.svg";

import { FullWidthLayout } from "./Layouts/FullWidthLayout";
import { PageSpinner } from "./PageSpinner";
import type {
  MemoryInternalsQuery,
  MemoryInternalsQueryVariables,
} from "../types/gql";
import { Select } from "./Select";
import { useState } from "react";

interface MemoryInternalsProps {
  clientId: string | undefined;
}

const MEMORY_INTERNALS_QUERY: TypedDocumentNode<
  MemoryInternalsQuery,
  MemoryInternalsQueryVariables
> = gql`
  query MemoryInternalsQuery($clientId: ID!) {
    client(id: $clientId) {
      id
      memoryInternals {
        caches {
          print {
            ...CacheSizeFields
          }
          parser {
            ...CacheSizeFields
          }
          canonicalStringify {
            ...CacheSizeFields
          }
          links {
            ... on PersistedQueryLinkCacheSizes {
              persistedQueryHashes {
                ...CacheSizeFields
              }
            }
            ... on RemoveTypenameFromVariablesLinkCacheSizes {
              getVariableDefinitions {
                ...CacheSizeFields
              }
            }
          }
          queryManager {
            getDocumentInfo {
              ...CacheSizeFields
            }
            documentTransforms {
              cache {
                ...CacheSizeFields
              }
            }
          }
          fragmentRegistry {
            lookup {
              ...CacheSizeFields
            }
            findFragmentSpreads {
              ...CacheSizeFields
            }
            transform {
              ...CacheSizeFields
            }
          }
          cache {
            fragmentQueryDocuments {
              ...CacheSizeFields
            }
          }
          addTypenameDocumentTransform {
            cache {
              ...CacheSizeFields
            }
          }
          inMemoryCache {
            maybeBroadcastWatch {
              ...CacheSizeFields
            }
            executeSelectionSet {
              ...CacheSizeFields
            }
            executeSubSelectedArray {
              ...CacheSizeFields
            }
          }
        }
      }
    }
  }

  fragment CacheSizeFields on CacheSize {
    size
    limit
  }
`;

export function MemoryInternals({ clientId }: MemoryInternalsProps) {
  const [selectedCache, setSelectedCache] = useState("print");
  const { data, loading, error } = useQuery(MEMORY_INTERNALS_QUERY, {
    variables: { clientId: clientId as string },
    skip: !clientId,
    pollInterval: 500,
  });

  if (error) {
    throw error;
  }

  return (
    <FullWidthLayout className="p-4 gap-4">
      <header>
        <h1 className="font-medium text-2xl text-heading dark:text-heading-dark">
          Memory
        </h1>
        <p className="text-secondary dark:text-secondary-dark">
          Learn how Apollo Client manages memory and how to set custom cache
          size limits in the{" "}
          <a
            href="https://www.apollographql.com/docs/react/caching/memory-management/"
            className="font-medium underline inline-flex items-center gap-2"
            target="_blank"
            rel="noopener noreferer noreferrer"
          >
            docs
            <IconOutlink className="size-4" />
          </a>
          .
        </p>
      </header>
      <FullWidthLayout.Main className="overflow-auto">
        {loading ? (
          <PageSpinner />
        ) : (
          <>
            <Select
              defaultValue="print"
              value={selectedCache}
              onValueChange={setSelectedCache}
            >
              <SelectOption label="print" />
              <SelectOption label="parser" />
              <SelectOption label="canonicalStringify" />
              <SelectOption label="links" />
              <SelectOption label="queryManager.getDocumentInfo" />
              <SelectOption label="queryManager.documentTransforms" />
              <SelectOption label="fragmentRegistry.lookup" />
              <SelectOption label="fragmentRegistry.findFragmentSpreads" />
              <SelectOption label="fragmentRegistry.transform" />
              <SelectOption label="cache.fragmentQueryDocuments" />
              <SelectOption label="addTypenameDocumentTransform" />
              <SelectOption label="inMemoryCache.executeSelectionSet" />
              <SelectOption label="inMemoryCache.executeSubSelectedArray" />
              <SelectOption label="inMemoryCache.maybeBroadcastWatch" />
            </Select>
          </>
        )}
      </FullWidthLayout.Main>
    </FullWidthLayout>
  );
}

function SelectOption({ label }: { label: string }) {
  return (
    <Select.Option value={label}>
      <span className="font-code">{label}</span>
    </Select.Option>
  );
}
