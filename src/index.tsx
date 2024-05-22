/* @refresh reload */
import { render } from "solid-js/web";

import { Route, Router } from "@solidjs/router";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import {
  Component,
  JSX,
  Show,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { Toaster } from "solid-toast";
import { ApiClientProvider, useApiClient } from "./context/ApiClientContext";
import "./index.css";
import ApiClient, { User } from "./lib/api/client";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Serie from "./pages/Serie";
import Setup from "./pages/Setup";
import View from "./pages/View";

const root = document.getElementById("root");

const queryClient = new QueryClient();
const apiBaseUrl = import.meta.env.PROD
  ? ""
  : import.meta.env.VITE_API_URL == undefined
    ? ""
    : import.meta.env.VITE_API_URL;
const apiClient = new ApiClient(apiBaseUrl);

const DefaultLayout: Component<{ children?: JSX.Element }> = (props) => {
  const [user, setUser] = createSignal<User>();

  onMount(() => {
    const unsub = apiClient.registerOnTokenChangedCallback((_token, user) => {
      setUser(user);
    });

    onCleanup(() => {
      unsub();
    });
  });

  return (
    <>
      <header class="h-14 bg-red-200">
        <a class="text-3xl font-semibold" href="/">
          Sewaddle
        </a>

        <Show when={!!user()}>
          <p class="max-w-full text-ellipsis">{user()?.username}</p>
        </Show>
      </header>
      <main>{props.children}</main>
    </>
  );
};

const AppRouter = () => {
  const apiClient = useApiClient();

  onMount(async () => {
    const systemInfo = await apiClient.getSystemInfo();

    if (!systemInfo.isSetup && window.location.pathname !== "/setup") {
      window.location.href = "/setup";
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
        <AppRouter />
        <Toaster />
      </ApiClientProvider>
    </QueryClientProvider>
  ),
  root!,
);
