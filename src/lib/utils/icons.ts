export function userOrAnonymousSrc(url: string | null | undefined) {
  return url ? url : "/imgs/svgs/user-circle.svg"
}