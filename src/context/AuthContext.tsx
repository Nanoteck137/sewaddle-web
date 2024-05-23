import { Component, createContext, JSX, useContext } from "solid-js";
import { Auth } from "../lib/api/client";

const AuthContext = createContext<Auth>();

export const AuthProvider: Component<{
  auth: Auth;
  children: JSX.Element;
}> = (props) => {
  return (
    <AuthContext.Provider value={props.auth}>
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const client = useContext(AuthContext);
  if (!client) {
    throw new Error("No Auth set");
  }

  return client;
};
