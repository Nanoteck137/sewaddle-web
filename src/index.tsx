/* @refresh reload */
import { render } from "solid-js/web";

import { Route, Router } from "@solidjs/router";
import {
  QueryClient,
  QueryClientProvider,
  createMutation,
} from "@tanstack/solid-query";
import {
  HiSolidBars3,
  HiSolidHome,
  HiSolidUser,
  HiSolidXMark,
} from "solid-icons/hi";
import { OcSignin2, OcSignout2 } from "solid-icons/oc";
import {
  Component,
  ErrorBoundary,
  JSX,
  Show,
  createEffect,
  createSignal,
  onMount,
} from "solid-js";
import toast, { Toaster } from "solid-toast";
import { ApiClientProvider, useApiClient } from "./context/ApiClientContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./index.css";
import { Auth } from "./lib/api/auth";
import { ApiClient } from "./lib/api/client";
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
  const apiClient = useApiClient();

  const auth = useAuth();
  const user = auth.user();

  const syncLibrary = createMutation(() => ({
    mutationFn: () => apiClient.runLibrarySync(),
    onSuccess: () => {
      toast.success("Running Library Sync");
    },
  }));

  const [showSide, setShowSide] = createSignal(false);

  createEffect(() => {
    if (showSide()) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  });

  const close = () => {
    setShowSide(false);
  };

  return (
    <>
      <header class="fixed z-50 flex h-16 w-full items-center gap-4 bg-gradient-to-tr from-purple-600 to-blue-500 px-4 py-2">
        <button
          class="text-white"
          onClick={() => setShowSide((prev) => !prev)}
        >
          <HiSolidBars3 class="h-10 w-10" />
        </button>

        <a class="text-3xl font-medium text-white" href="/">
          Sewaddle
        </a>
      </header>

      <ErrorBoundary
        fallback={(e) => {
          return <p class="text-red-700">Error: {e.message}</p>;
        }}
      >
        <div class={`${showSide() ? "block" : "hidden"}`}>
          <div
            class="fixed inset-0 overflow-auto bg-black/80"
            onClick={close}
          ></div>

          <aside class="fixed bottom-0 top-0 w-72 bg-gradient-to-b from-purple-600 to-blue-500">
            <div class="flex items-center justify-end p-2">
              <button onClick={close}>
                <HiSolidXMark class="h-10 w-10 text-white" />
              </button>
            </div>

            <a class="flex items-center gap-2 px-2" href="/" onClick={close}>
              <HiSolidHome class="h-10 w-10 text-white" />
              <p class="text-2xl text-white">Home</p>
            </a>

            <Show when={!!user()}>
              <button
                class="flex items-center gap-2 px-2"
                onClick={() => syncLibrary.mutate()}
              >
                <HiSolidUser class="h-10 w-10 text-white" />
                <p class="text-2xl text-white">Run Sync</p>
              </button>
            </Show>

            <Show when={!!user()}>
              <button class="flex items-center gap-2 px-2">
                <HiSolidUser class="h-10 w-10 text-white" />
                <p class="text-2xl text-white">{user()?.username}</p>
              </button>
            </Show>

            <Show
              when={!!user()}
              fallback={
                <a
                  class="flex items-center gap-2 px-2"
                  href="/login"
                  onClick={close}
                >
                  <OcSignin2 class="h-10 w-10 text-white" />
                  <p class="text-2xl text-white">Log In</p>
                </a>
              }
            >
              <button
                class="flex items-center gap-2 px-2"
                onClick={() => {
                  auth.resetToken();
                  // TODO(patrik): Find better way to reload queries
                  // when logging out
                  location.reload();
                }}
              >
                <OcSignout2 class="h-10 w-10 text-white" />
                <p class="text-2xl text-white">Log Out</p>
              </button>
            </Show>
          </aside>
        </div>
        <main class="pt-16">{props.children}</main>
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
