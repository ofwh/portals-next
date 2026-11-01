export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue | undefined };
export interface JsonObject {
  [key: string]: JsonValue | undefined;
}
