import { createSignal, Signal } from "solid-js";
import { ApiClient } from "./client";
import { GetAuthMe } from "./types";

export type User = GetAuthMe;

export class Auth {
  apiClient: ApiClient;
  token?: string;
  userSignal: Signal<User | undefined>;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
    this.userSignal = createSignal();

    const token = localStorage.getItem("user-token");
    if (token) {
      this.setToken(token);
    }
  }

  async resetToken() {
    this.token = undefined;
    this.userSignal[1](undefined);
    this.apiClient.setToken(undefined);

    localStorage.removeItem("user-token");
    // this.events.emit("onTokenChanged", this.token, this.user);
  }

  async setToken(newToken: string) {
    this.token = newToken;
    this.apiClient.setToken(this.token);

    const res = await this.apiClient.getMe();
    if (res.status === "error") {
      this.resetToken();
      return;
    }

    this.userSignal[1](res.data);
    localStorage.setItem("user-token", newToken);
  }

  user() {
    return this.userSignal[0];
  }
}
