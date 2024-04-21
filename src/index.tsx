/* @refresh reload */
import { render } from "solid-js/web";

import { Route, Router } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { Component, JSX } from "solid-js";
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

const DefaultLayout: Component<{ children?: JSX.Element }> = (props) => {
  return (
    <>
      <header class="h-14 bg-red-200">
        <a class="text-3xl font-semibold" href="/">
          Sewaddle
        </a>
      </header>
      <main>{props.children}</main>
    </>
  );
};

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider authHandler={authHandler}>
        <ApiClientProvider client={apiClient}>
          <Router>
            <Route path="/" component={DefaultLayout}>
              <Route path="/" component={Home} />
              <Route path="/serie/:id" component={Serie} />
            </Route>

            <Route path="/view/:serieId/:chapterNumber" component={View} />
            <Route path="/login" component={Login} />
          </Router>
        </ApiClientProvider>
      </AuthProvider>
    </QueryClientProvider>
  ),
  root!,
);
