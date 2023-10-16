import type { TRPCError } from "@trpc/server";
import { toast } from "svelte-french-toast"

export function createTRPCErrorNotification(e: TRPCError) {
  toast.error(e.message)
}