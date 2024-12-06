import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { ApolloProvider } from "@apollo/client";
import userEvent from "@testing-library/user-event";
import * as Tooltip from "@radix-ui/react-tooltip";

import { client } from "../../index";
import { MemoryRouter } from "react-router-dom";

export const renderWithApolloClient = (
  ui: ReactElement,
  { providerProps, ...renderOptions } = { providerProps: {} }
) => {
  const utils = render(
    <Tooltip.Provider>
      <ApolloProvider client={client} {...providerProps}>
        <MemoryRouter>{ui}</MemoryRouter>
      </ApolloProvider>
    </Tooltip.Provider>,
    renderOptions
  );
  // eslint-disable-next-line testing-library/await-async-events
  return { ...utils, user: userEvent.setup() };
};
