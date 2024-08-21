/* eslint-disable @typescript-eslint/ban-types */
import type { QueryData } from "./scalars";
import type { QueryOptions } from "./scalars";
import type { Variables } from "./scalars";
import type {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from "graphql";
import type { ApolloClientInfo } from "../../types.ts";
import type {
  SerializedApolloError as RpcSerializedApolloError,
  SerializedError as RpcSerializedError,
} from "../../extension/tab/helpers";
import type { GraphQLFormattedError } from "graphql";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** Represents JSON cache data */
  Cache: { input: unknown; output: unknown };
  GraphQLErrorPath: { input: unknown; output: unknown };
  JSON: { input: unknown; output: unknown };
  /** Represents data for a specific query */
  QueryData: { input: QueryData; output: QueryData };
  /** Represents options for a query */
  QueryOptions: { input: QueryOptions; output: QueryOptions };
  /** Represents variables for a query */
  Variables: { input: Variables; output: Variables };
};

export type BaseCacheSizes = {
  __typename?: "BaseCacheSizes";
  fragmentQueryDocuments?: Maybe<CacheSize>;
};

export type CacheSize = {
  __typename?: "CacheSize";
  limit?: Maybe<Scalars["Int"]["output"]>;
  size?: Maybe<Scalars["Int"]["output"]>;
};

export type Client = {
  __typename?: "Client";
  cache: Scalars["Cache"]["output"];
  id: Scalars["String"]["output"];
  memoryInternals?: Maybe<MemoryInternals>;
  mutations: ClientMutations;
  name?: Maybe<Scalars["String"]["output"]>;
  queries: ClientQueries;
  version: Scalars["String"]["output"];
};

export type ClientMutations = {
  __typename?: "ClientMutations";
  items: Array<WatchedMutation>;
  total: Scalars["Int"]["output"];
};

export type ClientQueries = {
  __typename?: "ClientQueries";
  items: Array<WatchedQuery>;
  total: Scalars["Int"]["output"];
};

export type DocumentTransformCacheSizes = {
  __typename?: "DocumentTransformCacheSizes";
  cache?: Maybe<CacheSize>;
};

export type FragmentRegistryCacheSizes = {
  __typename?: "FragmentRegistryCacheSizes";
  findFragmentSpreads?: Maybe<CacheSize>;
  lookup?: Maybe<CacheSize>;
  transform?: Maybe<CacheSize>;
};

export type GraphQlErrorSourceLocation = {
  __typename?: "GraphQLErrorSourceLocation";
  column: Scalars["Int"]["output"];
  line: Scalars["Int"]["output"];
};

export type InMemoryCacheSizes = {
  __typename?: "InMemoryCacheSizes";
  executeSelectionSet?: Maybe<CacheSize>;
  executeSubSelectedArray?: Maybe<CacheSize>;
  maybeBroadcastWatch?: Maybe<CacheSize>;
};

export type LinkCacheSize =
  | PersistedQueryLinkCacheSizes
  | RemoveTypenameFromVariablesLinkCacheSizes;

export type MemoryInternals = {
  __typename?: "MemoryInternals";
  addTypenameDocumentTransform?: Maybe<Array<DocumentTransformCacheSizes>>;
  cache: BaseCacheSizes;
  canonicalStringify?: Maybe<CacheSize>;
  fragmentRegistry: FragmentRegistryCacheSizes;
  inMemoryCache: InMemoryCacheSizes;
  links: Array<LinkCacheSize>;
  parser?: Maybe<CacheSize>;
  print?: Maybe<CacheSize>;
  queryManager: QueryManagerCacheSizes;
};

export type PersistedQueryLinkCacheSizes = {
  __typename?: "PersistedQueryLinkCacheSizes";
  persistedQueryHashes?: Maybe<CacheSize>;
};

export type Query = {
  __typename?: "Query";
  client?: Maybe<Client>;
  clients: Array<Client>;
};

export type QueryClientArgs = {
  id: Scalars["ID"]["input"];
};

