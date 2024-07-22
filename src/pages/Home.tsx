import { createQuery } from "@tanstack/solid-query";
import { For, Match, Switch } from "solid-js";
import { useApiClient } from "../context/ApiClientContext";

const Home = () => {
  const apiClient = useApiClient();

  const series = createQuery(() => ({
    queryKey: ["series"],
    queryFn: async () => {
      const res = await apiClient.getSeries();
      if (res.status === "error") throw new Error(res.error.message);
      return res.data;
    },
  }));

  // <a href={`/serie/${serie.id}`}>{serie.name}</a>

  return (
    <>
      <Switch>
        <Match when={series.isLoading}>
          <p>Loading...</p>
        </Match>
        <Match when={series.isSuccess}>
          <div class="grid gap-2 p-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <For each={series.data?.series}>
              {(serie) => {
                return (
                  <div class="flex h-full w-full items-center justify-center">
                    <a
                      class="group flex w-[300px] cursor-pointer flex-col items-center justify-center overflow-clip rounded-xl shadow hover:shadow-md"
                      href={`/serie/${serie.id}`}
                    >
                      <img
                        class="h-[420px] w-full object-cover group-hover:brightness-90"
                        src={serie.cover}
                        alt="Cover Art"
                      />
                      <p class="flex h-full w-full items-center justify-center border-t bg-white py-2 text-center group-hover:bg-gray-100">
                        {serie.name}
                      </p>
                    </a>
                  </div>
                );
              }}
            </For>
          </div>
        </Match>
      </Switch>
    </>
  );
};

export default Home;
