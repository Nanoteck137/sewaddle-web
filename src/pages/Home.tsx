import { createQuery } from "@tanstack/solid-query";
import { For, Match, Switch } from "solid-js";
import { getSeries } from "../api/serie";

const Home = () => {
  const series = createQuery(() => ({
    queryKey: ["series"],
    queryFn: getSeries,
  }));

  return (
    <>
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
