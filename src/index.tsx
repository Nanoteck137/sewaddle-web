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
import { ApiClientProvider } from "./context/ApiClientContext";
import "./index.css";
import ApiClient, { User } from "./lib/api/client";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Serie from "./pages/Serie";
import View from "./pages/View";

const root = document.getElementById("root");

const queryClient = new QueryClient();
const apiClient = new ApiClient("http://10.28.28.6:3000");

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

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <ApiClientProvider client={apiClient}>
        <Router>
          <Route path="/" component={DefaultLayout}>
            <Route path="/" component={Home} />
            <Route path="/serie/:id" component={Serie} />
            <Route path="/login" component={Login} />
          </Route>

          <Route path="/view/:serieId/:chapterNumber" component={View} />
        </Router>
      </ApiClientProvider>
    </QueryClientProvider>
  ),
  root!,
);
