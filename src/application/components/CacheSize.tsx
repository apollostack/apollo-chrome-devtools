import type { ReactNode } from "react";
import IconOutlink from "@apollo/icons/small/IconOutlink.svg";
import IconInfo from "@apollo/icons/default/IconInfo.svg";
import IconWarning from "@apollo/icons/large/IconWarning.svg";
import { ExternalLink } from "./ExternalLink";
import { Tooltip } from "./Tooltip";
import type { CacheSizes } from "@apollo/client/utilities";
import type { CacheSize as CacheSizeType } from "../types/gql";
import clsx from "clsx";

const DESCRIPTIONS: Record<keyof CacheSizes, ReactNode> = {
  print: (
    <>
      <p>
        Cache size for the{" "}
        <ExternalLink
          href="https://github.com/apollographql/apollo-client/blob/main/src/utilities/graphql/print.ts"
          className="inline-flex items-center gap-1"
        >
          <code>print</code> <IconOutlink className="size-3" />
        </ExternalLink>{" "}
        function.
      </p>
      <p>
        It is called with transformed <code>DocumentNode</code>s.
      </p>
      <p>
        This method is called to transform a GraphQL query AST parsed by{" "}
        <code>gql</code> back into a GraphQL string.
      </p>
    </>
  ),
  parser: (
    <>
      <p>
        Cache size for the{" "}
        <ExternalLink
          href="https://github.com/apollographql/apollo-client/blob/main/src/react/parser/index.ts"
          className="inline-flex items-center gap-1"
        >
          <code>parser</code> <IconOutlink className="size-3" />
        </ExternalLink>{" "}
        function.
      </p>
      <p>
        It is called with user-provided <code>DocumentNode</code>s.
      </p>
    </>
  ),
  canonicalStringify: (
    <p>
      Cache used by{" "}
      <ExternalLink
        href="https://github.com/apollographql/apollo-client/blob/main/src/utilities/common/canonicalStringify.ts"
        className="inline-flex items-center gap-1"
      >
        <code>canonicalStringify</code> <IconOutlink className="size-3" />
      </ExternalLink>
    </p>
  ),
  "PersistedQueryLink.persistedQueryHashes": (
    <>
      <p>
        A cache inside of
        <ExternalLink href="https://github.com/apollographql/apollo-client/blob/main/src/link/persisted-queries/index.ts">
          <code>PersistedQueryLink</code>
        </ExternalLink>
        .
      </p>

      <p>
        It is called with transformed <code>DocumentNode</code>s.
      </p>
    </>
  ),
  "removeTypenameFromVariables.getVariableDefinitions": "",
  "queryManager.getDocumentInfo": (
    <>
      <p>
        A cache inside of{" "}
        <ExternalLink
          href="https://github.com/apollographql/apollo-client/blob/main/src/core/QueryManager.ts"
          className="inline-flex items-center gap-1"
        >
          <code>QueryManager</code>
          <IconOutlink className="size-3" />
        </ExternalLink>
        .
      </p>
      <p>It is called with transformed `DocumentNode`s.</p>
    </>
  ),
  "documentTransform.cache": "",
  "fragmentRegistry.lookup": "",
  "fragmentRegistry.findFragmentSpreads": "",
  "fragmentRegistry.transform": (
    <>
      <p>
        A cache inside of
        <ExternalLink href="https://github.com/apollographql/apollo-client/blob/main/src/cache/inmemory/fragmentRegistry.ts">
          <code>FragmentRegistry</code>
        </ExternalLink>
        .
      </p>

      <p>
        Can be called with user-defined or already-transformed{" "}
        <code>DocumentNode</code>s.
      </p>
    </>
  ),
  "cache.fragmentQueryDocuments": "",
  "inMemoryCache.executeSelectionSet": "",
  "inMemoryCache.executeSubSelectedArray": "",
  "inMemoryCache.maybeBroadcastWatch": "",
};

export function CacheSize({ cacheSize }: { cacheSize: CacheSizeType }) {
  if (cacheSize.size === null || cacheSize.limit === null) {
    return null;
  }

  const description = DESCRIPTIONS[cacheSize.key as keyof CacheSizes];
  const percentUsed = (cacheSize.size / cacheSize.limit) * 100;

  return (
    <div className="border border-primary dark:border-primary-dark rounded p-4 flex flex-col gap-4 min-w-[300px]">
      <h2 className="text-heading dark:text-heading-dark text-sm font-code flex gap-2 items-center">
        <code>{cacheSize.key}</code>
        {description && (
          <Tooltip
            content={<div className="flex flex-col gap-2">{description}</div>}
          >
            <span>
              <IconInfo className="text-icon-primary dark:text-icon-primary-dark size-4" />
            </span>
          </Tooltip>
        )}
      </h2>
      <div className="flex gap-6 items-end">
        <div className="flex flex-col gap-3">
          <span className="uppercase text-secondary dark:text-secondary-dark text-xs font-bold">
            Size
          </span>
          <span className="font-code">{cacheSize.size}</span>
        </div>
        <div className="flex flex-col gap-3">
          <span className="uppercase text-secondary dark:text-secondary-dark text-xs font-bold">
            Limit
          </span>
          <span className="font-code">{cacheSize.limit}</span>
        </div>
        <div
          className={clsx(
            "text-3xl text-right flex-1 font-code flex gap-2 items-center justify-end",
            {
              "text-error dark:text-error-dark": percentUsed >= 90,
              "text-warning dark:text-warning-dark":
                percentUsed >= 70 && percentUsed < 90,
            }
          )}
        >
          {percentUsed > 70 ? (
            <IconWarning className="text-current size-6" />
          ) : null}
          {percentUsed < 1 ? percentUsed.toFixed(1) : Math.floor(percentUsed)}%
        </div>
      </div>
    </div>
  );
}
