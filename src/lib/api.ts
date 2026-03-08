const AUTH_URL = "https://functions.poehali.dev/125d3a58-c4d2-44ad-a854-1cc1471c9f90";
const POSTS_URL = "https://functions.poehali.dev/33aa7b6c-9933-4c9e-883e-31be4a38a53b";

function getToken(): string | null {
  return localStorage.getItem("wtf_token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { "Content-Type": "application/json", "X-Auth-Token": token } : { "Content-Type": "application/json" };
}

async function parseBody<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === "string") return JSON.parse(parsed) as T;
    return parsed as T;
  } catch {
    return text as unknown as T;
  }
}

export const api = {
  auth: {
    register: async (username: string, email: string, password: string) => {
      const res = await fetch(`${AUTH_URL}?action=register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await parseBody<{ token: string; user: User; error?: string }>(res);
      if (!res.ok) throw new Error(data.error || "Ошибка регистрации");
      return data;
    },
    login: async (email: string, password: string) => {
      const res = await fetch(`${AUTH_URL}?action=login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await parseBody<{ token: string; user: User; error?: string }>(res);
      if (!res.ok) throw new Error(data.error || "Ошибка входа");
      return data;
    },
    me: async () => {
      const res = await fetch(`${AUTH_URL}?action=me`, { headers: authHeaders() });
      const data = await parseBody<User>(res);
      if (!res.ok) return null;
      return data;
    },
    logout: async () => {
      await fetch(`${AUTH_URL}?action=logout`, { method: "POST", headers: authHeaders() });
      localStorage.removeItem("wtf_token");
    },
  },
  posts: {
    feed: async () => {
      const res = await fetch(`${POSTS_URL}?action=feed`, { headers: authHeaders() });
      return parseBody<Post[]>(res);
    },
    create: async (content: string) => {
      const res = await fetch(`${POSTS_URL}?action=create`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ content }),
      });
      const data = await parseBody<Post & { error?: string }>(res);
      if (!res.ok) throw new Error(data.error || "Ошибка");
      return data;
    },
    like: async (post_id: number) => {
      const res = await fetch(`${POSTS_URL}?action=like`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ post_id }),
      });
      return parseBody<{ liked: boolean; likes_count: number }>(res);
    },
    comments: async (post_id: number) => {
      const res = await fetch(`${POSTS_URL}?action=comments&post_id=${post_id}`, { headers: authHeaders() });
      return parseBody<Comment[]>(res);
    },
    comment: async (post_id: number, content: string) => {
      const res = await fetch(`${POSTS_URL}?action=comment`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ post_id, content }),
      });
      const data = await parseBody<Comment & { error?: string }>(res);
      if (!res.ok) throw new Error(data.error || "Ошибка");
      return data;
    },
    profile: async (user_id: number) => {
      const res = await fetch(`${POSTS_URL}?action=profile&user_id=${user_id}`, { headers: authHeaders() });
      return parseBody<{ user: ProfileUser; posts: Post[] }>(res);
    },
  },
};

export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url?: string | null;
  bio?: string | null;
}

export interface ProfileUser {
  id: number;
  username: string;
  avatar_url?: string | null;
  bio?: string | null;
  created_at: string;
  posts_count: number;
}

export interface Post {
  id: number;
  content: string;
  image_url?: string | null;
  created_at: string;
  user: { id: number; username: string; avatar_url?: string | null };
  likes_count: number;
  comments_count: number;
  liked: boolean;
}

export interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: { id: number; username: string; avatar_url?: string | null };
}
