import { Component, createContext, JSX, useContext } from "solid-js";
import { ApiClient } from "../lib/api/client";

const ApiClientContext = createContext<ApiClient>();

export const ApiClientProvider: Component<{
  client: ApiClient;
  children: JSX.Element;
}> = (props) => {
  return (
    <ApiClientContext.Provider value={props.client}>
      {props.children}
    </ApiClientContext.Provider>
  );
};

export const useApiClient = () => {
  const client = useContext(ApiClientContext);
  if (!client) {
    throw new Error("No ApiClient set");
  }

  return client;
};
