/* @refresh reload */
import { render } from "solid-js/web";

import { Route, Router } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { AuthHandler } from "./AuthHandler";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Serie from "./pages/Serie";
import View from "./pages/View";

const root = document.getElementById("root");

const queryClient = new QueryClient();
const authHandler = new AuthHandler();

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider authHandler={authHandler}>
        <Router>
          <Route path="/">
            <Route path="/" component={Home} />
            <Route path="/serie/:id" component={Serie} />
            <Route path="/view/:id" component={View} />
            <Route path="/login" component={Login} />
          </Route>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  ),
  root!,
);
