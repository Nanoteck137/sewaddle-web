import { createSignal, Signal } from "solid-js";
import { z } from "zod";
import { createApiResponse } from "../models/api";
import {
  GetAuthMe,
  GetChapterById,
  GetSerieById,
  GetSerieChaptersById,
  GetSeries,
  GetSystemInfo,
  PostAuthSignin,
  PostAuthSigninBody,
  PostAuthSignup,
  PostAuthSignupBody,
  PostSystemSetupBody,
  PostUserMarkChaptersBody,
  PostUserUpdateBookmarkBody,
} from "../models/apiGen";

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

export class ApiClient {
  baseUrl: string;
  token?: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token?: string) {
    this.token = token;
  }

  async request<T extends z.ZodTypeAny>(
    endpoint: string,
    method: string,
    bodySchema: T,
    body?: any,
  ) {
    const headers: Record<string, string> = {};
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    if (body) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(this.baseUrl + endpoint, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    const Schema = createApiResponse(bodySchema, z.undefined());

    const data = await res.json();
    const parsedData = await Schema.parseAsync(data);

    return parsedData;
  }

  login(body: PostAuthSigninBody) {
    return this.request("/api/v1/auth/signin", "POST", PostAuthSignin, body);
  }

  register(body: PostAuthSignupBody) {
    return this.request("/api/v1/auth/signup", "POST", PostAuthSignup, body);
  }

  getSeries() {
    return this.request("/api/v1/series", "GET", GetSeries);
  }

  getSerieById(id: string) {
    return this.request(`/api/v1/series/${id}`, "GET", GetSerieById);
  }

  getSerieChaptersById(id: string) {
    return this.request(
      `/api/v1/series/${id}/chapters`,
      "GET",
      GetSerieChaptersById,
    );
  }

  getChapterById(serieId: string, chapterNumber: number) {
    return this.request(
      `/api/v1/chapters/${serieId}/${chapterNumber}`,
      "GET",
      GetChapterById,
    );
  }

  markChapters(body: PostUserMarkChaptersBody) {
    return this.request(
      "/api/v1/user/markChapters",
      "POST",
      z.undefined(),
      body,
    );
  }

  unmarkChapters(body: PostUserMarkChaptersBody) {
    return this.request(
      "/api/v1/user/unmarkChapters",
      "POST",
      z.undefined(),
      body,
    );
  }

  bookmark(body: PostUserUpdateBookmarkBody) {
    return this.request(
      "/api/v1/user/updateBookmark",
      "POST",
      z.undefined(),
      body,
    );
  }

  getMe() {
    return this.request("/api/v1/auth/me", "GET", GetAuthMe);
  }

  getSystemInfo() {
    return this.request("/api/v1/system/info", "GET", GetSystemInfo);
  }

  setup(body: PostSystemSetupBody) {
    return this.request("/api/v1/system/setup", "POST", z.undefined(), body);
  }
}
