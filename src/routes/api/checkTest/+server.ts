import { json } from '@sveltejs/kit'

export async function POST(event) {
  const body = (await event.request.json()) as Question[]
  if (!body) return json({ error: "No body attached!" })


}