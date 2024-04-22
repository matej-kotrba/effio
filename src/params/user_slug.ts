import { USER_SLUG_MATCHER } from "~helpers/constants";

export function match(param) {
  return USER_SLUG_MATCHER.test(param)
}