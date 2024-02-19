import { Component, JSX, createContext, useContext } from "solid-js";
import { AuthHandler } from "../AuthHandler";

const AuthContext = createContext<AuthHandler>();

export const AuthProvider: Component<{
  authHandler: AuthHandler;
  children: JSX.Element;
}> = (props) => {
  return (
    <AuthContext.Provider value={props.authHandler}>
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const handler = useContext(AuthContext);
  if (!handler) {
    throw new Error("No AuthHandler set");
  }

  return handler;
};
