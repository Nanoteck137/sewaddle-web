import { ApiGetMe, ApiPostSignin } from "../models/auth";

type UserToken = {
  token: string;
};

export async function signIn(username: string, password: string) {
  const body = {
    username,
    password,
  };

  const res = await fetch("http://localhost:3000/api/auth/signin", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });

  return await ApiPostSignin.parseAsync(await res.json());
}

export class AuthError {
  constructor() {}
}

export async function getUser(token: UserToken) {
  const res = await fetch("http://localhost:3000/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token.token}`,
    },
  });

  if (res.status != 200) {
    throw new AuthError();
  }

  return await ApiGetMe.parseAsync(await res.json());
}
