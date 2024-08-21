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
            print: getCacheSize(sizes.print, limits.print),
            parser: getCacheSize(sizes.parser, limits.parser),
            canonicalStringify: getCacheSize(
              sizes.canonicalStringify,
              limits.canonicalStringify
            ),
            links: sizes.links
              .map((linkCache) => getLinkCacheSize(linkCache, limits))
              .filter(Boolean),
            queryManager: {
              getDocumentInfo: getCacheSize(
                sizes.queryManager.getDocumentInfo,
                limits["queryManager.getDocumentInfo"]
              ),
              documentTransforms: getDocumentTransformCacheSizes(
                sizes.queryManager.documentTransforms,
                limits
              ),
            },
            fragmentRegistry: {
              lookup: getCacheSize(
                sizes.fragmentRegistry?.lookup,
                limits["fragmentRegistry.lookup"]
              ),
              findFragmentSpreads: getCacheSize(
                sizes.fragmentRegistry?.findFragmentSpreads,
                limits["fragmentRegistry.findFragmentSpreads"]
              ),
              transform: getCacheSize(
                sizes.fragmentRegistry?.transform,
                limits["fragmentRegistry.transform"]
              ),
            },
            cache: {
              fragmentQueryDocuments: getCacheSize(
                sizes.cache?.fragmentQueryDocuments,
                limits["cache.fragmentQueryDocuments"]
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
                sizes.inMemoryCache?.maybeBroadcastWatch,
                limits["inMemoryCache.maybeBroadcastWatch"]
              ),
              executeSelectionSet: getCacheSize(
                sizes.inMemoryCache?.executeSelectionSet,
                limits["inMemoryCache.executeSelectionSet"]
              ),
              executeSubSelectedArray: getCacheSize(
                sizes.inMemoryCache?.executeSubSelectedArray,
                limits["inMemoryCache.executeSubSelectedArray"]
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

function getCacheSize(size: number | undefined, limit: number | undefined) {
  if (!size) {
    return null;
  }

  return { size, limit: limit ?? null };
}

function getDocumentTransformCacheSizes(
  caches: Array<{ cache: number }>,
  limits: MemoryLimits
) {
  return caches.map(({ cache }) => ({
    cache: getCacheSize(cache, limits["documentTransform.cache"]),
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
      persistedQueryHashes: {
        size: linkCache.PersistedQueryLink.persistedQueryHashes,
        limit: limits["PersistedQueryLink.persistedQueryHashes"],
      },
    } satisfies PersistedQueryLinkCacheSizes;
  }

  if (isRemoveTypenameFromVariablesLinkCache(linkCache)) {
    return {
      getVariableDefinitions: {
        size: linkCache.removeTypenameFromVariables.getVariableDefinitions,
        limit: limits["removeTypenameFromVariables.getVariableDefinitions"],
      },
    } satisfies RemoveTypenameFromVariablesLinkCacheSizes;
  }

  return null;
}
