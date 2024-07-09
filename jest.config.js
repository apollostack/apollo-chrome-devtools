const esModules = [
  "bail",
  "comma-separated-tokens",
  "decode-named-character-reference",
  "devlop",
  "estree-util-.+",
  "hast-util-.+",
  "html-url-attributes",
  "is-plain-obj",
  "lodash-es",
  "mdast-util-.+",
  "micromark",
  "property-information",
  "react-base16-styling",
  "react-json-tree",
  "react-markdown",
  "remark-.+",
  "space-separated-tokens",
  "trim-lines",
  "trough",
  "unified",
  "unist-.+",
  "vfile",
  "vfile-message",
].join("|");

export default {
  preset: "ts-jest/presets/js-with-babel",
  setupFilesAfterEnv: ["./test.setup.ts"],
  testEnvironment: "jsdom",
  globals: {
    VERSION: "0.0.0",
  },
  testPathIgnorePatterns: [
    "<rootDir>/build",
    "<rootDir>/dist",
    "/node_modules/",
    "/development/",
  ],
  transform: {
    "\\.graphql$": "<rootDir>/jest/graphqlTransform.js",
  },
  transformIgnorePatterns: [`/node_modules/(?!${esModules})/`],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/src/__mocks__/fileMock.js",
    "\\.(css|less)$": "<rootDir>/src/__mocks__/styleMock.js",
    "rehype-raw": "<rootDir>/src/__mocks__/noop.js",
    "remark-gfm": "<rootDir>/src/__mocks__/noop.js",
    "remark-github": "<rootDir>/src/__mocks__/noop.js",
  },
};