export type QueryManagerCacheSizes = {
  __typename?: "QueryManagerCacheSizes";
  documentTransforms?: Maybe<Array<DocumentTransformCacheSizes>>;
  getDocumentInfo?: Maybe<CacheSize>;
};

export type RemoveTypenameFromVariablesLinkCacheSizes = {
  __typename?: "RemoveTypenameFromVariablesLinkCacheSizes";
  getVariableDefinitions?: Maybe<CacheSize>;
};

export type SerializedApolloError = {
  __typename?: "SerializedApolloError";
  clientErrors: Array<Scalars["String"]["output"]>;
  graphQLErrors: Array<SerializedGraphQlError>;
  message: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  networkError?: Maybe<SerializedError>;
  protocolErrors: Array<Scalars["String"]["output"]>;
};

export type SerializedError = {
  __typename?: "SerializedError";
  message: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  stack?: Maybe<Scalars["String"]["output"]>;
};

export type SerializedGraphQlError = {
  __typename?: "SerializedGraphQLError";
  extensions?: Maybe<Scalars["JSON"]["output"]>;
  locations?: Maybe<Array<GraphQlErrorSourceLocation>>;
  message: Scalars["String"]["output"];
  path?: Maybe<Scalars["GraphQLErrorPath"]["output"]>;
};

export type WatchedMutation = {
  __typename?: "WatchedMutation";
  error?: Maybe<WatchedMutationError>;
  id: Scalars["ID"]["output"];
  loading: Scalars["Boolean"]["output"];
  mutationString: Scalars["String"]["output"];
  name?: Maybe<Scalars["String"]["output"]>;
  variables?: Maybe<Scalars["Variables"]["output"]>;
};

export type WatchedMutationError = SerializedApolloError | SerializedError;

export type WatchedQueries = {
  __typename?: "WatchedQueries";
  count: Scalars["Int"]["output"];
  queries: Array<WatchedQuery>;
};

