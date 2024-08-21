import type { RpcClient } from "../extension/rpc";
import typeDefs from "./localSchema.graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import type { Resolvers } from "./types/resolvers";
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

        return memoryInternals ?? null;
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
