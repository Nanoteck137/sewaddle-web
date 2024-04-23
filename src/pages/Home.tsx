import { createQuery } from "@tanstack/solid-query";
import { For, Match, Switch } from "solid-js";
import { useApiClient } from "../context/ApiClientContext";

const Home = () => {
  const apiClient = useApiClient();

  const series = createQuery(() => ({
    queryKey: ["series"],
    queryFn: () => apiClient.getArtists(),
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
