import { createQuery } from "@tanstack/solid-query";
import { For, Match, Show, Switch } from "solid-js";
import { getSeries } from "../api/serie";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const auth = useAuth();

  const series = createQuery(() => ({
    queryKey: ["series"],
    queryFn: getSeries,
  }));

  const user = auth.getUser();

  return (
    <>
      <Show when={!!user()}>
        <p>{user()?.username}</p>
        <button onClick={() => auth.signOut()}>Logout</button>
      </Show>

      <Show when={!user()}>
        <a href="/login">Login</a>
      </Show>

      <Switch>
        <Match when={series.isLoading}>
          <p>Loading...</p>
        </Match>
        <Match when={series.isError}>
          <p>Error: {series.error?.message}</p>
        </Match>
        <Match when={series.isSuccess}>
          <div class="flex flex-col">
            <For each={series.data?.series}>
              {(serie) => {
                return <a href={`/serie/${serie.id}`}>{serie.name}</a>;
              }}
            </For>
          </div>
        </Match>
      </Switch>
    </>
  );
};

export default Home;
