import { z } from "zod";
import { AuthHandler } from "../../AuthHandler";
import { createApiResponse } from "../../models/api";
import {
  GetChapterById,
  GetSerieById,
  GetSerieChaptersById,
  GetSeries,
} from "../models/apiGen";

export default class ApiClient {
  baseUrl: string;
  auth: AuthHandler;

  constructor(baseUrl: string, auth: AuthHandler) {
    this.baseUrl = baseUrl;
    this.auth = auth;
  }

  async request<T extends z.ZodTypeAny>(
    endpoint: string,
    method: string,
    bodySchema: T,
  ) {
    const headers: Record<string, string> = {};
    if (this.auth.token) {
      headers["Authentication"] = `Bearer ${this.auth.token}`;
    }

    const res = await fetch(this.baseUrl + endpoint, {
      method,
      headers,
    });

    const Schema = createApiResponse(bodySchema, z.undefined());

    const data = await res.json();
    return await Schema.parseAsync(data);
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
}
