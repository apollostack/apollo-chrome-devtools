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
        <TooltipLink href="https://github.com/apollographql/apollo-client/blob/main/src/utilities/graphql/print.ts">
          <code>print</code>
        </TooltipLink>{" "}
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
        <TooltipLink href="https://github.com/apollographql/apollo-client/blob/main/src/react/parser/index.ts">
          <code>parser</code>
        </TooltipLink>{" "}
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
      <TooltipLink href="https://github.com/apollographql/apollo-client/blob/main/src/utilities/common/canonicalStringify.ts">
        <code>canonicalStringify</code>
      </TooltipLink>
    </p>
  ),
  "PersistedQueryLink.persistedQueryHashes": (
    <>
      <p>
        A cache inside of
        <TooltipLink href="https://github.com/apollographql/apollo-client/blob/main/src/link/persisted-queries/index.ts">
          <code>PersistedQueryLink</code>
        </TooltipLink>
        .
      </p>
      <p>
        It is called with transformed <code>DocumentNode</code>s.
      </p>
    </>
  ),
  "removeTypenameFromVariables.getVariableDefinitions": (
    <>
      <p>
        Cache used in
        <TooltipLink href="https://github.com/apollographql/apollo-client/blob/main/src/link/remove-typename/removeTypenameFromVariables.ts">
          <code>removeTypenameFromVariables</code>
        </TooltipLink>
        .
      </p>
      <p>
        This function is called transformed <code>DocumentNode</code>s.
      </p>
    </>
  ),
  "queryManager.getDocumentInfo": (
    <>
      <p>
        A cache inside of{" "}
        <TooltipLink href="https://github.com/apollographql/apollo-client/blob/main/src/core/QueryManager.ts">
          <code>QueryManager</code>
        </TooltipLink>
        .
      </p>
      <p>
        It is called with transformed <code>DocumentNode</code>s.
      </p>
    </>
  ),
  "documentTransform.cache": (
    <>
      <p>
        Cache size for the cache of
        <TooltipLink href="https://github.com/apollographql/apollo-client/blob/main/src/utilities/graphql/DocumentTransform.ts">
          <code>DocumentTransform</code>
        </TooltipLink>{" "}
        instances with the <code>cache</code> option set to <code>true</code>.
      </p>
      <p>
        Can be called with user-defined or already-transformed{" "}
        <code>DocumentNode</code>s.
      </p>
    </>
  ),
  "fragmentRegistry.lookup": (
    <>
      <p>
        A cache inside of
        <TooltipLink href="https://github.com/apollographql/apollo-client/blob/main/src/cache/inmemory/fragmentRegistry.ts">
          <code>FragmentRegistry</code>
        </TooltipLink>
        .
      </p>
      <p>
        This function is called with fragment names in the form of a string.
      </p>
    </>
  ),
  "fragmentRegistry.findFragmentSpreads": (
    <>
      <p>
        Cache size for the <code>findFragmentSpreads</code> method of
        <TooltipLink href="https://github.com/apollographql/apollo-client/blob/main/src/cache/inmemory/fragmentRegistry.ts">
          <code>FragmentRegistry</code>
        </TooltipLink>
        .
      </p>
      <p>
        This function is called with transformed <code>DocumentNode</code>s, as
        well as recursively with every fragment spread referenced within that,
        or a fragment referenced by a fragment spread.
      </p>
    </>
  ),
  "fragmentRegistry.transform": (
    <>
      <p>
        A cache inside of
        <TooltipLink href="https://github.com/apollographql/apollo-client/blob/main/src/cache/inmemory/fragmentRegistry.ts">
          <code>FragmentRegistry</code>
        </TooltipLink>
        .
      </p>
      <p>
        Can be called with user-defined or already-transformed{" "}
        <code>DocumentNode</code>s.
      </p>
    </>
  ),
  "cache.fragmentQueryDocuments": (
    <>
      <p>
        Cache size for the <code>getFragmentDoc</code> method of
        <TooltipLink href="https://github.com/apollographql/apollo-client/blob/main/src/cache/core/cache.ts">
          <code>ApolloCache</code>
        </TooltipLink>
        .
      </p>
      <p>This function is called with user-provided fragment definitions.</p>
    </>
  ),
  "inMemoryCache.executeSelectionSet": (
    <>
      <p>
        Cache size for the <code>executeSelectionSet</code> method on{" "}
        <TooltipLink href="https://github.com/apollographql/apollo-client/blob/main/src/cache/inmemory/readFromStore.ts">
          <code>StoreReader</code>
        </TooltipLink>
        .
      </p>
      <p>
        Note: <code>executeSelectionSet</code> will be set to the{" "}
        <code>resultCacheMaxSize</code> option and will fall back to this
        configuration value if the option is not set.
      </p>
    </>
  ),
  "inMemoryCache.executeSubSelectedArray": (
    <>
      <p>
        Cache size for the <code>executeSubSelectedArray</code> method on{" "}
        <TooltipLink href="https://github.com/apollographql/apollo-client/blob/main/src/cache/inmemory/readFromStore.ts">
          <code>StoreReader</code>
        </TooltipLink>
        .
      </p>

      <p>
        Note: <code>executeSubSelectedArray</code> will be set to the{" "}
        <code>resultCacheMaxSize</code> option and will fall back to this
        configuration value if the option is not set.
      </p>
    </>
  ),
  "inMemoryCache.maybeBroadcastWatch": (
    <>
      <p>
        Cache size for the <code>maybeBroadcastWatch</code> method on{" "}
        <TooltipLink href="https://github.com/apollographql/apollo-client/blob/main/src/cache/inmemory/inMemoryCache.ts">
          <code>InMemoryCache</code>
        </TooltipLink>
        .
      </p>
      <p>
        Note: <code>maybeBroadcastWatch</code> will be set to the{" "}
        <code>resultCacheMaxSize</code> option and will fall back to this
        configuration value if the option is not set.
      </p>
    </>
  ),
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
          {percentUsed > 0 && percentUsed < 1
            ? percentUsed.toFixed(1)
            : Math.floor(percentUsed)}
          %
        </div>
      </div>
    </div>
  );
}

function TooltipLink({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) {
  return (
    <ExternalLink href={href} className="inline-flex items-center gap-1">
      {children}
      <IconOutlink className="size-3" />
    </ExternalLink>
  );
}
