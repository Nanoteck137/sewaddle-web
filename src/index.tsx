/* @refresh reload */
import { render } from "solid-js/web";

import { Route, Router } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import "./index.css";
import Home from "./pages/Home";
import Serie from "./pages/Serie";
import View from "./pages/View";

const root = document.getElementById("root");

const queryClient = new QueryClient();

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Route path="/">
          <Route path="/" component={Home} />
          <Route path="/serie/:id" component={Serie} />
          <Route path="/view/:id" component={View} />
        </Route>
      </Router>
    </QueryClientProvider>
  ),
  root!,
);
