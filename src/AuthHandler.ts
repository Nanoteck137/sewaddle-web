import { Accessor, Signal, createSignal } from "solid-js";
import { AuthError, getUser, signIn } from "./api/auth";

type User = {
  id: string;
  username: string;
};

export class AuthHandler {
  token: string | null;
  user: Signal<User | null>;

  constructor() {
    this.user = createSignal<User | null>(null);

    this.token = localStorage.getItem("token");
    this.updateUser();
  }

  async updateUser() {
    if (!this.token) return;

    try {
      const user = await getUser({ token: this.token });
      this.user[1](user.data);
    } catch (err) {
      if (err instanceof AuthError) {
        localStorage.removeItem("token");
      } else {
        throw err;
      }
    }
  }

  async signOut() {
    localStorage.removeItem("token");
    this.token = null;
    this.user[1](null);
  }

  async signIn(username: string, password: string) {
    const res = await signIn(username, password);

    this.token = res.data.token;
    localStorage.setItem("token", this.token);
    this.updateUser();
  }

  getUser(): Accessor<User | null> {
    return this.user[0];
  }

  async signUp(username: string, password: string, confirmPassword: string) {}
}
