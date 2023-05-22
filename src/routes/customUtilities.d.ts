type KeysFromObject<T extends object> = {
  [Key in keyof T]: Key;
}[keyof T];