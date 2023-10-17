import type { TRPCClientError } from "@trpc/client";
import { toast } from "svelte-french-toast"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createTRPCErrorNotification(e: TRPCClientError<any>) {
  toast.error(e.message)
}