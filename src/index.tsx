/* @refresh reload */
import { render } from "solid-js/web";

import { Route, Router } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { AuthHandler } from "./AuthHandler";
import { ApiClientProvider } from "./context/ApiClientContext";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import ApiClient from "./lib/api/client";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Serie from "./pages/Serie";
import View from "./pages/View";

const root = document.getElementById("root");

const queryClient = new QueryClient();
const authHandler = new AuthHandler();
const apiClient = new ApiClient("http://10.28.28.6:3000", authHandler);

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider authHandler={authHandler}>
        <ApiClientProvider client={apiClient}>
          <Router>
            <Route path="/">
              <Route path="/" component={Home} />
              <Route path="/serie/:id" component={Serie} />
              <Route path="/view/:serieId/:chapterNumber" component={View} />
              <Route path="/login" component={Login} />
            </Route>
          </Router>
        </ApiClientProvider>
      </AuthProvider>
    </QueryClientProvider>
  ),
  root!,
);
