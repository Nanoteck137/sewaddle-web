/* @refresh reload */
import { render } from "solid-js/web";

import { Route, Router } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import "./index.css";
import Home from "./pages/Home";

const root = document.getElementById("root");

const queryClient = new QueryClient();

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Route path="/">
          <Route path="/" component={Home} />
        </Route>
      </Router>
    </QueryClientProvider>
  ),
  root!,
);
