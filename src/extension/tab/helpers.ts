import type {
  ApolloError,
  NetworkStatus,
  ObservableQuery,
  WatchQueryOptions,
} from "@apollo/client";
import type { Cache } from "@apollo/client/cache";
import type {
  DocumentNode,
  OperationDefinitionNode,
  FragmentDefinitionNode,
} from "graphql/language";
import type { QueryData, Variables } from "../../application/types/scalars";
import { getPrivateAccess } from "../../privateAccess";
import { getOperationName } from "@apollo/client/utilities";
import { pick } from "../../application/utilities/pick";
import type { GraphQLFormattedError } from "graphql";

export type QueryOptions = Pick<
  WatchQueryOptions,
  | "context"
  | "fetchPolicy"
  | "errorPolicy"
  | "pollInterval"
  | "partialRefetch"
  | "canonizeResults"
  | "returnPartialData"
  | "refetchWritePolicy"
  | "notifyOnNetworkStatusChange"
> & { nextFetchPolicy?: string };

export interface SerializedApolloError extends Pick<ApolloError, "message"> {
  name: "ApolloError";
  clientErrors: string[];
  networkError?: SerializedError;
  graphQLErrors: ReadonlyArray<GraphQLFormattedError>;
  protocolErrors: string[];
}

export interface SerializedError {
  message: string;
  name: string;
  stack?: string;
}

export type QueryDetails = {
  id: string;
  document: DocumentNode;
  variables?: Variables;
  cachedData?: QueryData; // Not a member of the actual Apollo Client QueryInfo type
  options?: QueryOptions;
  networkStatus: NetworkStatus;
  error?: SerializedApolloError;
  pollInterval?: number;
};

export type MutationDetails = {
  document: DocumentNode;
  variables?: Variables;
  loading: boolean;
  error: SerializedApolloError | SerializedError | null;
};

// Transform the map of observable queries into a list of QueryInfo objects usable by DevTools
export function getQueries(
  observableQueries: Map<string, ObservableQuery>
): QueryDetails[] {
  const queries: QueryDetails[] = [];
  if (observableQueries) {
    observableQueries.forEach((oc, queryId) => {
      const observableQuery = getPrivateAccess(oc);
      const { document, variables } = observableQuery.queryInfo;
      const diff = observableQuery.queryInfo.getDiff();
      if (!document) return;
      const name = getOperationName(document);
      if (name === "IntrospectionQuery") {
        return;
      }

      const { pollingInfo } = observableQuery;
      const { networkStatus, error } = observableQuery.getCurrentResult(false);

      queries.push({
        id: queryId,
        document,
        variables,
        cachedData: diff.result,
        options: getQueryOptions(oc),
        networkStatus,
        error: error ? serializeApolloError(error) : undefined,
        pollInterval: pollingInfo && Math.floor(pollingInfo.interval),
      });
    });
  }
  return queries;
}

function serializeApolloError(error: ApolloError): SerializedApolloError {
  return {
    clientErrors: error.clientErrors?.map((e) => e.message) ?? [],
    name: "ApolloError",
    networkError: error.networkError
      ? serializeError(error.networkError)
      : undefined,
    message: error.message,
    graphQLErrors: error.graphQLErrors ?? [],
    protocolErrors: error.protocolErrors?.map((e) => e.message) ?? [],
  };
}

function getQueryOptions(observableQuery: ObservableQuery) {
  const { options } = observableQuery;

  const queryOptions = {
    ...pick(options, [
      "context",
      "pollInterval",
      "partialRefetch",
      "canonizeResults",
      "returnPartialData",
      "refetchWritePolicy",
      "notifyOnNetworkStatusChange",
      "fetchPolicy",
      "errorPolicy",
    ]),
    nextFetchPolicy:
      typeof options.nextFetchPolicy === "function"
        ? "<function>"
        : options.nextFetchPolicy,
  };

  if (queryOptions.nextFetchPolicy == null) {
    delete queryOptions.nextFetchPolicy;
  }

  if (queryOptions.context) {
    queryOptions.context = JSON.parse(
      JSON.stringify(queryOptions.context, (_key, value) => {
        if (typeof value === "function") {
          return `<function>`;
        }

        return value;
      })
    ) as Record<string, unknown>;
  }

  return queryOptions;
}

// Version of getQueries compatible with Apollo Client versions < 3.4.0
export function getQueriesLegacy(
  queryMap: Map<
    string,
    {
      document: DocumentNode;
      variables: Variables;
      diff: Cache.DiffResult<any>;
      networkStatus?: NetworkStatus;
    }
  >
): QueryDetails[] {
  let queries: QueryDetails[] = [];
  if (queryMap) {
    queries = [...queryMap.entries()].map(
      ([queryId, { document, variables, diff, networkStatus }]) => ({
        id: queryId,
        document,
        variables,
        cachedData: diff?.result,
        networkStatus: networkStatus ?? 1,
      })
    );
  }
  return queries;
}

interface MutationStoreValue {
  mutation: DocumentNode;
  variables: Variables;
  loading: boolean;
  error: Error | null;
}

export function getMutations(
  mutationsObj: Record<string, MutationStoreValue>
): MutationDetails[] {
  const keys = Object.keys(mutationsObj);

  if (keys.length === 0) {
    return [];
  }

  return keys.map((key) => {
    const { mutation, variables, loading, error } = mutationsObj[key];
    return {
      document: mutation,
      variables,
      loading,
      error: getSerializedMutationError(error),
    };
  });
}

function serializeError(error: Error | string) {
  return typeof error !== "object"
    ? { message: String(error), name: typeof error }
    : { message: error.message, name: error.name, stack: error.stack };
}

function isApolloError(error: Error): error is ApolloError {
  return error.name === "ApolloError";
}

function getSerializedMutationError(error: Error | null) {
  if (!error) {
    return null;
  }

  return isApolloError(error)
    ? serializeApolloError(error)
    : serializeError(error);
}

export function getMainDefinition(
  queryDoc: DocumentNode
): OperationDefinitionNode | FragmentDefinitionNode {
  let fragmentDefinition;

  for (const definition of queryDoc.definitions) {
    if (definition.kind === "OperationDefinition") {
      const operation = (definition as OperationDefinitionNode).operation;
      if (
        operation === "query" ||
        operation === "mutation" ||
        operation === "subscription"
      ) {
        return definition as OperationDefinitionNode;
      }
    }
    if (definition.kind === "FragmentDefinition" && !fragmentDefinition) {
      // we do this because we want to allow multiple fragment definitions
      // to precede an operation definition.
      fragmentDefinition = definition as FragmentDefinitionNode;
    }
  }

  if (fragmentDefinition) {
    return fragmentDefinition;
  }

  throw new Error(
    "Expected a parsed GraphQL query with a query, mutation, subscription, or a fragment."
  );
}
