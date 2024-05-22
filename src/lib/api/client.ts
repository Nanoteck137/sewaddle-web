import { createNanoEvents, Emitter } from "nanoevents";
import { z } from "zod";
import { createApiResponse } from "../models/api";
import {
  GetChapterById,
  GetSerieById,
  GetSerieChaptersById,
  GetSeries,
  GetSystemInfo,
} from "../models/apiGen";

export type User = {
  id: string;
  username: string;
};

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
    return await Schema.parseAsync(data);
  }

  async login(username: string, password: string) {
    const res = await this.request(
      "/api/auth/signin",
      "POST",
      z.object({ token: z.string() }),
      {
        username,
        password,
      },
    );

    if (res.status === "error") {
      throw new Error(res.error.message);
    }

    await this.setToken(res.data.token);
  }

  async register(username: string, password: string, passwordConfirm: string) {
    const res = await this.request("/api/auth/signup", "POST", z.object({}), {
      username,
      password,
      passwordConfirm,
    });

    if (res.status === "error") {
      throw new Error(res.error.message);
    }

    await this.login(username, password);
  }

  async getArtists() {
    const res = await this.request("/api/v1/series", "GET", GetSeries);
    if (res.status === "error") {
      throw new Error(res.error.message);
    }

    return res.data;
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

  async markChapters(serieId: string, chapters: number[]) {
    // TODO(patrik): Throw error?
    if (!this.token) return;

    const res = await this.request(
      "/api/v1/user/markChapters",
      "POST",
      z.undefined(),
      {
        serieId,
        chapters,
      },
    );
    if (res.status === "error") {
      throw new Error(res.error.message);
    }
  }

  async unmarkChapters(serieId: string, chapters: number[]) {
    // TODO(patrik): Throw error?
    if (!this.token) return;

    const res = await this.request(
      "/api/v1/user/unmarkChapters",
      "POST",
      z.undefined(),
      {
        serieId,
        chapters,
      },
    );
    if (res.status === "error") {
      throw new Error(res.error.message);
    }
  }

  async bookmark(serieId: string, chapter: number, page: number) {
    // TODO(patrik): Throw error?
    if (!this.token) return;

    const res = await this.request(
      "/api/v1/user/updateBookmark",
      "POST",
      z.undefined(),
      {
        serieId,
        chapter,
        page,
      },
    );
    if (res.status === "error") {
      throw new Error(res.error.message);
    }
  }

  async getUser() {
    const res = await this.request(
      "/api/auth/me",
      "GET",
      z.object({
        id: z.string().cuid2(),
        username: z.string(),
      }),
    );

    if (res.status === "error") {
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
