import { screen, waitFor } from "@testing-library/react";

import { renderWithApolloClient } from "../utilities/testing/renderWithApolloClient";
import { App } from "../App";
import { getRpcClient } from "../../extension/devtools/panelRpcClient";
import type { GetRpcClientMock } from "../../extension/devtools/__mocks__/panelRpcClient";
import React from "react";

jest.mock("../../extension/devtools/panelRpcClient.ts");

jest.mock("../components/Explorer/Explorer", () => ({
  Explorer: () => <div>Build</div>,
}));

const testAdapter = (getRpcClient as GetRpcClientMock).__adapter;

beforeEach(() => {
  testAdapter.mockClear();
});

describe("<App />", () => {
  test.skip("renders the selected screen", async () => {
    testAdapter.handleRpcRequest("getClients", () => []);

    renderWithApolloClient(<App />);

    await waitFor(() => {
      expect(screen.getByText("Queries (0)")).toBeInTheDocument();
    });
    await waitFor(() => {
      // currentScreen(Screens.Mutations);
      // expect(currentScreen()).toEqual(Screens.Mutations);
    });
    await screen.findByText("Mutations (0)");
    await waitFor(() => {
      // currentScreen(Screens.Explorer);
      // expect(currentScreen()).toEqual(Screens.Explorer);
    });
    await screen.findByText("Build");
  });
});
