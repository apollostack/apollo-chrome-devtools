import {
  createRoutesFromElements,
  createMemoryRouter,
  Route,
} from "react-router-dom";

import { App } from "./App";
import * as ConnectorsPage from "./pages/connectors";
import * as ConnectorsIndexPage from "./pages/connectors/index";
import * as ConnectorPage from "./pages/connectors/$operationId";
import * as ConnectorIndexPage from "./pages/connectors/$operationId/index";
import * as ConnectorRequestPage from "./pages/connectors/$operationId/requests/$requestId";

export const router = createMemoryRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="queries" />
      <Route path="mutations" />
      <Route path="cache" />
      <Route path="explorer" />
      <Route path="connectors" element={<ConnectorsPage.Route />}>
        <Route index element={<ConnectorsIndexPage.Route />} />
        <Route
          path=":operationId"
          element={<ConnectorPage.Route />}
          loader={ConnectorPage.loader}
        >
          <Route index element={<ConnectorIndexPage.Route />} />
          <Route
            path="requests/:requestId"
            element={<ConnectorRequestPage.Route />}
          />
        </Route>
      </Route>
    </Route>
  ),
  { initialEntries: ["/queries"] }
);
