import {
  createRoutesFromElements,
  createMemoryRouter,
  Route,
} from "react-router-dom";

import { App } from "./App";
import { ConnectorsPage } from "./pages/connectors";
import { ConnectorsIndexPage } from "./pages/connectors/index";
import * as ConnectorPage from "./pages/connectors/$id";
import * as ConnectorIndexPage from "./pages/connectors/$id/index";

export const router = createMemoryRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="connectors" element={<ConnectorsPage />}>
        <Route index element={<ConnectorsIndexPage />} />
        <Route
          path=":operationId"
          element={<ConnectorPage.Route />}
          loader={ConnectorPage.loader}
        >
          <Route index element={<ConnectorIndexPage.Route />} />
        </Route>
      </Route>
    </Route>
  )
);