export type WatchedQuery = {
  __typename?: "WatchedQuery";
  cachedData?: Maybe<Scalars["QueryData"]["output"]>;
  error?: Maybe<SerializedApolloError>;
  id: Scalars["ID"]["output"];
  name?: Maybe<Scalars["String"]["output"]>;
  networkStatus: Scalars["Int"]["output"];
  options?: Maybe<Scalars["QueryOptions"]["output"]>;
  pollInterval?: Maybe<Scalars["Int"]["output"]>;
  queryString: Scalars["String"]["output"];
  variables?: Maybe<Scalars["Variables"]["output"]>;
};

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs,
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >;
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs,
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {},
> =
  | ((
      ...args: any[]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {},
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping of union types */
export type ResolversUnionTypes<_RefType extends Record<string, unknown>> = {
  LinkCacheSize:
    | PersistedQueryLinkCacheSizes
    | RemoveTypenameFromVariablesLinkCacheSizes;
  WatchedMutationError: RpcSerializedApolloError | RpcSerializedError;
};

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  BaseCacheSizes: ResolverTypeWrapper<BaseCacheSizes>;
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]["output"]>;
  Cache: ResolverTypeWrapper<Scalars["Cache"]["output"]>;
  CacheSize: ResolverTypeWrapper<CacheSize>;
  Client: ResolverTypeWrapper<ApolloClientInfo>;
  ClientMutations: ResolverTypeWrapper<ApolloClientInfo>;
  ClientQueries: ResolverTypeWrapper<ApolloClientInfo>;
  DocumentTransformCacheSizes: ResolverTypeWrapper<DocumentTransformCacheSizes>;
  FragmentRegistryCacheSizes: ResolverTypeWrapper<FragmentRegistryCacheSizes>;
  GraphQLErrorPath: ResolverTypeWrapper<Scalars["GraphQLErrorPath"]["output"]>;
  GraphQLErrorSourceLocation: ResolverTypeWrapper<GraphQlErrorSourceLocation>;
  ID: ResolverTypeWrapper<Scalars["ID"]["output"]>;
  InMemoryCacheSizes: ResolverTypeWrapper<InMemoryCacheSizes>;
  Int: ResolverTypeWrapper<Scalars["Int"]["output"]>;
  JSON: ResolverTypeWrapper<Scalars["JSON"]["output"]>;
  LinkCacheSize: ResolverTypeWrapper<
    ResolversUnionTypes<ResolversTypes>["LinkCacheSize"]
  >;
  MemoryInternals: ResolverTypeWrapper<
    Omit<MemoryInternals, "links"> & {
      links: Array<ResolversTypes["LinkCacheSize"]>;
    }
  >;
  PersistedQueryLinkCacheSizes: ResolverTypeWrapper<PersistedQueryLinkCacheSizes>;
  Query: ResolverTypeWrapper<never>;
  QueryData: ResolverTypeWrapper<Scalars["QueryData"]["output"]>;
  QueryManagerCacheSizes: ResolverTypeWrapper<QueryManagerCacheSizes>;
  QueryOptions: ResolverTypeWrapper<Scalars["QueryOptions"]["output"]>;
  RemoveTypenameFromVariablesLinkCacheSizes: ResolverTypeWrapper<RemoveTypenameFromVariablesLinkCacheSizes>;
  SerializedApolloError: ResolverTypeWrapper<RpcSerializedApolloError>;
  SerializedError: ResolverTypeWrapper<RpcSerializedError>;
  SerializedGraphQLError: ResolverTypeWrapper<GraphQLFormattedError>;
  String: ResolverTypeWrapper<Scalars["String"]["output"]>;
  Variables: ResolverTypeWrapper<Scalars["Variables"]["output"]>;
  WatchedMutation: ResolverTypeWrapper<
    Omit<WatchedMutation, "error"> & {
      error?: Maybe<ResolversTypes["WatchedMutationError"]>;
    }
  >;
  WatchedMutationError: ResolverTypeWrapper<
    ResolversUnionTypes<ResolversTypes>["WatchedMutationError"]
  >;
  WatchedQueries: ResolverTypeWrapper<
    Omit<WatchedQueries, "queries"> & {
      queries: Array<ResolversTypes["WatchedQuery"]>;
    }
  >;
  WatchedQuery: ResolverTypeWrapper<
    Omit<WatchedQuery, "error"> & {
      error?: Maybe<ResolversTypes["SerializedApolloError"]>;
    }
  >;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  BaseCacheSizes: BaseCacheSizes;
  Boolean: Scalars["Boolean"]["output"];
  Cache: Scalars["Cache"]["output"];
  CacheSize: CacheSize;
  Client: ApolloClientInfo;
  ClientMutations: ApolloClientInfo;
  ClientQueries: ApolloClientInfo;
  DocumentTransformCacheSizes: DocumentTransformCacheSizes;
  FragmentRegistryCacheSizes: FragmentRegistryCacheSizes;
  GraphQLErrorPath: Scalars["GraphQLErrorPath"]["output"];
  GraphQLErrorSourceLocation: GraphQlErrorSourceLocation;
  ID: Scalars["ID"]["output"];
  InMemoryCacheSizes: InMemoryCacheSizes;
  Int: Scalars["Int"]["output"];
  JSON: Scalars["JSON"]["output"];
  LinkCacheSize: ResolversUnionTypes<ResolversParentTypes>["LinkCacheSize"];
  MemoryInternals: Omit<MemoryInternals, "links"> & {
    links: Array<ResolversParentTypes["LinkCacheSize"]>;
  };
  PersistedQueryLinkCacheSizes: PersistedQueryLinkCacheSizes;
  Query: never;
  QueryData: Scalars["QueryData"]["output"];
  QueryManagerCacheSizes: QueryManagerCacheSizes;
  QueryOptions: Scalars["QueryOptions"]["output"];
  RemoveTypenameFromVariablesLinkCacheSizes: RemoveTypenameFromVariablesLinkCacheSizes;
  SerializedApolloError: RpcSerializedApolloError;
  SerializedError: RpcSerializedError;
  SerializedGraphQLError: GraphQLFormattedError;
  String: Scalars["String"]["output"];
  Variables: Scalars["Variables"]["output"];
  WatchedMutation: Omit<WatchedMutation, "error"> & {
    error?: Maybe<ResolversParentTypes["WatchedMutationError"]>;
  };
  WatchedMutationError: ResolversUnionTypes<ResolversParentTypes>["WatchedMutationError"];
  WatchedQueries: Omit<WatchedQueries, "queries"> & {
    queries: Array<ResolversParentTypes["WatchedQuery"]>;
  };
  WatchedQuery: Omit<WatchedQuery, "error"> & {
    error?: Maybe<ResolversParentTypes["SerializedApolloError"]>;
  };
};

