import { dev } from "$app/environment";

type Props = {
  path: string;
  method?: "GET" | "POST";
  body?: BodyInit | null | undefined;
  headers?: HeadersInit | undefined;
}

export const enviromentFetch = ({ path, method = "GET", body, headers }: Props) => {
  console.log(`${dev ? `http://localhost:5173/api/${path}` : `https://effio.vercel.app/api/${path}`}`, method)
  return fetch(`${dev ? `http://localhost:5173/api/${path}` : `https://effio.vercel.app/api/${path}`}`, {
    method,
    body,
    headers
  });
}