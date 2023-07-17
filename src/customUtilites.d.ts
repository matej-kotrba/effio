type PartialPick<T extends object, K extends keyof T> = {
  [Key in Exclude<keyof T, K>]: T[Key];
} & {
    [Key in K]?: T[Key];
  }

type ExcludePick<T extends object, K extends keyof T> = {
  [Key in Exclude<keyof T, K>]: T[Key];
}