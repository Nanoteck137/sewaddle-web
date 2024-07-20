import { z } from "zod";
import * as api from "./types";
import BaseApiClient from "./base-client";

export class ApiClient extends BaseApiClient {
  constructor(baseUrl: string) {
    super(baseUrl);
  }
  
  getSeries() {
    return this.request("/api/v1/series", "GET", api.GetSeries)
  }
  
  getSerieById(id: string) {
    return this.request(`/api/v1/series/${id}`, "GET", api.GetSerieById)
  }
  
  getSerieChapters(id: string) {
    return this.request(`/api/v1/series/${id}/chapters`, "GET", api.GetSerieChaptersById)
  }
  
  getChapters() {
    return this.request("/api/v1/chapters", "GET", api.GetChapters)
  }
  
  getChapterById(serieId: string, chapterNumber: string) {
    return this.request(`/api/v1/chapters/${serieId}/${chapterNumber}`, "GET", api.GetChapterById)
  }
  
  getLibraryStatus() {
    return this.request("/api/v1/library/status", "GET", api.GetLibraryStatus)
  }
  
  runLibrarySync() {
    return this.request("/api/v1/library/sync", "POST", z.undefined())
  }
  
  markChapters(body: api.PostUserMarkChaptersBody) {
    return this.request("/api/v1/user/markChapters", "POST", z.undefined(), body)
  }
  
  unmarkChapters(body: api.PostUserUnmarkChaptersBody) {
    return this.request("/api/v1/user/unmarkChapters", "POST", z.undefined(), body)
  }
  
  updateBookmark(body: api.PostUserUpdateBookmarkBody) {
    return this.request("/api/v1/user/updateBookmark", "POST", z.undefined(), body)
  }
  
  getSystemInfo() {
    return this.request("/api/v1/system/info", "GET", api.GetSystemInfo)
  }
  
  runSystemSetup(body: api.PostSystemSetupBody) {
    return this.request("/api/v1/system/setup", "POST", z.undefined(), body)
  }
  
  signup(body: api.PostAuthSignupBody) {
    return this.request("/api/v1/auth/signup", "POST", api.PostAuthSignup, body)
  }
  
  signin(body: api.PostAuthSigninBody) {
    return this.request("/api/v1/auth/signin", "POST", api.PostAuthSignin, body)
  }
  
  getMe() {
    return this.request("/api/v1/auth/me", "GET", api.GetAuthMe)
  }
}
