import type { ApolloClient, ApolloQueryResult } from "@apollo/client";

export type QueryResult = ApolloQueryResult<any>;

export interface ExplorerResponse {
  operationName: string | undefined;
  response: QueryResult;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NoInfer<T> = [T][T extends any ? 0 : never];

// Alias `any` in places that we are safe to use it (like an constraint) without
// the need to disable eslint rules.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SafeAny = any;

export type DistributiveOmit<T, K extends keyof T> = T extends unknown
  ? Omit<T, K>
  : never;

export interface ApolloClientInfo {
  id: string;
  name: string | undefined;
  version: string;
  queryCount: number;
  mutationCount: number;
}

export type MemoryInternals = ReturnType<
  NonNullable<ApolloClient<unknown>["getMemoryInternals"]>
>;
