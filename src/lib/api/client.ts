import { createNanoEvents, Emitter } from "nanoevents";
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

export default class ApiClient {
  baseUrl: string;
  token?: string;
  user?: User;

  events: Emitter;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.events = createNanoEvents();

    const token = localStorage.getItem("user-token");
    if (token) {
      this.setToken(token);
    }
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

  async login(body: PostAuthSigninBody) {
    const res = await this.request(
      "/api/v1/auth/signin",
      "POST",
      PostAuthSignin,
      body,
    );

    if (res.status === "error") {
      throw new Error(res.error.message);
    }

    await this.setToken(res.data.token);
  }

  async register(body: PostAuthSignupBody) {
    const res = await this.request(
      "/api/v1/auth/signup",
      "POST",
      PostAuthSignup,
      body,
    );

    if (res.status === "error") {
      throw new Error(res.error.message);
    }

    return res.data;
  }

  async getSeries() {
    const res = await this.request("/api/v1/series", "GET", GetSeries);
    return res;
  }

  async getSerieById(id: string) {
    const res = await this.request(
      `/api/v1/series/${id}`,
      "GET",
      GetSerieById,
    );
    if (res.status === "error") {
      throw new Error(res.error.message);
    }

    return res.data;
  }

  async getSerieChaptersById(id: string) {
    const res = await this.request(
      `/api/v1/series/${id}/chapters`,
      "GET",
      GetSerieChaptersById,
    );
    if (res.status === "error") {
      throw new Error(res.error.message);
    }

    return res.data;
  }

  async getChapterById(serieId: string, chapterNumber: number) {
    const res = await this.request(
      `/api/v1/chapters/${serieId}/${chapterNumber}`,
      "GET",
      GetChapterById,
    );
    if (res.status === "error") {
      throw new Error(res.error.message);
    }

    return res.data;
  }

  async markChapters(body: PostUserMarkChaptersBody) {
    // TODO(patrik): Throw error?
    if (!this.token) return;

    const res = await this.request(
      "/api/v1/user/markChapters",
      "POST",
      z.undefined(),
      body,
    );

    if (res.status === "error") {
      throw new Error(res.error.message);
    }
  }

  async unmarkChapters(body: PostUserMarkChaptersBody) {
    // TODO(patrik): Throw error?
    if (!this.token) return;

    const res = await this.request(
      "/api/v1/user/unmarkChapters",
      "POST",
      z.undefined(),
      body,
    );
    if (res.status === "error") {
      throw new Error(res.error.message);
    }
  }

  async bookmark(body: PostUserUpdateBookmarkBody) {
    // TODO(patrik): Throw error?
    if (!this.token) return;

    const res = await this.request(
      "/api/v1/user/updateBookmark",
      "POST",
      z.undefined(),
      body,
    );
    if (res.status === "error") {
      throw new Error(res.error.message);
    }
  }

  async getUser() {
    const res = await this.request("/api/v1/auth/me", "GET", GetAuthMe);

    if (res.status === "error") {
      if (res.error.message === "Invalid Token") {
        this.resetToken();
      }

      throw new Error(res.error.message);
    }

    this.user = res.data;
  }

  async getSystemInfo() {
    const res = await this.request(
      "/api/v1/system/info",
      "GET",
      GetSystemInfo,
    );

    if (res.status === "error") {
      throw new Error(res.error.message);
    }

    return res.data;
  }

  async setup(body: PostSystemSetupBody) {
    const res = await this.request(
      "/api/v1/system/setup",
      "POST",
      z.undefined(),
      body,
    );

    if (res.status === "error") {
      throw new Error(res.error.message);
    }
  }

  async resetToken() {
    this.token = undefined;
    this.user = undefined;

    localStorage.removeItem("user-token");
    this.events.emit("onTokenChanged", this.token, this.user);
  }

  async setToken(newToken: string) {
    this.token = newToken;
    await this.getUser();

    this.events.emit("onTokenChanged", this.token, this.user);
    localStorage.setItem("user-token", newToken);
  }

  registerOnTokenChangedCallback(
    callback: (token?: string, user?: User) => void,
  ) {
    const unsub = this.events.on("onTokenChanged", callback);
    callback(this.token, this.user);

    return unsub;
  }
}
