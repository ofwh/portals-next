export type Reader<T> = (value: unknown) => T;
export type Parsed<R> = R extends Reader<infer T> ? T : never;

export type Shape<S> = { [K in keyof S]: Reader<unknown> };
type NormalizeIp<S extends string> = S extends `${infer Head}IPv${infer Tail}`
  ? NormalizeIp<`${Head}Ipv${Tail}`>
  : S extends `${infer Head}IPs${infer Tail}`
    ? NormalizeIp<`${Head}Ips${Tail}`>
    : S;
type IsUpper<S extends string> = S extends Uppercase<S> ? (S extends Lowercase<S> ? false : true) : false;
type IsLower<S extends string> = S extends Lowercase<S> ? (S extends Uppercase<S> ? false : true) : false;
type First<S extends string> = S extends `${infer Head}${string}` ? Head : '';
type CamelCharacters<
  S extends string,
  Previous extends string = '',
  Result extends string = '',
  CapitalizeNext extends boolean = false,
> = S extends `${infer Char}${infer Rest}`
  ? Char extends '-' | '_'
    ? CamelCharacters<Rest, Char, Result, Result extends '' ? false : true>
    : CapitalizeNext extends true
      ? CamelCharacters<Rest, Char, `${Result}${Uppercase<Char>}`>
      : IsUpper<Char> extends true
        ? CamelCharacters<
            Rest,
            Char,
            `${Result}${Result extends ''
              ? Lowercase<Char>
              : IsLower<Previous> extends true
                ? Char
                : Previous extends `${number}`
                  ? Char
                  : IsUpper<Previous> extends true
                    ? IsLower<First<Rest>> extends true
                      ? Char
                      : Lowercase<Char>
                    : Lowercase<Char>}`
          >
        : CamelCharacters<Rest, Char, `${Result}${Char}`>
  : Result;
type CamelCase<S extends string> = CamelCharacters<NormalizeIp<S>>;
export type ShapeValue<S extends Shape<S>> = {
  [K in keyof S as undefined extends Parsed<S[K]> ? never : CamelCase<K & string>]: Parsed<S[K]>;
} & {
  [K in keyof S as undefined extends Parsed<S[K]> ? CamelCase<K & string> : never]?: Parsed<S[K]>;
};
