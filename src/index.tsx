/* @refresh reload */
import { render } from "solid-js/web";

import { Route, Router } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { Component, ErrorBoundary, JSX, Show, onMount } from "solid-js";
import { Toaster } from "solid-toast";
import { ApiClientProvider, useApiClient } from "./context/ApiClientContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./index.css";
import { ApiClient, Auth } from "./lib/api/client";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Serie from "./pages/Serie";
import Setup from "./pages/Setup";
import View from "./pages/View";

const root = document.getElementById("root");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      throwOnError: true,
    },
  },
});
const apiBaseUrl = import.meta.env.PROD
  ? ""
  : import.meta.env.VITE_API_URL == undefined
    ? ""
    : import.meta.env.VITE_API_URL;
const apiClient = new ApiClient(apiBaseUrl);
const auth = new Auth(apiClient);

const DefaultLayout: Component<{ children?: JSX.Element }> = (props) => {
  const auth = useAuth();
  const user = auth.user();

  return (
    <>
      <header class="h-14 bg-red-200">
        <a class="text-3xl font-semibold" href="/">
          Sewaddle
        </a>

        <Show when={!!user()}>
          <div class="flex">
            <p class="max-w-full text-ellipsis">{user()?.username}</p>
            <div class="w-2"></div>
            <button
              class="text-blue-600"
              onClick={() => {
                auth.resetToken();
              }}
            >
              Logout
            </button>
          </div>
        </Show>
      </header>
      <ErrorBoundary
        fallback={(e) => {
          return <p class="text-red-700">Error: {e.message}</p>;
        }}
      >
        <main>{props.children}</main>
      </ErrorBoundary>
    </>
  );
};

const AppRouter = () => {
  const apiClient = useApiClient();

  onMount(async () => {
    const systemInfo = await apiClient.getSystemInfo();
    // TODO(patrik): What to do here?
    if (systemInfo.status === "error") return;

    if (!systemInfo.data.isSetup && window.location.pathname !== "/setup") {
      window.location.href = "/setup";
    }

    if (systemInfo.data.isSetup && window.location.pathname === "/setup") {
      window.location.href = "/";
    }
  });

  return (
    <Router>
      <Route path="/" component={DefaultLayout}>
        <Route path="/" component={Home} />
        <Route path="/serie/:id" component={Serie} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
      </Route>

      <Route path="/view/:serieId/:chapterNumber" component={View} />
      <Route path="/setup" component={Setup} />
    </Router>
  );
};

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <ApiClientProvider client={apiClient}>
        <AuthProvider auth={auth}>
          <AppRouter />
          <Toaster />
        </AuthProvider>
      </ApiClientProvider>
    </QueryClientProvider>
  ),
  root!,
);
