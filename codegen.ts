import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "src/application/localSchema.graphql",
  documents: [
    "src/application/**/*.{ts,tsx}",
    "!src/application/**/*.test.{ts,tsx}",
  ],
  generates: {
    "src/application/types/gql.ts": {
      config: {
        avoidOptionals: {
          field: true,
          inputValue: false,
          object: false,
          defaultValue: false,
        },
        defaultScalarType: "unknown",
        namingConvention: {
          typeNames: "keep",
        },
        nonOptionalTypename: true,
        omitOperationSuffix: true,
        useTypeImports: true,
        scalars: {
          Cache: "./scalars#Cache",
          QueryData: "./scalars#QueryData",
          Variables: "./scalars#Variables",
          QueryOptions: "./scalars#QueryOptions",
          JSON: "./scalars#JSON",
          GraphQLErrorPath: "./scalars#GraphQLErrorPath",
        },
        skipTypeNameForRoot: true,
      },
      plugins: ["typescript", "typescript-operations"],
      hooks: {
        afterOneFileWrite: ["prettier --write"],
      },
    },
    "./src/application/types/resolvers.ts": {
      config: {
        defaultScalarType: "unknown",
        rootValueType: "never",
        useTypeImports: true,
        scalars: {
          QueryData: "./scalars#QueryData",
          Variables: "./scalars#Variables",
          QueryOptions: "./scalars#QueryOptions",
        },
        mappers: {
          Client: "../../types.ts#ApolloClientInfo",
          ClientQueries: "../../types.ts#ApolloClientInfo",
          ClientMutations: "../../types.ts#ApolloClientInfo",
          MemoryInternals: "../../types.ts#MemoryInternals",
          SerializedApolloError:
            "../../extension/tab/helpers#SerializedApolloError as RpcSerializedApolloError",
          SerializedError:
            "../../extension/tab/helpers#SerializedError as RpcSerializedError",
          SerializedGraphQLError: "graphql#GraphQLFormattedError",
        },
      },
      plugins: [
        {
          add: {
            content: "/* eslint-disable @typescript-eslint/ban-types */",
          },
        },
        "typescript",
        "typescript-resolvers",
      ],
      hooks: {
        afterOneFileWrite: ["prettier --write"],
      },
    },
  },
  hooks: {
    afterAllFileWrite: ["prettier --write"],
  },
};

export default config;
