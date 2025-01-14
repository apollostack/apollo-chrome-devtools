import type { RpcClient } from "../extension/rpc";
import typeDefs from "./localSchema.graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import type {
  Resolvers,
  PersistedQueryLinkCacheSizes,
  RemoveTypenameFromVariablesLinkCacheSizes,
} from "./types/resolvers";
import { getOperationName } from "@apollo/client/utilities";
import { print } from "graphql";

export function createSchemaWithRpcClient(rpcClient: RpcClient) {
  return makeExecutableSchema({
    typeDefs,
    resolvers: createResolvers(rpcClient),
  });
}

function createResolvers(client: RpcClient): Resolvers {
  const rpcClient = client.withTimeout(10_000);

  return {
    Query: {
      clients: () => rpcClient.request("getClients"),
      client: (_, { id }) => rpcClient.request("getClient", id),
    },
    Client: {
      queries: (client) => client,
      mutations: (client) => client,
      cache: (client) => rpcClient.request("getCache", client.id),
      memoryInternals: async (client) => {
        const memoryInternals = await rpcClient.request(
          "getMemoryInternals",
          client.id
        );

        if (!memoryInternals) {
          return null;
        }

        const sizes = memoryInternals.sizes;
        const limits = memoryInternals.limits;

        return {
          raw: memoryInternals,
          caches: {
            print: getCacheSize("print", sizes.print, limits),
            parser: getCacheSize("parser", sizes.parser, limits),
            canonicalStringify: getCacheSize(
              "canonicalStringify",
              sizes.canonicalStringify,
              limits
            ),
            links: sizes.links
              .map((linkCache) => getLinkCacheSize(linkCache, limits))
              .filter(Boolean),
            queryManager: {
              getDocumentInfo: getCacheSize(
                "queryManager.getDocumentInfo",
                sizes.queryManager.getDocumentInfo,
                limits
              ),
              documentTransforms: getDocumentTransformCacheSizes(
                sizes.queryManager.documentTransforms,
                limits
              ),
            },
            fragmentRegistry: {
              lookup: getCacheSize(
                "fragmentRegistry.lookup",
                sizes.fragmentRegistry?.lookup,
                limits
              ),
              findFragmentSpreads: getCacheSize(
                "fragmentRegistry.findFragmentSpreads",
                sizes.fragmentRegistry?.findFragmentSpreads,
                limits
              ),
              transform: getCacheSize(
                "fragmentRegistry.transform",
                sizes.fragmentRegistry?.transform,
                limits
              ),
            },
            cache: {
              fragmentQueryDocuments: getCacheSize(
                "cache.fragmentQueryDocuments",
                sizes.cache?.fragmentQueryDocuments,
                limits
              ),
            },
            addTypenameDocumentTransform: sizes.addTypenameDocumentTransform
              ? getDocumentTransformCacheSizes(
                  sizes.addTypenameDocumentTransform,
                  limits
                )
              : null,
            inMemoryCache: {
              maybeBroadcastWatch: getCacheSize(
                "inMemoryCache.maybeBroadcastWatch",
                sizes.inMemoryCache?.maybeBroadcastWatch,
                limits
              ),
              executeSelectionSet: getCacheSize(
                "inMemoryCache.executeSelectionSet",
                sizes.inMemoryCache?.executeSelectionSet,
                limits
              ),
              executeSubSelectedArray: getCacheSize(
                "inMemoryCache.executeSubSelectedArray",
                sizes.inMemoryCache?.executeSubSelectedArray,
                limits
              ),
            },
          },
        };
      },
    },
    ClientQueries: {
      total: (client) => client.queryCount,
      items: async (client) => {
        const queries = await rpcClient.request("getQueries", client.id);

        return queries
          .map((query) => {
            const name = getOperationName(query.document);
            if (name === "IntrospectionQuery") {
              return;
            }

            return {
              id: query.id,
              name,
              queryString: print(query.document),
              variables: query.variables ?? null,
              cachedData: query.cachedData ?? null,
              options: query.options ?? null,
              networkStatus: query.networkStatus,
              error: query.error,
              pollInterval: query.pollInterval,
            };
          })
          .filter(Boolean);
      },
    },
    ClientMutations: {
      total: (client) => client.mutationCount,
      items: async (client) => {
        const mutations = await rpcClient.request("getMutations", client.id);

        return mutations.map((mutation, index) => ({
          id: String(index),
          __typename: "WatchedMutation",
          name: getOperationName(mutation.document),
          mutationString: print(mutation.document),
          variables: mutation.variables ?? null,
          loading: mutation.loading,
          error: mutation.error,
        }));
      },
    },
    WatchedMutationError: {
      __resolveType: (error) => {
        if (error.name === "ApolloError") {
          return "SerializedApolloError";
        }

        return "SerializedError";
      },
    },
  };
}

type MemoryLimits = Record<string, number | undefined>;

function getCacheSize(
  key: string,
  size: number | undefined,
  limits: MemoryLimits
) {
  return { key, size: size ?? null, limit: limits[key] ?? null };
}

function getDocumentTransformCacheSizes(
  caches: Array<{ cache: number }>,
  limits: MemoryLimits
) {
  return caches.map(({ cache }) => ({
    cache: getCacheSize("documentTransform.cache", cache, limits),
  }));
}

interface PersistedQueryLinkCache {
  PersistedQueryLink: {
    persistedQueryHashes: number;
  };
}

function isPersistedQueryLinkCache(
  cache: unknown
): cache is PersistedQueryLinkCache {
  return (
    typeof cache === "object" && cache !== null && "PersistedQueryLink" in cache
  );
}

interface RemoveTypenameFromVariablesLinkCache {
  removeTypenameFromVariables: {
    getVariableDefinitions: number;
  };
}

function isRemoveTypenameFromVariablesLinkCache(
  cache: unknown
): cache is RemoveTypenameFromVariablesLinkCache {
  return (
    typeof cache === "object" &&
    cache !== null &&
    "removeTypenameFromVariables" in cache
  );
}

function getLinkCacheSize(
  linkCache: unknown,
  limits: MemoryLimits
):
  | PersistedQueryLinkCacheSizes
  | RemoveTypenameFromVariablesLinkCacheSizes
  | null {
  if (isPersistedQueryLinkCache(linkCache)) {
    return {
      __typename: "PersistedQueryLinkCacheSizes",
      persistedQueryHashes: getCacheSize(
        "PersistedQueryLink.persistedQueryHashes",
        linkCache.PersistedQueryLink.persistedQueryHashes,
        limits
      ),
    } satisfies PersistedQueryLinkCacheSizes;
  }

  if (isRemoveTypenameFromVariablesLinkCache(linkCache)) {
    return {
      __typename: "RemoveTypenameFromVariablesLinkCacheSizes",
      getVariableDefinitions: getCacheSize(
        "removeTypenameFromVariables.getVariableDefinitions",
        linkCache.removeTypenameFromVariables.getVariableDefinitions,
        limits
      ),
    } satisfies RemoveTypenameFromVariablesLinkCacheSizes;
  }

  return null;
}