export type BaseCacheSizesResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["BaseCacheSizes"] = ResolversParentTypes["BaseCacheSizes"],
> = {
  fragmentQueryDocuments?: Resolver<
    Maybe<ResolversTypes["CacheSize"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface CacheScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["Cache"], any> {
  name: "Cache";
}

export type CacheSizeResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["CacheSize"] = ResolversParentTypes["CacheSize"],
> = {
  limit?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  size?: Resolver<Maybe<ResolversTypes["Int"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClientResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["Client"] = ResolversParentTypes["Client"],
> = {
  cache?: Resolver<ResolversTypes["Cache"], ParentType, ContextType>;
  id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  memoryInternals?: Resolver<
    Maybe<ResolversTypes["MemoryInternals"]>,
    ParentType,
    ContextType
  >;
  mutations?: Resolver<
    ResolversTypes["ClientMutations"],
    ParentType,
    ContextType
  >;
  name?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  queries?: Resolver<ResolversTypes["ClientQueries"], ParentType, ContextType>;
  version?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClientMutationsResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["ClientMutations"] = ResolversParentTypes["ClientMutations"],
> = {
  items?: Resolver<
    Array<ResolversTypes["WatchedMutation"]>,
    ParentType,
    ContextType
  >;
  total?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ClientQueriesResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["ClientQueries"] = ResolversParentTypes["ClientQueries"],
> = {
  items?: Resolver<
    Array<ResolversTypes["WatchedQuery"]>,
    ParentType,
    ContextType
  >;
  total?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DocumentTransformCacheSizesResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["DocumentTransformCacheSizes"] = ResolversParentTypes["DocumentTransformCacheSizes"],
> = {
  cache?: Resolver<Maybe<ResolversTypes["CacheSize"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FragmentRegistryCacheSizesResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["FragmentRegistryCacheSizes"] = ResolversParentTypes["FragmentRegistryCacheSizes"],
> = {
  findFragmentSpreads?: Resolver<
    Maybe<ResolversTypes["CacheSize"]>,
    ParentType,
    ContextType
  >;
  lookup?: Resolver<
    Maybe<ResolversTypes["CacheSize"]>,
    ParentType,
    ContextType
  >;
  transform?: Resolver<
    Maybe<ResolversTypes["CacheSize"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface GraphQlErrorPathScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["GraphQLErrorPath"], any> {
  name: "GraphQLErrorPath";
}

export type GraphQlErrorSourceLocationResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["GraphQLErrorSourceLocation"] = ResolversParentTypes["GraphQLErrorSourceLocation"],
> = {
  column?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  line?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type InMemoryCacheSizesResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["InMemoryCacheSizes"] = ResolversParentTypes["InMemoryCacheSizes"],
> = {
  executeSelectionSet?: Resolver<
    Maybe<ResolversTypes["CacheSize"]>,
    ParentType,
    ContextType
  >;
  executeSubSelectedArray?: Resolver<
    Maybe<ResolversTypes["CacheSize"]>,
    ParentType,
    ContextType
  >;
  maybeBroadcastWatch?: Resolver<
    Maybe<ResolversTypes["CacheSize"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface JsonScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["JSON"], any> {
  name: "JSON";
}

export type LinkCacheSizeResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["LinkCacheSize"] = ResolversParentTypes["LinkCacheSize"],
> = {
  __resolveType: TypeResolveFn<
    | "PersistedQueryLinkCacheSizes"
    | "RemoveTypenameFromVariablesLinkCacheSizes",
    ParentType,
    ContextType
  >;
};

export type MemoryInternalsResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["MemoryInternals"] = ResolversParentTypes["MemoryInternals"],
> = {
  addTypenameDocumentTransform?: Resolver<
    Maybe<Array<ResolversTypes["DocumentTransformCacheSizes"]>>,
    ParentType,
    ContextType
  >;
  cache?: Resolver<ResolversTypes["BaseCacheSizes"], ParentType, ContextType>;
  canonicalStringify?: Resolver<
    Maybe<ResolversTypes["CacheSize"]>,
    ParentType,
    ContextType
  >;
  fragmentRegistry?: Resolver<
    ResolversTypes["FragmentRegistryCacheSizes"],
    ParentType,
    ContextType
  >;
  inMemoryCache?: Resolver<
    ResolversTypes["InMemoryCacheSizes"],
    ParentType,
    ContextType
  >;
  links?: Resolver<
    Array<ResolversTypes["LinkCacheSize"]>,
    ParentType,
    ContextType
  >;
  parser?: Resolver<
    Maybe<ResolversTypes["CacheSize"]>,
    ParentType,
    ContextType
  >;
  print?: Resolver<Maybe<ResolversTypes["CacheSize"]>, ParentType, ContextType>;
  queryManager?: Resolver<
    ResolversTypes["QueryManagerCacheSizes"],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PersistedQueryLinkCacheSizesResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["PersistedQueryLinkCacheSizes"] = ResolversParentTypes["PersistedQueryLinkCacheSizes"],
> = {
  persistedQueryHashes?: Resolver<
    Maybe<ResolversTypes["CacheSize"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["Query"] = ResolversParentTypes["Query"],
> = {
  client?: Resolver<
    Maybe<ResolversTypes["Client"]>,
    ParentType,
    ContextType,
    RequireFields<QueryClientArgs, "id">
  >;
  clients?: Resolver<Array<ResolversTypes["Client"]>, ParentType, ContextType>;
};

export interface QueryDataScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["QueryData"], any> {
  name: "QueryData";
}

export type QueryManagerCacheSizesResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["QueryManagerCacheSizes"] = ResolversParentTypes["QueryManagerCacheSizes"],
> = {
  documentTransforms?: Resolver<
    Maybe<Array<ResolversTypes["DocumentTransformCacheSizes"]>>,
    ParentType,
    ContextType
  >;
  getDocumentInfo?: Resolver<
    Maybe<ResolversTypes["CacheSize"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface QueryOptionsScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["QueryOptions"], any> {
  name: "QueryOptions";
}

export type RemoveTypenameFromVariablesLinkCacheSizesResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["RemoveTypenameFromVariablesLinkCacheSizes"] = ResolversParentTypes["RemoveTypenameFromVariablesLinkCacheSizes"],
> = {
  getVariableDefinitions?: Resolver<
    Maybe<ResolversTypes["CacheSize"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SerializedApolloErrorResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["SerializedApolloError"] = ResolversParentTypes["SerializedApolloError"],
> = {
  clientErrors?: Resolver<
    Array<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  graphQLErrors?: Resolver<
    Array<ResolversTypes["SerializedGraphQLError"]>,
    ParentType,
    ContextType
  >;
  message?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  networkError?: Resolver<
    Maybe<ResolversTypes["SerializedError"]>,
    ParentType,
    ContextType
  >;
  protocolErrors?: Resolver<
    Array<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SerializedErrorResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["SerializedError"] = ResolversParentTypes["SerializedError"],
> = {
  message?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  stack?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SerializedGraphQlErrorResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["SerializedGraphQLError"] = ResolversParentTypes["SerializedGraphQLError"],
> = {
  extensions?: Resolver<Maybe<ResolversTypes["JSON"]>, ParentType, ContextType>;
  locations?: Resolver<
    Maybe<Array<ResolversTypes["GraphQLErrorSourceLocation"]>>,
    ParentType,
    ContextType
  >;
  message?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  path?: Resolver<
    Maybe<ResolversTypes["GraphQLErrorPath"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface VariablesScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["Variables"], any> {
  name: "Variables";
}

export type WatchedMutationResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["WatchedMutation"] = ResolversParentTypes["WatchedMutation"],
> = {
  error?: Resolver<
    Maybe<ResolversTypes["WatchedMutationError"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  loading?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  mutationString?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  variables?: Resolver<
    Maybe<ResolversTypes["Variables"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WatchedMutationErrorResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["WatchedMutationError"] = ResolversParentTypes["WatchedMutationError"],
> = {
  __resolveType: TypeResolveFn<
    "SerializedApolloError" | "SerializedError",
    ParentType,
    ContextType
  >;
};

export type WatchedQueriesResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["WatchedQueries"] = ResolversParentTypes["WatchedQueries"],
> = {
  count?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  queries?: Resolver<
    Array<ResolversTypes["WatchedQuery"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WatchedQueryResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes["WatchedQuery"] = ResolversParentTypes["WatchedQuery"],
> = {
  cachedData?: Resolver<
    Maybe<ResolversTypes["QueryData"]>,
    ParentType,
    ContextType
  >;
  error?: Resolver<
    Maybe<ResolversTypes["SerializedApolloError"]>,
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>;
  networkStatus?: Resolver<ResolversTypes["Int"], ParentType, ContextType>;
  options?: Resolver<
    Maybe<ResolversTypes["QueryOptions"]>,
    ParentType,
    ContextType
  >;
  pollInterval?: Resolver<
    Maybe<ResolversTypes["Int"]>,
    ParentType,
    ContextType
  >;
  queryString?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  variables?: Resolver<
    Maybe<ResolversTypes["Variables"]>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  BaseCacheSizes?: BaseCacheSizesResolvers<ContextType>;
  Cache?: GraphQLScalarType;
  CacheSize?: CacheSizeResolvers<ContextType>;
  Client?: ClientResolvers<ContextType>;
  ClientMutations?: ClientMutationsResolvers<ContextType>;
  ClientQueries?: ClientQueriesResolvers<ContextType>;
  DocumentTransformCacheSizes?: DocumentTransformCacheSizesResolvers<ContextType>;
  FragmentRegistryCacheSizes?: FragmentRegistryCacheSizesResolvers<ContextType>;
  GraphQLErrorPath?: GraphQLScalarType;
  GraphQLErrorSourceLocation?: GraphQlErrorSourceLocationResolvers<ContextType>;
  InMemoryCacheSizes?: InMemoryCacheSizesResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  LinkCacheSize?: LinkCacheSizeResolvers<ContextType>;
  MemoryInternals?: MemoryInternalsResolvers<ContextType>;
  PersistedQueryLinkCacheSizes?: PersistedQueryLinkCacheSizesResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  QueryData?: GraphQLScalarType;
  QueryManagerCacheSizes?: QueryManagerCacheSizesResolvers<ContextType>;
  QueryOptions?: GraphQLScalarType;
  RemoveTypenameFromVariablesLinkCacheSizes?: RemoveTypenameFromVariablesLinkCacheSizesResolvers<ContextType>;
  SerializedApolloError?: SerializedApolloErrorResolvers<ContextType>;
  SerializedError?: SerializedErrorResolvers<ContextType>;
  SerializedGraphQLError?: SerializedGraphQlErrorResolvers<ContextType>;
  Variables?: GraphQLScalarType;
  WatchedMutation?: WatchedMutationResolvers<ContextType>;
  WatchedMutationError?: WatchedMutationErrorResolvers<ContextType>;
  WatchedQueries?: WatchedQueriesResolvers<ContextType>;
  WatchedQuery?: WatchedQueryResolvers<ContextType>;
};
