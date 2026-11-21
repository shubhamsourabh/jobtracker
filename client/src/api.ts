import type { User } from "./types";

const API_URL = "http://localhost:5000/api"; // use your server's port

let accessToken: string | null = null;

export function setToken(token: string | null) {
  accessToken = token;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
    credentials: "include", // sends the refresh cookie
  });

  if (!res.ok) {
    let message = "Request failed";
    try {
      const body = await res.json();
      message = body.error ?? message;
    } catch {
      // response had no JSON body, keep the default message
    }
    throw new ApiError(res.status, message);
  }

  return (await res.json()) as T;
}


export async function login(email: string, password: string) {
  const data = await request<{ token: string; user: User }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data.user;
}
